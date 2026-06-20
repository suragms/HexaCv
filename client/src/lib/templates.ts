import { ResumeTemplate, TemplateId } from '@shared/types';

export const TEMPLATES: Record<TemplateId, ResumeTemplate> = {
  'classic-ats-blue': {
    id: 'classic-ats-blue',
    name: 'Classic ATS Blue',
    description: 'Traditional, ATS-optimized design. Perfect for corporate roles.',
    preview: '/templates/classic-ats-blue.png',
    styles: {
      colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#0284c7',
        background: '#ffffff',
        text: '#1f2937',
        border: '#e5e7eb',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      layout: 'single-column',
      spacing: 'normal',
    },
  },
  'minimal-executive': {
    id: 'minimal-executive',
    name: 'Minimal Executive',
    description: 'Clean and modern. Ideal for senior positions and leadership roles.',
    preview: '/templates/minimal-executive.png',
    styles: {
      colors: {
        primary: '#000000',
        secondary: '#4b5563',
        accent: '#666666',
        background: '#ffffff',
        text: '#1a1a1a',
        border: '#f0f0f0',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      layout: 'single-column',
      spacing: 'spacious',
    },
  },
  'modern-sidebar-lite': {
    id: 'modern-sidebar-lite',
    name: 'Modern Sidebar Lite',
    description: 'Contemporary two-column layout. Great for creative professionals.',
    preview: '/templates/modern-sidebar-lite.png',
    styles: {
      colors: {
        primary: '#0f766e',
        secondary: '#14b8a6',
        accent: '#06b6d4',
        background: '#f0fdfa',
        text: '#134e4a',
        border: '#ccfbf1',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      layout: 'sidebar',
      spacing: 'normal',
    },
  },
  'technical-compact': {
    id: 'technical-compact',
    name: 'Technical Compact',
    description: 'Dense and tech-focused. Perfect for developers and engineers.',
    preview: '/templates/technical-compact.png',
    styles: {
      colors: {
        primary: '#6366f1',
        secondary: '#818cf8',
        accent: '#4f46e5',
        background: '#ffffff',
        text: '#1e293b',
        border: '#e2e8f0',
      },
      fonts: {
        heading: 'JetBrains Mono',
        body: 'Inter',
      },
      layout: 'single-column',
      spacing: 'compact',
    },
  },
};

export const DEFAULT_TEMPLATE: TemplateId = 'classic-ats-blue';

export function getTemplate(id: TemplateId): ResumeTemplate {
  return TEMPLATES[id] || TEMPLATES[DEFAULT_TEMPLATE];
}

export function getAllTemplates(): ResumeTemplate[] {
  return Object.values(TEMPLATES);
}
