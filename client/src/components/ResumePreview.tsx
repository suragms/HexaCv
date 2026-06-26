import { useState, useEffect, useMemo, type Ref } from 'react';
import { Resume } from '@shared/types';
import { cn } from '@/lib/utils';

interface ResumePreviewProps {
  resume: Resume;
  templateId?: string; // Kept for compatibility, ignored in rendering
  zoom?: number;
  contentRef?: Ref<HTMLDivElement>;
  contentId?: string;
}

function formatDateForResume(dateStr: string, dateFormat: string): string {
  if (!dateStr) return '';
  if (dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'current') return dateStr;
  
  const match = dateStr.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!match) return dateStr; // fallback for free text e.g. "Aug 2024"

  const [_, year, month, day = '01'] = match;
  let formatted = dateFormat;
  formatted = formatted.replace(/YYYY/g, year);
  formatted = formatted.replace(/MM/g, month);
  formatted = formatted.replace(/DD/g, day);
  return formatted;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 
      className="text-[14.5px] font-bold tracking-wider text-emerald-800 uppercase border-b border-slate-200 pb-1 mb-2 mt-5 first:mt-0"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {children}
    </h2>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul 
      className="list-disc pl-5 space-y-1 mt-1 text-slate-700" 
      style={{ 
        listStyleType: 'disc', 
        paddingLeft: '1.25rem',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {items.map((item, i) => (
        <li 
          key={i} 
          className="text-[13px] leading-relaxed text-slate-700 pl-0.5 marker:text-emerald-700"
          style={{ listStyleType: 'disc' }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ResumePreview({ resume, zoom = 100, contentRef, contentId = 'resume-pdf-content' }: ResumePreviewProps) {
  const [countriesList, setCountriesList] = useState<any[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('/countries');
        if (res.ok) {
          const data = await res.json();
          setCountriesList(data);
        }
      } catch (err) {
        console.error("Error loading countries for preview:", err);
      }
    };
    fetchCountries();
  }, []);

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
    countryCode: '',
    locationFields: {}
  };

  const selectedCountry = useMemo(() => {
    return countriesList.find(c => c.code === header.countryCode);
  }, [countriesList, header.countryCode]);

  const dateFormat = selectedCountry?.dateFormat || 'DD/MM/YYYY';

  const formattedLocation = useMemo(() => {
    if (header.countryCode && header.locationFields && selectedCountry) {
      let formatted = selectedCountry.addressFormat || '{city}, {state}, {country}';
      const fields = header.locationFields as any;
      formatted = formatted.replace(/{state}/g, fields.state || '');
      formatted = formatted.replace(/{district}/g, fields.district || '');
      formatted = formatted.replace(/{city}/g, fields.city || '');
      formatted = formatted.replace(/{postalCode}/g, fields.postalCode || '');
      formatted = formatted.replace(/{country}/g, selectedCountry.name || '');

      return formatted
        .replace(/,\s*,/g, ',')
        .replace(/\s+-\s*$/g, '')
        .replace(/-\s*$/g, '')
        .replace(/,\s*$/g, '')
        .replace(/^\s*,\s*/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
    return header.location || 'City, Country';
  }, [header, selectedCountry]);

  // Extract explicit social links
  const linkedin = header.links?.find((l: any) => l.label.toLowerCase().includes('linkedin'))?.url || '';
  const github = header.links?.find((l: any) => l.label.toLowerCase().includes('github'))?.url || '';
  const portfolio = header.links?.find((l: any) => l.label.toLowerCase().includes('portfolio') || l.label.toLowerCase().includes('website'))?.url || '';

  return (
    <div className="w-full h-full bg-slate-100 p-2 sm:p-4 overflow-auto flex justify-center items-start">
      <div
        id={contentId}
        ref={contentRef}
        className={cn(
          "bg-white shadow-xl w-[210mm] min-h-[297mm] text-slate-800 flex flex-col p-10 origin-top"
        )}
        style={{
          zoom: zoom / 100,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
            <span>{formattedLocation}</span>
          </p>
        </header>

        <hr className="border-t-2 border-emerald-700 mb-3" />

        {/* Render sections in user-defined order */}
        {[...resume.sections]
          .sort((a, b) => a.order - b.order)
          .filter((sec) => sec.type !== 'header')
          .map((sec) => {
            if (!sec.visible) return null;

            switch (sec.type) {
              case 'summary':
                if (!sec.content.summary) return null;
                return (
                  <section key={sec.id}>
                    <SectionHeading>Professional Summary</SectionHeading>
                    <p className="text-[13px] leading-relaxed text-slate-700 font-sans">
                      {sec.content.summary}
                    </p>
                  </section>
                );
              case 'skills':
                if (!sec.content.skills || sec.content.skills.length === 0) return null;
                return (
                  <section key={sec.id}>
                    <SectionHeading>Technical Skills</SectionHeading>
                    <div className="space-y-1">
                      {sec.content.skills.map((skillGroup: any, idx: number) => (
                        <p key={idx} className="text-[13px] leading-relaxed font-sans">
                          <span className="font-semibold text-emerald-900">{skillGroup.category}: </span>
                          <span className="text-slate-700">
                            {Array.isArray(skillGroup.skills) ? skillGroup.skills.join(', ') : skillGroup.skills}
                          </span>
                        </p>
                      ))}
                    </div>
                  </section>
                );
              case 'experience':
                if (!sec.content.experiences || sec.content.experiences.length === 0) return null;
                return (
                  <section key={sec.id}>
                    <SectionHeading>Experience</SectionHeading>
                    {sec.content.experiences.map((exp: any, idx: number) => (
                      <div key={exp.id || idx} className="mb-4 last:mb-0">
                        <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                          <h3 className="font-semibold text-[13.5px] text-slate-900 font-sans">
                            {exp.role} | {exp.company}
                          </h3>
                          <span className="text-[11.5px] font-medium text-slate-500 whitespace-nowrap font-sans">
                            {formatDateForResume(exp.startDate, dateFormat)} – {formatDateForResume(exp.endDate || 'Present', dateFormat)}
                          </span>
                        </div>
                        {exp.description && exp.description.length > 0 && (
                          <BulletList items={exp.description} />
                        )}
                      </div>
                    ))}
                  </section>
                );
              case 'projects':
                if (!sec.content.projects || sec.content.projects.length === 0) return null;
                return (
                  <section key={sec.id}>
                    <SectionHeading>Projects</SectionHeading>
                    <div className="mb-3 last:mb-0">
                      <p className="text-[12px] italic font-semibold text-gray-500 mb-1">Technical Projects</p>
                      {sec.content.projects.map((proj: any, idx: number) => (
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
                );
              case 'education':
                if (!sec.content.educations || sec.content.educations.length === 0) return null;
                return (
                  <section key={sec.id}>
                    <SectionHeading>Education</SectionHeading>
                    {sec.content.educations.map((edu: any, idx: number) => (
                      <div key={edu.id || idx} className="mb-2 last:mb-0">
                        <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                          <h3 className="font-bold text-[13px] text-gray-900">{edu.degree} in {edu.field}</h3>
                          <span className="text-[11.5px] italic text-gray-500 whitespace-nowrap">
                            {formatDateForResume(edu.graduationDate, dateFormat)}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-600">
                          {edu.institution}
                          {edu.gpa && <> | GPA: {edu.gpa}</>}
                        </p>
                      </div>
                    ))}
                  </section>
                );
              case 'certifications':
                if (!sec.content.certifications || sec.content.certifications.length === 0) return null;
                return (
                  <section key={sec.id}>
                    <SectionHeading>Certifications</SectionHeading>
                    <p className="text-[12.5px] text-gray-800 leading-snug">
                      {sec.content.certifications
                        .map((cert: any) => `${cert.name} — ${cert.issuer} (${formatDateForResume(cert.date || '', dateFormat)})`)
                        .join("  ·  ")}
                    </p>
                  </section>
                );
              case 'achievements':
                if (!sec.content.achievements || sec.content.achievements.length === 0) return null;
                return (
                  <section key={sec.id}>
                    <SectionHeading>Achievements</SectionHeading>
                    <BulletList items={sec.content.achievements} />
                  </section>
                );
              case 'languages':
                if (!sec.content.languages || sec.content.languages.length === 0) return null;
                return (
                  <section key={sec.id}>
                    <SectionHeading>Languages</SectionHeading>
                    <p className="text-[12.5px] text-gray-800 leading-snug">
                      {sec.content.languages
                        .map((lang: any) => `${lang.language} (${lang.proficiency || 'Conversational'})`)
                        .join("  ·  ")}
                    </p>
                  </section>
                );
              case 'references':
                if (!sec.content.references || sec.content.references.length === 0) return null;
                return (
                  <section key={sec.id}>
                    <SectionHeading>References</SectionHeading>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {sec.content.references.map((ref: any, idx: number) => (
                        <div key={ref.id || idx} className="text-[12px]">
                          <p className="font-bold text-gray-900">{ref.name}</p>
                          {ref.availableOnRequest ? (
                            <p className="text-gray-500 italic text-[11px] mt-0.5">Available upon request</p>
                          ) : (
                            <>
                              <p className="text-gray-600 text-[11.5px]">{ref.title} {ref.company ? `at ${ref.company}` : ''}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                {ref.email && <span>{ref.email}</span>}
                                {ref.email && ref.phone && <span className="mx-1.5">•</span>}
                                {ref.phone && <span>{ref.phone}</span>}
                              </p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              case 'custom':
                if (!sec.content.customSections || sec.content.customSections.length === 0) return null;
                return (
                  <div key={sec.id} className="space-y-4">
                    {sec.content.customSections.map((customSect: any, sectIdx: number) => {
                      if (!customSect.title || !customSect.items || customSect.items.length === 0) return null;
                      return (
                        <section key={customSect.id || sectIdx}>
                          <SectionHeading>{customSect.title}</SectionHeading>
                          {customSect.items.map((item: any, itemIdx: number) => (
                            <div key={item.id || itemIdx} className="mb-2 last:mb-0">
                              <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                                <h3 className="font-bold text-[13px] text-gray-900">{item.title}</h3>
                                {item.subtitle && (
                                  <span className="text-[11.5px] italic text-gray-500 whitespace-nowrap">
                                    {item.subtitle}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-[12px] text-gray-700 leading-snug mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </section>
                      );
                    })}
                  </div>
                );
              default:
                return null;
            }
          })}
      </div>
    </div>
  );
}
