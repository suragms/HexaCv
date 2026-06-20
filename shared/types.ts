// Resume Section Types
export type ResumeSectionType = 'header' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications' | 'achievements';

export interface ResumeHeader {
  name: string;
  email: string;
  phone: string;
  location: string;
  links: { label: string; url: string }[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  date?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface ResumeSection {
  id: string;
  type: ResumeSectionType;
  order: number;
  visible: boolean;
  content: {
    header?: ResumeHeader;
    summary?: string;
    skills?: SkillCategory[];
    experiences?: Experience[];
    projects?: Project[];
    educations?: Education[];
    certifications?: Certification[];
    achievements?: string[];
  };
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  jobDescriptionId?: string;
  sections: ResumeSection[];
  createdAt: Date;
  updatedAt: Date;
}

// Template Types
export type TemplateId = 'classic-ats-blue' | 'minimal-executive' | 'modern-sidebar-lite' | 'technical-compact';

export interface TemplateStyles {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: 'single-column' | 'two-column' | 'sidebar';
  spacing: 'compact' | 'normal' | 'spacious';
}

export interface ResumeTemplate {
  id: TemplateId;
  name: string;
  description: string;
  preview: string;
  styles: TemplateStyles;
}

// Job Description Types
export interface JobDescription {
  id: string;
  userId?: string;
  title: string;
  description: string;
  keywords: string[];
  isCustom: boolean;
  createdAt: Date;
}

// Parsed Resume Types
export interface ParsedResume {
  header: Partial<ResumeHeader>;
  summary: string;
  skills: SkillCategory[];
  experiences: Experience[];
  projects: Project[];
  educations: Education[];
  certifications: Certification[];
  achievements?: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
