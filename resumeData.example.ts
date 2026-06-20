// resumeData.example.ts
// Example data object — replace every value with your own content,
// then pass this object into <ResumeTemplate data={resumeData} />

import type { ResumeData } from "./ResumeTemplate.types";

export const resumeData: ResumeData = {
  contact: {
    name: "Your Full Name",
    title: "Your Job Title | Your Specialization",
    email: "email@example.com",
    phone: "+91 00000 00000",
    linkedin: "https://linkedin.com/in/yourname",
    github: "https://github.com/yourname",
    portfolio: "https://yourportfolio.com",
    location: "City, Country",
  },

  summary:
    "Results-driven [Your Role/Title] with [X]+ years of experience building and shipping [type of systems]. " +
    "Proficient across [list 2-4 areas]. Passionate about [the kind of problems you like solving].",

  skills: [
    { label: "Frontend", value: "e.g., React, TypeScript, Tailwind CSS, HTML5/CSS3" },
    { label: "Backend", value: "e.g., Node.js, Django, ASP.NET Core, REST API design" },
    { label: "AI / ML", value: "e.g., LLM integration, TensorFlow, Scikit-learn" },
    { label: "Databases", value: "e.g., PostgreSQL, MongoDB, Redis, Firebase" },
    { label: "DevOps / Cloud", value: "e.g., Docker, GitHub Actions, AWS, Vercel, Render" },
    { label: "Tools", value: "e.g., Git, Figma, Postman, VS Code" },
  ],

  experience: [
    {
      title: "Your Job Title | Company Name",
      dateRange: "Month Year – Present",
      bullets: [
        "Describe a key achievement with measurable impact — what you built, the scale, and the result.",
        "Describe another responsibility or project, naming the tech stack and outcome.",
        "Add a third bullet focused on a different skill area (leadership, optimization, client work).",
      ],
    },
    {
      title: "Previous Job Title | Previous Company",
      dateRange: "Month Year – Month Year",
      bullets: [
        "Summarize your core responsibility and a concrete contribution.",
        "Mention any collaboration, process improvement, or technology you applied.",
      ],
    },
  ],

  projects: [
    {
      category: "AI / Machine Learning",
      projects: [
        {
          name: "Project Name",
          tag: "[Capstone]",
          stack: "Tech Stack, Tech Stack, Tech Stack",
          bullets: [
            "Describe what the project does, its scale, and a standout technical detail.",
            "Mention a specific algorithm or architecture decision that demonstrates depth.",
          ],
        },
      ],
    },
    {
      category: "Full-Stack Web Applications",
      projects: [
        {
          name: "Project Name",
          tag: "↗ Live",
          stack: "Tech Stack, Tech Stack",
          deployment: "[Deployed: Vercel]",
          bullets: [
            "Describe key modules or roles within the application.",
            "Highlight a technical detail: a data model, calculation, or integration worth noting.",
          ],
        },
      ],
    },
  ],

  education: [
    {
      degree: "Degree Name (e.g., Master of Science in Computer Science)",
      institution: "University Name — Location",
      detail: "Grade/GPA/Distinction",
      dateRange: "Year – Year",
    },
    {
      degree: "Degree Name (e.g., Bachelor's Degree)",
      institution: "University Name — Location",
      detail: "Grade",
      dateRange: "Year – Year",
    },
  ],

  certifications: ["Certification Name — Issuer (Month Year)", "Certification Name — Issuer (Month Year)"],

  achievements: [
    "Quantify a key achievement (scale, revenue impact, users served, projects shipped).",
    "Mention an award, recognition, or distinction relevant to your field.",
    "Add any other notable accomplishment that strengthens your candidacy.",
  ],
};
