import { invokeLLM } from "./_core/llm";
import { Resume } from "@shared/types";
import * as db from "./db";
import {
  filterGroundedBullets,
  filterGroundedRewrite,
  isAiGeneratedPhrase,
} from "./contentValidation";

const STRICT_REWRITE_RULES =
  "CRITICAL RULES — you MUST follow all of these:\n" +
  "1. ONLY rephrase existing facts from the candidate's content. Do NOT invent achievements, metrics, companies, degrees, tools, or responsibilities.\n" +
  "2. Do NOT add new bullet points. Rewrite only the bullets provided — same count, same underlying facts.\n" +
  "3. Do NOT use generic AI filler phrases (e.g. 'results-driven', 'synergy', 'leveraged', 'spearheaded' unless the original used similar language).\n" +
  "4. Preserve all company names, dates, technologies, and numbers exactly as stated.\n" +
  "5. Tailor wording to the candidate's job title and target role using keywords from the job description, but never fabricate experience.\n" +
  "6. If a bullet cannot be improved without inventing facts, return it nearly unchanged.\n" +
  "7. NEVER add skills, experiences, education, or sentences that are not in the source material.\n" +
  "8. Return empty strings or empty arrays rather than inventing placeholder content.\n";

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

  const headerData = headerSection?.content.header;
  const jobTitle = headerData?.jobTitle || "";
  const targetRole = headerData?.targetRole || jobTitle;

  const currentSummary = summarySection?.content.summary || "";
  const currentSkills = skillsSection?.content.skills || [];
  const currentExperiences = experienceSection?.content.experiences || [];

  const countryCode = headerSection?.content.header?.countryCode;
  const targetCountryCode = headerSection?.content.header?.targetCountryCode;

  let regionalInstructions = "";
  if (targetCountryCode) {
    try {
      const rules = await db.getCountryAtsRules(countryCode || "IN", targetCountryCode);
      if (rules) {
        regionalInstructions = `
REGIONAL TARGETING AND ATS CONTEXT (${countryCode || "IN"} to ${targetCountryCode}):
- Target country preferred formatting rules: ${rules.preferredFormatting}
- Regional hiring expectations to incorporate: ${rules.regionalHiringExpectations}
- Keywords specific to target country to weave in: ${Array.isArray(rules.keywords) ? rules.keywords.join(", ") : rules.keywords}
- Regional Terminology conversions: Replace terms from source country with target country equivalents where appropriate. Map: ${JSON.stringify(rules.regionalTerminology)}
`;
      }
    } catch (e) {
      console.warn("Failed to load regional ATS rules:", e);
    }
  }

  // Build prompt for LLM
  const prompt = buildSuggestionPrompt(
    jobDescription,
    jobTitle,
    targetRole,
    currentSummary,
    currentSkills,
    currentExperiences,
    regionalInstructions
  );

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume reviewer. Suggest improvements using ONLY facts already in the resume. " +
            "Do NOT invent skills, bullets, companies, or achievements. Do NOT add new bullet points. " +
            "Rephrase existing content to align with the job title, target role, and job description. " +
            "Always respond with valid JSON.",
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
                    description: "Existing resume skills that align with the job (do not invent new skills)",
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
                      description: "Must always be an empty array — never suggest new bullets",
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
    // Strip any invented new bullets the model may have added despite instructions
    if (suggestions.experience) {
      suggestions.experience = suggestions.experience.map((exp) => ({
        ...exp,
        newBullets: [],
        suggestedBullets: (exp.suggestedBullets || []).filter(
          (b) => b.original && b.suggested && b.original.trim() !== b.suggested.trim()
        ),
      }));
    }
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
  jobDescription: string,
  countryCode?: string,
  targetCountryCode?: string,
  jobTitle?: string,
  targetRole?: string
): Promise<string[]> {
  let regionalInstructions = "";
  if (targetCountryCode) {
    try {
      const rules = await db.getCountryAtsRules(countryCode || "IN", targetCountryCode);
      if (rules) {
        regionalInstructions = `
REGIONAL OPTIMIZATION INSTRUCTIONS (${countryCode || "IN"} -> ${targetCountryCode}):
- Target country formatting style details: ${rules.preferredFormatting}
- Target country keywords: ${Array.isArray(rules.keywords) ? rules.keywords.join(", ") : rules.keywords}
- Regional Terminology conversions (prefer target terms): ${JSON.stringify(rules.regionalTerminology)}
`;
      }
    } catch (e) {
      console.warn("Failed to load regional rules for bullet improvement:", e);
    }
  }

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          STRICT_REWRITE_RULES +
          "You are an expert resume writer. Rephrase bullet points to be clearer and better aligned with the target job — without adding new facts." +
          (regionalInstructions ? ` Adhere strictly to these regional constraints:\n${regionalInstructions}` : ""),
      },
      {
        role: "user",
        content: `Candidate Job Title: ${jobTitle || role || "(Not specified)"}
Target Role: ${targetRole || jobTitle || "(Not specified)"}
Role: ${role} at ${company}
Current Bullet Points (${currentBullets.length} total — return exactly ${currentBullets.length} rephrased bullets):
${currentBullets.map((b) => `- ${b}`).join("\n")}

Target Job Description:
${jobDescription}

Rephrase each bullet to:
1. Use stronger action verbs while keeping the same facts
2. Incorporate relevant keywords from the job description where they match existing experience
3. Stay concise and impactful
4. NEVER add metrics, tools, or achievements not in the original bullets
5. Return exactly ${currentBullets.length} bullets in the same order

Return as a JSON object with a "bullets" array of strings.`,
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
    temperature: 0.2,
  });

  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from LLM");
  }

  const result = JSON.parse(content);
  const rawBullets: string[] = Array.isArray(result.bullets) ? result.bullets : [];
  return filterGroundedBullets(currentBullets, rawBullets);
}

