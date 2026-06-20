import { invokeLLM } from "./_core/llm";
import { Resume } from "@shared/types";

export interface BulletSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

export interface ExperienceSuggestions {
  role: string;
  company: string;
  currentBullets: string[];
  suggestedBullets: BulletSuggestion[];
  newBullets: string[];
}

export interface SkillSuggestions {
  currentSkills: string[];
  suggestedSkills: string[];
  keywordMatches: string[];
  missingKeywords: string[];
}

export interface ResumeSuggestions {
  summary?: string;
  skills: SkillSuggestions;
  experience: ExperienceSuggestions[];
  overallAdvice: string;
}

/**
 * Generate AI-powered suggestions for resume content based on job description
 */
export async function generateResumeSuggestions(
  resume: Resume,
  jobDescription: string
): Promise<ResumeSuggestions> {
  if (!jobDescription.trim()) {
    throw new Error("Job description is required");
  }

  // Extract current resume content
  const headerSection = resume.sections.find((s) => s.type === "header");
  const summarySection = resume.sections.find((s) => s.type === "summary");
  const skillsSection = resume.sections.find((s) => s.type === "skills");
  const experienceSection = resume.sections.find((s) => s.type === "experience");

  const currentSummary = summarySection?.content.summary || "";
  const currentSkills = skillsSection?.content.skills || [];
  const currentExperiences = experienceSection?.content.experiences || [];

  // Build prompt for LLM
  const prompt = buildSuggestionPrompt(
    jobDescription,
    currentSummary,
    currentSkills,
    currentExperiences
  );

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer and career coach. Your task is to provide specific, actionable suggestions to improve a resume for a target job. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume_suggestions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description:
                  "Suggested professional summary tailored to the job description",
              },
              skills: {
                type: "object",
                properties: {
                  suggestedSkills: {
                    type: "array",
                    items: { type: "string" },
                    description: "New skills to add based on job requirements",
                  },
                  keywordMatches: {
                    type: "array",
                    items: { type: "string" },
                    description: "Keywords from job description that match resume",
                  },
                  missingKeywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Important keywords missing from resume",
                  },
                },
                required: ["suggestedSkills", "keywordMatches", "missingKeywords"],
              },
              experience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    role: { type: "string" },
                    company: { type: "string" },
                    suggestedBullets: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          original: { type: "string" },
                          suggested: { type: "string" },
                          reason: { type: "string" },
                        },
                        required: ["original", "suggested", "reason"],
                      },
                    },
                    newBullets: {
                      type: "array",
                      items: { type: "string" },
                      description: "New bullet points to add for this role",
                    },
                  },
                  required: ["role", "company", "suggestedBullets", "newBullets"],
                },
              },
              overallAdvice: {
                type: "string",
                description: "General advice for tailoring resume to this job",
              },
            },
            required: ["skills", "experience", "overallAdvice"],
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }

    const suggestions = JSON.parse(content) as ResumeSuggestions;
    return suggestions;
  } catch (error) {
    console.error("Error generating resume suggestions:", error);
    throw error;
  }
}

/**
 * Generate keyword alignment score between resume and job description
 */
