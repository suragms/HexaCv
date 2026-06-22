import { Resume, ResumeSection } from "@shared/types";
import { nanoid } from "nanoid";

/** Canonical 10-section resume structure (matches parser output order) */
export const STANDARD_SECTION_ORDER: { type: ResumeSection["type"]; order: number; label: string }[] = [
  { type: "header", order: 1, label: "Header" },
  { type: "summary", order: 2, label: "Summary" },
  { type: "skills", order: 3, label: "Skills" },
  { type: "experience", order: 4, label: "Experience" },
  { type: "projects", order: 5, label: "Projects" },
  { type: "education", order: 6, label: "Education" },
  { type: "certifications", order: 7, label: "Certifications" },
  { type: "achievements", order: 8, label: "Achievements" },
  { type: "languages", order: 9, label: "Languages" },
  { type: "references", order: 10, label: "References" },
];

const defaultContentFor = (type: ResumeSection["type"]): ResumeSection["content"] => {
  switch (type) {
    case "header":
      return {
        header: {
          name: "",
          email: "",
          phone: "",
          location: "",
          links: [],
          jobTitle: "",
          targetRole: "",
          countryCode: "",
          locationFields: {},
          targetCountryCode: "",
        },
      };
    case "summary":
      return { summary: "" };
    case "skills":
      return { skills: [] };
    case "experience":
      return { experiences: [] };
    case "projects":
      return { projects: [] };
    case "education":
      return { educations: [] };
    case "certifications":
      return { certifications: [] };
    case "achievements":
      return { achievements: [] };
    case "languages":
      return { languages: [] };
    case "references":
      return { references: [] };
    default:
      return {};
  }
};

/** Ensure resume always has all 10 standard sections in correct order */
export function ensureStandardResumeSections(resume: Resume): Resume {
  const byType = new Map(resume.sections.map((s) => [s.type, s]));
  const standardSections: ResumeSection[] = STANDARD_SECTION_ORDER.map((def) => {
    const existing = byType.get(def.type);
    if (existing) {
      return { ...existing, order: def.order, visible: existing.visible !== false };
    }
    return {
      id: nanoid(),
      type: def.type,
      order: def.order,
      visible: true,
      content: defaultContentFor(def.type),
    };
  });

  const extraSections = resume.sections
    .filter((s) => !STANDARD_SECTION_ORDER.some((d) => d.type === s.type))
    .map((s, i) => ({ ...s, order: 10 + i + 1 }));

  return {
    ...resume,
    sections: [...standardSections, ...extraSections],
  };
}