/**
 * Generate improved/tailored professional summary
 */
export async function improveSummary(
  currentSummary: string,
  jobDescription: string,
  jobTitle?: string,
  countryCode?: string,
  targetCountryCode?: string,
  targetRole?: string
): Promise<string> {
  if (!currentSummary.trim()) {
    return "";
  }

  let regionalInstructions = "";
  if (targetCountryCode) {
    try {
      const rules = await db.getCountryAtsRules(countryCode || "IN", targetCountryCode);
      if (rules) {
        regionalInstructions = `
REGIONAL OPTIMIZATION INSTRUCTIONS (${countryCode || "IN"} -> ${targetCountryCode}):
- Target country formatting style details: ${rules.preferredFormatting}
- Target country keywords: ${Array.isArray(rules.keywords) ? rules.keywords.join(", ") : rules.keywords}
- Regional Terminology conversions (prefer target terms): ${JSON.stringify(rules.regionalTerminology)}
`;
      }
    } catch (e) {
      console.warn("Failed to load regional rules for summary improvement:", e);
    }
  }

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          STRICT_REWRITE_RULES +
          "You are an expert resume writer. Rewrite the professional summary to be compelling and aligned with the target job — using only facts from the current summary." +
          (regionalInstructions ? ` Adhere strictly to these regional constraints:\n${regionalInstructions}` : ""),
      },
      {
        role: "user",
        content: `Current Summary: ${currentSummary || "(Not provided)"}
Candidate Job Title: ${jobTitle || "(Not specified)"}
Target Role: ${targetRole || jobTitle || "(Not specified)"}
Target Job Description:
${jobDescription}

Rewrite the professional summary to:
1. Highlight skills and experience already stated in the current summary
2. Incorporate relevant keywords from the job description only where they match existing experience
3. Align tone with the target role and job title
4. Be concise (2-4 sentences, ~50-80 words max)
5. Do NOT invent credentials, degrees, years of experience, or company names
6. If the current summary is empty, return an empty string — do not fabricate content

Return as a JSON object with a single field "summary".`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "improved_summary",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: {
              type: "string",
              description: "The rewritten professional summary",
            },
          },
          required: ["summary"],
        },
      },
    },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from LLM");
  }

  const result = JSON.parse(content);
  const rewritten = (result.summary || "").trim();

  if (!rewritten || isAiGeneratedPhrase(rewritten)) {
    return currentSummary;
  }

  return filterGroundedRewrite(currentSummary, rewritten, 0.15);
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
  jobTitle: string,
  targetRole: string,
  currentSummary: string,
  currentSkills: any[],
  currentExperiences: any[],
  regionalInstructions = ""
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

  return `Analyze this resume against the target job. Use ONLY content already in the resume — do not invent facts, skills, or bullets.
${regionalInstructions ? `\n${regionalInstructions}\n` : ""}
CANDIDATE JOB TITLE: ${jobTitle || "(from resume)"}
TARGET ROLE: ${targetRole || jobTitle || "(from resume)"}

CURRENT RESUME:
Professional Summary: ${currentSummary || "(Not provided)"}

Skills:
${skillsText || "(Not provided)"}

Experience:
${experienceText || "(Not provided)"}

TARGET JOB DESCRIPTION:
${jobDescription}

Provide:
1. A rephrased professional summary using ONLY facts from the current summary, tailored to the job title and target role
2. Existing skills from the resume that align with the job (do NOT suggest skills not already listed)
3. Keywords from the job that match the resume
4. Important keywords missing from the resume
5. For each experience entry, suggest rephrased bullet points (same count, same facts — no new bullets). Set newBullets to [] always.
6. Overall advice for tailoring this resume without adding fabricated content

Format your response as JSON with the structure provided.`;
}
