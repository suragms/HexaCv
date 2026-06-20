import { Resume } from '@shared/types';
import { cn } from '@/lib/utils';

interface ResumePreviewProps {
  resume: Resume;
  templateId?: string; // Kept for compatibility, ignored in rendering
  zoom?: number;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[13px] font-bold tracking-wide text-emerald-700 uppercase border-b border-gray-200 pb-1 mb-2 mt-5 first:mt-0">
      {children}
    </h2>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-4 space-y-0.5 mt-1">
      {items.map((item, i) => (
        <li key={i} className="text-[12.5px] leading-snug text-gray-800">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ResumePreview({ resume, zoom = 100 }: ResumePreviewProps) {
  // Locate sections
  const headerSection = resume.sections.find((s) => s.type === 'header');
  const summarySection = resume.sections.find((s) => s.type === 'summary');
  const skillsSection = resume.sections.find((s) => s.type === 'skills');
  const experienceSection = resume.sections.find((s) => s.type === 'experience');
  const projectsSection = resume.sections.find((s) => s.type === 'projects');
  const educationSection = resume.sections.find((s) => s.type === 'education');
  const certificationsSection = resume.sections.find((s) => s.type === 'certifications');
  const achievementsSection = resume.sections.find((s) => s.type === 'achievements');

  // Helper to check if section is visible
  const isVisible = (type: string) => {
    const sec = resume.sections.find(s => s.type === type);
    return sec ? sec.visible : false;
  };

  const header = headerSection?.content.header || {
    name: 'Your Full Name',
    jobTitle: 'Your Job Title',
    email: 'email@example.com',
    phone: '+91 00000 00000',
    location: 'City, Country',
    links: [],
  };

  // Extract explicit social links
  const linkedin = header.links?.find((l: any) => l.label.toLowerCase().includes('linkedin'))?.url || '';
  const github = header.links?.find((l: any) => l.label.toLowerCase().includes('github'))?.url || '';
  const portfolio = header.links?.find((l: any) => l.label.toLowerCase().includes('portfolio') || l.label.toLowerCase().includes('website'))?.url || '';

  return (
    <div className="w-full bg-slate-100 p-4 overflow-auto flex justify-center items-start">
      <div
        id="resume-pdf-content"
        className={cn(
          "bg-white shadow-xl w-[210mm] min-h-[297mm] text-slate-800 flex flex-col p-10 font-sans"
        )}
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-3xl font-bold text-emerald-800 tracking-tight">
            {header.name || 'Your Full Name'}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {(header as any).jobTitle || (header as any).title || 'Your Job Title'}
          </p>
          <p className="text-[12.5px] text-gray-700 mt-1">
            {header.email || 'email@example.com'}
            <span className="mx-2 text-gray-400">•</span>
            {header.phone || '+91 00000 00000'}
          </p>
          <p className="text-[12.5px] mt-0.5 flex justify-center items-center gap-2 flex-wrap text-gray-700">
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
                {linkedin.replace(/^https?:\/\//, "")}
              </a>
            )}
            {github && (
              <>
                <span className="text-gray-400">•</span>
                <a href={github} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
                  {github.replace(/^https?:\/\//, "")}
                </a>
              </>
            )}
            {portfolio && (
              <>
                <span className="text-gray-400">•</span>
                <a href={portfolio} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
                  {portfolio.replace(/^https?:\/\//, "")}
                </a>
              </>
            )}
            <span className="text-gray-400">•</span>
            <span>{header.location || 'City, Country'}</span>
          </p>
        </header>

        <hr className="border-t-2 border-emerald-700 mb-3" />

        {/* 1. Professional Summary */}
        {isVisible('summary') && summarySection?.content.summary && (
          <section>
            <SectionHeading>Professional Summary</SectionHeading>
            <p className="text-[12.5px] leading-snug text-gray-800">
              {summarySection.content.summary}
            </p>
          </section>
        )}

        {/* 2. Technical Skills */}
        {isVisible('skills') && skillsSection?.content.skills && skillsSection.content.skills.length > 0 && (
          <section>
            <SectionHeading>Technical Skills</SectionHeading>
            <div className="space-y-0.5">
              {skillsSection.content.skills.map((skillGroup: any, idx: number) => (
                <p key={idx} className="text-[12.5px] leading-snug">
                  <span className="font-bold text-emerald-800">{skillGroup.category}: </span>
                  <span className="text-gray-800">
                    {Array.isArray(skillGroup.skills) ? skillGroup.skills.join(', ') : skillGroup.skills}
                  </span>
                </p>
              ))}
            </div>
          </section>
        )}

        {/* 3. Experience */}
        {isVisible('experience') && experienceSection?.content.experiences && experienceSection.content.experiences.length > 0 && (
          <section>
            <SectionHeading>Experience</SectionHeading>
            {experienceSection.content.experiences.map((exp: any, idx: number) => (
              <div key={exp.id || idx} className="mb-3 last:mb-0">
                <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                  <h3 className="font-bold text-[13px] text-gray-900">
                    {exp.role} | {exp.company}
                  </h3>
                  <span className="text-[11.5px] italic text-gray-500 whitespace-nowrap">
                    {exp.startDate} – {exp.endDate || 'Present'}
                  </span>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <BulletList items={exp.description} />
                )}
              </div>
            ))}
          </section>
        )}

        {/* 4. Projects */}
        {isVisible('projects') && projectsSection?.content.projects && projectsSection.content.projects.length > 0 && (
          <section>
            <SectionHeading>Projects</SectionHeading>
            <div className="mb-3 last:mb-0">
              <p className="text-[12px] italic font-semibold text-gray-500 mb-1">Technical Projects</p>
              {projectsSection.content.projects.map((proj: any, idx: number) => (
                <div key={proj.id || idx} className="mb-2 last:mb-0">
                  <p className="text-[13px]">
                    <span className="font-bold text-gray-900">{proj.name}</span>
                    {proj.link && <span className="text-emerald-700 font-medium"> ↗ Live</span>}
                    {proj.technologies && (
                      <span className="text-gray-500 italic">
                        {" "}— {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                      </span>
                    )}
                  </p>
                  {proj.description && (
                    <BulletList
                      items={
                        Array.isArray(proj.description)
                          ? proj.description
                          : proj.description.split('\n').filter(Boolean)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Education */}
        {isVisible('education') && educationSection?.content.educations && educationSection.content.educations.length > 0 && (
          <section>
            <SectionHeading>Education</SectionHeading>
            {educationSection.content.educations.map((edu: any, idx: number) => (
              <div key={edu.id || idx} className="mb-2 last:mb-0">
                <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                  <h3 className="font-bold text-[13px] text-gray-900">{edu.degree} in {edu.field}</h3>
                  <span className="text-[11.5px] italic text-gray-500 whitespace-nowrap">
                    {edu.graduationDate}
                  </span>
                </div>
                <p className="text-[12px] text-gray-600">
                  {edu.institution}
                  {edu.gpa && <> | GPA: {edu.gpa}</>}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* 6. Certifications */}
        {isVisible('certifications') && certificationsSection?.content.certifications && certificationsSection.content.certifications.length > 0 && (
          <section>
            <SectionHeading>Certifications</SectionHeading>
            <p className="text-[12.5px] text-gray-800 leading-snug">
              {certificationsSection.content.certifications
                .map((cert: any) => `${cert.name} — ${cert.issuer} (${cert.date || ''})`)
                .join("  ·  ")}
            </p>
          </section>
        )}

        {/* 7. Achievements */}
        {isVisible('achievements') && achievementsSection?.content.achievements && achievementsSection.content.achievements.length > 0 && (
          <section>
            <SectionHeading>Achievements</SectionHeading>
            <BulletList items={achievementsSection.content.achievements} />
          </section>
        )}
      </div>
    </div>
  );
}
