import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { ParsedResume, Experience, Project, Education, Certification, SkillCategory } from '@shared/types';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

interface ResumeScratchBuilderProps {
  onComplete: (data: any) => void;
}

export default function ResumeScratchBuilder({ onComplete }: ResumeScratchBuilderProps) {
  const [currentStep, setCurrentStep] = useState<'header' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications' | 'achievements' | 'review'>('header');

  const [header, setHeader] = useState({
    name: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  });

  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<SkillCategory[]>([
    { category: 'Frontend', skills: ['React', 'TypeScript', 'Tailwind CSS'] },
    { category: 'Backend', skills: ['Node.js', 'Express', 'SQL'] }
  ]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [achievementInput, setAchievementInput] = useState('');

  const steps = [
    { id: 'header', label: 'Header', icon: '👤' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'skills', label: 'Skills', icon: '⭐' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'certifications', label: 'Certifications', icon: '📜' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'review', label: 'Review', icon: '✓' },
  ];

  const handleNextStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as any);
    }
  };

  const handlePrevStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as any);
    }
  };

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: nanoid(),
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        current: false,
        description: []
      }
    ]);
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        id: nanoid(),
        name: '',
        description: '',
        technologies: [],
        link: '',
        date: ''
      }
    ]);
  };

  const handleAddEducation = () => {
    setEducations([
      ...educations,
      {
        id: nanoid(),
        institution: '',
        degree: '',
        field: '',
        graduationDate: '',
        gpa: ''
      }
    ]);
  };

  const handleAddCertification = () => {
    setCertifications([
      ...certifications,
      {
        id: nanoid(),
        name: '',
        issuer: '',
        date: '',
        link: ''
      }
    ]);
  };

  const handleFinish = () => {
    if (!header.name || !header.email) {
      toast.error('Please complete your name and email in the Header step.');
      setCurrentStep('header');
      return;
    }

    const finalLinks = [
      { label: 'LinkedIn', url: header.linkedin },
      { label: 'GitHub', url: header.github },
      { label: 'Portfolio', url: header.portfolio }
    ].filter(l => l.url);

    const payload = {
      header: {
        name: header.name,
        jobTitle: header.jobTitle,
        email: header.email,
        phone: header.phone,
        location: header.location,
        links: finalLinks
      },
      summary,
      skills,
      experiences,
      projects,
      educations,
      certifications,
      achievements
    };

    onComplete(payload as any);
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(step.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition ${
              currentStep === step.id
                ? 'bg-emerald-600 text-white font-medium shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm'
            }`}
          >
            <span>{step.icon}</span>
            <span>{step.label}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">
            {steps.find((s) => s.id === currentStep)?.label}
          </CardTitle>
          <CardDescription>
            {currentStep === 'header' && 'Provide your name, title, contact details, and social links.'}
            {currentStep === 'summary' && 'Write a compelling professional summary.'}
            {currentStep === 'skills' && 'Add categorized skills to make your resume keyword-rich.'}
            {currentStep === 'experience' && 'Detail your work history and achievements.'}
            {currentStep === 'projects' && 'Add significant side projects or work achievements.'}
            {currentStep === 'education' && 'Add your degree, school, and academic achievements.'}
            {currentStep === 'certifications' && 'List relevant certifications and professional courses.'}
            {currentStep === 'achievements' && 'List key quantified achievements.'}
            {currentStep === 'review' && 'Verify details before loading into the live resume editor.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Step */}
          {currentStep === 'header' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={header.name}
                    onChange={(e) => setHeader({ ...header, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Full Stack Engineer"
                    value={header.jobTitle}
                    onChange={(e) => setHeader({ ...header, jobTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={header.email}
                    onChange={(e) => setHeader({ ...header, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={header.phone}
                    onChange={(e) => setHeader({ ...header, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={header.location}
                    onChange={(e) => setHeader({ ...header, location: e.target.value })}
                  />
                </div>
              </div>

              {/* Social links */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <Label className="text-sm font-semibold">Social and Website Profiles</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      placeholder="linkedin.com/in/username"
                      value={header.linkedin}
                      onChange={(e) => setHeader({ ...header, linkedin: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input
                      id="github"
                      placeholder="github.com/username"
                      value={header.github}
                      onChange={(e) => setHeader({ ...header, github: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolio">Portfolio Website URL</Label>
                    <Input
                      id="portfolio"
                      placeholder="yourportfolio.com"
                      value={header.portfolio}
                      onChange={(e) => setHeader({ ...header, portfolio: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Step */}
          {currentStep === 'summary' && (
            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                placeholder="Detail your professional experience, major achievements, and core skills..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={6}
              />
            </div>
          )}

          {/* Skills Step */}
          {currentStep === 'skills' && (
            <div className="space-y-4">
              {skills.map((skillGroup, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Input
                      placeholder="Category (e.g. Frontend)"
                      value={skillGroup.category}
                      className="max-w-xs font-semibold"
                      onChange={(e) => {
                        const newSkills = [...skills];
                        newSkills[idx].category = e.target.value;
                        setSkills(newSkills);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Skills (comma-separated: e.g. React, Vue, HTML, CSS)"
                    value={skillGroup.skills.join(', ')}
                    onChange={(e) => {
                      const newSkills = [...skills];
                      newSkills[idx].skills = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setSkills(newSkills);
                    }}
                    rows={2}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setSkills([...skills, { category: '', skills: [] }])}
                className="w-full gap-2 border-dashed"
              >
                <Plus className="w-4 h-4" />
                Add Skill Category
              </Button>
            </div>
          )}

          {/* Experience Step */}
          {currentStep === 'experience' && (
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={exp.id} className="border border-slate-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Experience #{idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExperiences(experiences.filter((e) => e.id !== exp.id))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name *</Label>
                      <Input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => {
                          const newExp = [...experiences];
                          newExp[idx].company = e.target.value;
                          setExperiences(newExp);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Role / Designation *</Label>
                      <Input
                        placeholder="e.g. Software Engineer"
                        value={exp.role}
                        onChange={(e) => {
                          const newExp = [...experiences];
                          newExp[idx].role = e.target.value;
                          setExperiences(newExp);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Start Date *</Label>
                      <Input
                        placeholder="Jan 2022"
                        value={exp.startDate}
                        onChange={(e) => {
                          const newExp = [...experiences];
                          newExp[idx].startDate = e.target.value;
                          setExperiences(newExp);
                        }}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        placeholder="Present"
                        value={exp.endDate}
                        disabled={exp.current}
                        onChange={(e) => {
                          const newExp = [...experiences];
                          newExp[idx].endDate = e.target.value;
                          setExperiences(newExp);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onChange={(e) => {
                        const newExp = [...experiences];
                        newExp[idx].current = e.target.checked;
                        if (e.target.checked) newExp[idx].endDate = 'Present';
                        setExperiences(newExp);
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`current-${exp.id}`} className="text-sm font-medium">Currently work here</label>
                  </div>
                  <div>
                    <Label>Key Responsibilities (one per line)</Label>
                    <Textarea
                      placeholder="Designed and developed key SaaS dashboard modules&#10;Integrated third-party APIs using Express"
                      value={exp.description.join('\n')}
                      onChange={(e) => {
                        const newExp = [...experiences];
                        newExp[idx].description = e.target.value.split('\n').filter(Boolean);
                        setExperiences(newExp);
                      }}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddExperience}
                className="w-full gap-2 border-dashed"
              >
                <Plus className="w-4 h-4" />
                Add Professional Experience
              </Button>
            </div>
          )}

          {/* Projects Step */}
          {currentStep === 'projects' && (
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={proj.id} className="border border-slate-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Project #{idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProjects(projects.filter((p) => p.id !== proj.id))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Project Name *</Label>
                      <Input
                        placeholder="My Project"
                        value={proj.name}
                        onChange={(e) => {
                          const newProj = [...projects];
                          newProj[idx].name = e.target.value;
                          setProjects(newProj);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Date / Duration</Label>
                      <Input
                        placeholder="e.g. March 2025"
                        value={proj.date}
                        onChange={(e) => {
                          const newProj = [...projects];
                          newProj[idx].date = e.target.value;
                          setProjects(newProj);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Technologies Used (comma-separated)</Label>
                      <Input
                        placeholder="React, Tailwind, Node.js"
                        value={proj.technologies.join(', ')}
                        onChange={(e) => {
                          const newProj = [...projects];
                          newProj[idx].technologies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setProjects(newProj);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Project URL</Label>
                      <Input
                        placeholder="https://github.com/..."
                        value={proj.link}
                        onChange={(e) => {
                          const newProj = [...projects];
                          newProj[idx].link = e.target.value;
                          setProjects(newProj);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Project Description</Label>
                    <Textarea
                      placeholder="Detail what you built, technical challenges, and outcomes..."
                      value={proj.description}
                      onChange={(e) => {
                        const newProj = [...projects];
                        newProj[idx].description = e.target.value;
                        setProjects(newProj);
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddProject}
                className="w-full gap-2 border-dashed"
              >
                <Plus className="w-4 h-4" />
                Add Project Detail
              </Button>
            </div>
          )}

          {/* Education Step */}
          {currentStep === 'education' && (
            <div className="space-y-4">
              {educations.map((edu, idx) => (
                <div key={edu.id} className="border border-slate-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Education #{idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEducations(educations.filter((e) => e.id !== edu.id))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Institution / College *</Label>
                      <Input
                        placeholder="State University"
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...educations];
                          newEdu[idx].institution = e.target.value;
                          setEducations(newEdu);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Degree *</Label>
                      <Input
                        placeholder="Bachelor of Science"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEdu = [...educations];
                          newEdu[idx].degree = e.target.value;
                          setEducations(newEdu);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Field of Study *</Label>
                      <Input
                        placeholder="Computer Science"
                        value={edu.field}
                        onChange={(e) => {
                          const newEdu = [...educations];
                          newEdu[idx].field = e.target.value;
                          setEducations(newEdu);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Graduation Date</Label>
                      <Input
                        placeholder="e.g. May 2023"
                        value={edu.graduationDate}
                        onChange={(e) => {
                          const newEdu = [...educations];
                          newEdu[idx].graduationDate = e.target.value;
                          setEducations(newEdu);
                        }}
                      />
                    </div>
                    <div>
                      <Label>GPA (optional)</Label>
                      <Input
                        placeholder="e.g. 3.8/4.0"
                        value={edu.gpa}
                        onChange={(e) => {
                          const newEdu = [...educations];
                          newEdu[idx].gpa = e.target.value;
                          setEducations(newEdu);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddEducation}
                className="w-full gap-2 border-dashed"
              >
                <Plus className="w-4 h-4" />
                Add Education Background
              </Button>
            </div>
          )}

          {/* Certifications Step */}
          {currentStep === 'certifications' && (
            <div className="space-y-4">
              {certifications.map((cert, idx) => (
                <div key={cert.id} className="border border-slate-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Certification #{idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCertifications(certifications.filter((c) => c.id !== cert.id))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Certification Name *</Label>
                      <Input
                        placeholder="AWS Solutions Architect"
                        value={cert.name}
                        onChange={(e) => {
                          const newCert = [...certifications];
                          newCert[idx].name = e.target.value;
                          setCertifications(newCert);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Issuing Organization *</Label>
                      <Input
                        placeholder="Amazon Web Services"
                        value={cert.issuer}
                        onChange={(e) => {
                          const newCert = [...certifications];
                          newCert[idx].issuer = e.target.value;
                          setCertifications(newCert);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Issue Date</Label>
                      <Input
                        placeholder="e.g. Aug 2024"
                        value={cert.date}
                        onChange={(e) => {
                          const newCert = [...certifications];
                          newCert[idx].date = e.target.value;
                          setCertifications(newCert);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Credential URL</Label>
                      <Input
                        placeholder="https://..."
                        value={cert.link}
                        onChange={(e) => {
                          const newCert = [...certifications];
                          newCert[idx].link = e.target.value;
                          setCertifications(newCert);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddCertification}
                className="w-full gap-2 border-dashed"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </Button>
            </div>
          )}

          {/* Achievements Step */}
          {currentStep === 'achievements' && (
            <div className="space-y-4">
              <Label>Achievements (add major milestones and quantified successes)</Label>
              <div className="flex gap-2">
                <Input
                  value={achievementInput}
                  onChange={(e) => setAchievementInput(e.target.value)}
                  placeholder="e.g., Increased system performance by 40% using memory caching."
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (achievementInput.trim()) {
                      setAchievements([...achievements, achievementInput.trim()]);
                      setAchievementInput('');
                    }
                  }}
                  className="bg-emerald-600 text-white shrink-0"
                >
                  Add
                </Button>
              </div>
              <ul className="space-y-2 mt-4">
                {achievements.map((ach, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-slate-50 border p-2.5 rounded-lg text-sm text-slate-800">
                    <span>{ach}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-800 font-medium">✓ Your resume skeleton is complete. Ready to load into the live editor!</p>
              </div>
              <div className="space-y-2 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                <p><strong>Name:</strong> {header.name || 'Not provided'}</p>
                <p><strong>Title:</strong> {header.jobTitle || 'Not provided'}</p>
                <p><strong>Email:</strong> {header.email || 'Not provided'}</p>
                <p><strong>Location:</strong> {header.location || 'Not provided'}</p>
                <p><strong>Skills Categories:</strong> {skills.length} categories added</p>
                <p><strong>Work Experience:</strong> {experiences.length} positions listed</p>
                <p><strong>Projects:</strong> {projects.length} projects listed</p>
                <p><strong>Educations:</strong> {educations.length} records listed</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 'header'}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        {currentStep !== 'review' ? (
          <Button
            onClick={handleNextStep}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6"
          >
            Continue to Live Editor
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