export async function calculateKeywordAlignment(
  resume: Resume,
  jobDescription: string
): Promise<{ score: number; matchedKeywords: string[]; missingKeywords: string[] }> {
  if (!jobDescription.trim()) {
    return { score: 0, matchedKeywords: [], missingKeywords: [] };
  }

  const resumeText = extractResumeText(resume);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert in resume optimization and ATS (Applicant Tracking System) keyword matching. Analyze the resume and job description to identify keyword matches and gaps.",
      },
      {
        role: "user",
        content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nProvide a JSON response with:
1. alignment_score (0-100): How well the resume matches the job description
2. matched_keywords: Array of keywords from the job that appear in the resume
3. missing_keywords: Array of important keywords from the job that are missing from the resume`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "keyword_alignment",
        strict: true,
        schema: {
          type: "object",
          properties: {
            alignment_score: {
              type: "integer",
              description: "Score from 0-100",
              minimum: 0,
              maximum: 100,
            },
            matched_keywords: {
              type: "array",
              items: { type: "string" },
            },
            missing_keywords: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["alignment_score", "matched_keywords", "missing_keywords"],
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from LLM");
  }

  const result = JSON.parse(content);
  return {
    score: result.alignment_score,
    matchedKeywords: result.matched_keywords,
    missingKeywords: result.missing_keywords,
  };
}

/**
 * Generate improved bullet points for a specific experience entry
 */
export async function improveBulletPoints(
  role: string,
  company: string,
  currentBullets: string[],
  jobDescription: string
): Promise<string[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert resume writer. Improve bullet points to be more impactful and aligned with job requirements. Focus on quantifiable results, action verbs, and relevant skills.",
      },
      {
        role: "user",
        content: `Role: ${role} at ${company}
Current Bullet Points:
${currentBullets.map((b) => `- ${b}`).join("\n")}

Target Job Description:
${jobDescription}

Provide improved versions of these bullet points that:
1. Highlight relevant skills and achievements
2. Use strong action verbs
3. Include quantifiable results where possible
4. Align with the job description keywords
5. Are concise and impactful

Return as a JSON array of strings.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "improved_bullets",
        strict: true,
        schema: {
          type: "object",
          properties: {
            bullets: {
              type: "array",
              items: { type: "string" },
              description: "Improved bullet points",
            },
          },
          required: ["bullets"],
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from LLM");
  }

  const result = JSON.parse(content);
  return result.bullets;
}

/**
 * Extract all text from resume for analysis
 */
function extractResumeText(resume: Resume): string {
  const parts: string[] = [];

  resume.sections.forEach((section) => {
    if (section.type === "header" && section.content.header) {
      const h = section.content.header;
      parts.push(`${h.name} ${h.email} ${h.phone} ${h.location}`);
    } else if (section.type === "summary" && section.content.summary) {
      parts.push(section.content.summary);
    } else if (section.type === "skills" && section.content.skills) {
      section.content.skills.forEach((skillGroup: any) => {
        parts.push(`${skillGroup.category}: ${skillGroup.skills.join(", ")}`);
      });
    } else if (section.type === "experience" && section.content.experiences) {
      section.content.experiences.forEach((exp: any) => {
        parts.push(`${exp.role} at ${exp.company}`);
        if (Array.isArray(exp.description)) {
          parts.push(exp.description.join(" "));
        } else if (exp.description) {
          parts.push(exp.description);
        }
      });
    } else if (section.type === "projects" && section.content.projects) {
      section.content.projects.forEach((proj: any) => {
        parts.push(`${proj.name}: ${proj.description}`);
      });
    } else if (section.type === "education" && section.content.educations) {
      section.content.educations.forEach((edu: any) => {
        parts.push(`${edu.degree} in ${edu.field} from ${edu.institution}`);
      });
    } else if (section.type === "certifications" && section.content.certifications) {
      section.content.certifications?.forEach((cert: any) => {
        parts.push(`${cert.name} from ${cert.issuer}`);
      });
    }
  });

  return parts.join("\n");
}

/**
 * Build the prompt for generating resume suggestions
 */
function buildSuggestionPrompt(
  jobDescription: string,
  currentSummary: string,
  currentSkills: any[],
  currentExperiences: any[]
): string {
  const skillsText = currentSkills
    .map((sg: any) => `${sg.category}: ${sg.skills.join(", ")}`)
    .join("\n");

  const experienceText = currentExperiences
    .map((exp: any) => {
      const bullets = Array.isArray(exp.description)
        ? exp.description.map((b: string) => `  - ${b}`).join("\n")
        : `  - ${exp.description}`;
      return `${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"})\n${bullets}`;
    })
    .join("\n\n");

  return `Please analyze this resume and job description, then provide specific suggestions to improve the resume for this job.

CURRENT RESUME:
Professional Summary: ${currentSummary || "(Not provided)"}

Skills:
${skillsText || "(Not provided)"}

Experience:
${experienceText || "(Not provided)"}

TARGET JOB DESCRIPTION:
${jobDescription}

Please provide:
1. An improved professional summary tailored to this job
2. Suggested skills to add based on job requirements
3. Keywords from the job that match the resume
4. Important keywords missing from the resume
5. For each experience entry, suggest improvements to bullet points and new bullets to add
6. Overall advice for tailoring this resume to the job

Format your response as JSON with the structure provided.`;
}
