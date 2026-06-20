import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, Eye, Edit3, Settings, Undo, Redo, ZoomIn, ZoomOut, 
  Sparkles, CheckCircle2, AlertTriangle, Plus, Trash2, ArrowUp, ArrowDown 
} from 'lucide-react';
import { Resume, TemplateId, ParsedResume, ResumeSection } from '@shared/types';
import { TEMPLATES } from '@/lib/templates';
import { PRESET_JOBS } from '@/lib/jobDescriptions';
import ResumePreview from './ResumePreview';
import { exportResumeToPDF, exportResumeToDOCX } from '@/lib/pdfExport';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

interface ResumeEditorProps {
  resume: Resume;
  onUpdate: (resume: Resume) => void;
}

export default function ResumeEditor({ resume, onUpdate }: ResumeEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(resume.templateId as TemplateId);
  const [selectedJob, setSelectedJob] = useState<string>(resume.jobDescriptionId || '');
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [activeEditTab, setActiveEditTab] = useState<string>('header');
  const [zoom, setZoom] = useState<number>(100);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');

  // History stack for Undo/Redo
  const [history, setHistory] = useState<Resume[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([resume]);
      setHistoryIndex(0);
    }
  }, []);

  // Update resume and track history
  const updateResumeData = (updated: Resume) => {
    setAutoSaveStatus('saving');
    onUpdate(updated);

    // Track history
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, updated]);
    setHistoryIndex(nextHistory.length);

    setTimeout(() => {
      setAutoSaveStatus('saved');
    }, 500);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      onUpdate(history[nextIndex]);
      toast.success('Undo successful');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      onUpdate(history[nextIndex]);
      toast.success('Redo successful');
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('resume-pdf-content');
    if (!element) {
      toast.error('Failed to locate resume preview. Render preview tab first.');
      return;
    }
    toast.info('Exporting resume to PDF...');
    try {
      await exportResumeToPDF(element, `${resume.title || 'resume'}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export PDF.');
    }
  };

  const handleExportDOCX = async () => {
    const element = document.getElementById('resume-pdf-content');
    if (!element) {
      toast.error('Failed to locate resume preview. Render preview tab first.');
      return;
    }
    toast.info('Exporting resume to Word document...');
    try {
      await exportResumeToDOCX(element, `${resume.title || 'resume'}.doc`);
      toast.success('Word document downloaded successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export DOCX.');
    }
  };

  // ATS engine score calculation
  const getResumeTextContent = (): string => {
    let text = '';
    resume.sections.forEach((sec) => {
      if (!sec.visible) return;
      if (sec.type === 'header' && sec.content.header) {
        const h = sec.content.header;
        text += ` ${h.name} ${h.email} ${h.phone} ${h.location}`;
      } else if (sec.type === 'summary' && sec.content.summary) {
        text += ` ${sec.content.summary}`;
      } else if (sec.type === 'skills' && sec.content.skills) {
        sec.content.skills.forEach(g => {
          text += ` ${g.category} ${g.skills.join(' ')}`;
        });
      } else if (sec.type === 'experience' && sec.content.experiences) {
        sec.content.experiences.forEach(e => {
          text += ` ${e.role} ${e.company} ${e.description.join(' ')}`;
        });
      } else if (sec.type === 'projects' && sec.content.projects) {
        sec.content.projects.forEach(p => {
          text += ` ${p.name} ${p.description} ${p.technologies.join(' ')}`;
        });
      } else if (sec.type === 'education' && sec.content.educations) {
        sec.content.educations.forEach(edu => {
          text += ` ${edu.institution} ${edu.degree} ${edu.field}`;
        });
      } else if (sec.type === 'certifications' && sec.content.certifications) {
        sec.content.certifications.forEach(c => {
          text += ` ${c.name} ${c.issuer}`;
        });
      }
    });
    return text.toLowerCase();
  };

  const calculateATSScore = () => {
    const resumeText = getResumeTextContent();
    const activeJob = PRESET_JOBS.find(j => j.id === selectedJob);

    let keywordScore = 0;
    let completenessScore = 0;
    let readabilityScore = 80; // base score

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    // 1. Keyword match
    if (activeJob) {
      activeJob.keywords.forEach(keyword => {
        if (resumeText.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
        } else {
          missingKeywords.push(keyword);
        }
      });
      keywordScore = activeJob.keywords.length > 0 
        ? Math.round((matchedKeywords.length / activeJob.keywords.length) * 100)
        : 100;
    } else {
      keywordScore = 100; // No job selected
    }

    // 2. Completeness score
    const importantSections = ['header', 'summary', 'skills', 'experience', 'education'];
    let filledCount = 0;
    importantSections.forEach(type => {
      const sec = resume.sections.find(s => s.type === type);
      if (sec && sec.visible) {
        if (type === 'header' && sec.content.header?.name) filledCount++;
        if (type === 'summary' && sec.content.summary) filledCount++;
        if (type === 'skills' && sec.content.skills && sec.content.skills.length > 0) filledCount++;
        if (type === 'experience' && sec.content.experiences && sec.content.experiences.length > 0) filledCount++;
        if (type === 'education' && sec.content.educations && sec.content.educations.length > 0) filledCount++;
      }
    });
    completenessScore = Math.round((filledCount / importantSections.length) * 100);

    // 3. Readability & Formatting
    if (selectedTemplate === 'technical-compact') readabilityScore = 85;
    if (selectedTemplate === 'classic-ats-blue') readabilityScore = 90;

    const overallScore = activeJob
      ? Math.round(keywordScore * 0.5 + completenessScore * 0.3 + readabilityScore * 0.2)
      : Math.round(completenessScore * 0.7 + readabilityScore * 0.3);

    // Improvement suggestions
    const suggestions: string[] = [];
    if (missingKeywords.length > 0) {
      suggestions.push(`Add missing keywords: ${missingKeywords.slice(0, 4).join(', ')}`);
    }
    if (completenessScore < 100) {
      suggestions.push('Complete empty core sections (Header, Summary, Experience, Education)');
    }
    if (!selectedJob) {
      suggestions.push('Select a target job description to get tailored keyword suggestions.');
    }

    return {
      score: overallScore,
      matchedKeywords,
      missingKeywords,
      suggestions,
      completenessScore,
    };
  };

  const atsSummary = calculateATSScore();

  // Handlers for updating specific resume sections
  const updateSection = (type: string, fields: any) => {
    const updatedSections = resume.sections.map((sec) => {
      if (sec.type === type) {
        return {
          ...sec,
          content: {
            ...sec.content,
            ...fields,
          },
        };
      }
      return sec;
    });
    updateResumeData({ ...resume, sections: updatedSections });
  };

  const getSectionContent = (type: string): any => {
    return resume.sections.find((s) => s.type === type)?.content || {};
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* LEFT COLUMN - Settings & ATS Widget (Span 4) */}
      <div className="lg:col-span-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
        {/* Document Settings */}
        <Card className="border-slate-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Design & Template</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
              autoSaveStatus === 'saved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              {autoSaveStatus === 'saved' ? 'Saved' : 'Saving...'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-500">Active Layout</Label>
              <div className="text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-100">
                Exclusive ATS Layout (Emerald Highlights)
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-500">Target Job Description</Label>
              <Select value={selectedJob} onValueChange={(v) => {
                setSelectedJob(v);
                updateResumeData({ ...resume, jobDescriptionId: v });
              }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select target..." />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_JOBS.map(j => (
                    <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 justify-between border-t border-slate-100 pt-3">
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleUndo} disabled={historyIndex <= 0}>
                <Undo className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                <Redo className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex gap-1 items-center">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs text-slate-500 font-semibold px-1">{zoom}%</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(150, zoom + 10))}>
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* ATS Score Engine Widget */}
        <Card className="border-slate-200 shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            ATS Optimization Score
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke={atsSummary.score >= 70 ? "#10b981" : atsSummary.score >= 40 ? "#f59e0b" : "#ef4444"} strokeWidth="6" fill="transparent"
                  strokeDasharray={175} strokeDashoffset={175 - (175 * atsSummary.score) / 100} />
              </svg>
              <span className="absolute text-base font-extrabold">{atsSummary.score}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-900">
                {atsSummary.score >= 70 ? 'Excellent Match!' : atsSummary.score >= 40 ? 'Moderate Match' : 'Action Required'}
              </p>
              <p className="text-[10px] text-slate-500">Keyword Alignment: {atsSummary.matchedKeywords.length} matched</p>
              <p className="text-[10px] text-slate-500">Section Completeness: {atsSummary.completenessScore}%</p>
            </div>
          </div>

          {atsSummary.suggestions.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 space-y-1">
              <p className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Suggestions to Improve:
              </p>
              <ul className="text-[10px] text-amber-700 list-disc pl-4 space-y-0.5">
                {atsSummary.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedJob && (
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Keywords Details</h4>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {atsSummary.matchedKeywords.map((k, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded border border-emerald-100">
                    {k}
                  </span>
                ))}
                {atsSummary.missingKeywords.map((k, i) => (
                  <span key={i} className="bg-red-50 text-red-800 text-[9px] px-1.5 py-0.5 rounded border border-red-100 line-through">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Section Visibility and Ordering */}
        <Card className="border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Sections Visibility</h3>
          <div className="space-y-1.5">
            {resume.sections.map((section, idx) => (
              <div key={section.id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg transition">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={section.visible}
                    onChange={() => {
                      const updated = resume.sections.map((s) =>
                        s.id === section.id ? { ...s, visible: !s.visible } : s
                      );
                      updateResumeData({ ...resume, sections: updated });
                    }}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-700 capitalize font-medium">{section.type}</span>
                </div>
                <div className="flex gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={idx === 0}
                    onClick={() => {
                      const list = [...resume.sections];
                      const temp = list[idx];
                      list[idx] = list[idx - 1];
                      list[idx - 1] = temp;
                      updateResumeData({ ...resume, sections: list });
                    }}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={idx === resume.sections.length - 1}
                    onClick={() => {
                      const list = [...resume.sections];
                      const temp = list[idx];
                      list[idx] = list[idx + 1];
                      list[idx + 1] = temp;
                      updateResumeData({ ...resume, sections: list });
                    }}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CENTER COLUMN - Editor & Preview (Span 8) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Toggle Mode */}
        <div className="flex justify-between items-center bg-white border border-slate-200 rounded-lg p-2">
          <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as any)} className="w-full">
            <div className="flex justify-between items-center w-full">
              <TabsList className="grid grid-cols-2 w-48">
                <TabsTrigger value="edit" className="gap-1.5 py-1">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Form
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1.5 py-1">
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button onClick={handleExportPDF} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9">
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
                <Button onClick={handleExportDOCX} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-9">
                  <Download className="w-4 h-4" />
                  Export DOCX
                </Button>
              </div>
            </div>
          </Tabs>
        </div>

        {/* View Content */}
        <div className="flex-1 min-h-0">
          {previewMode === 'preview' ? (
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden max-h-[calc(100vh-210px)]">
              <ResumePreview resume={resume} templateId={selectedTemplate} zoom={zoom} />
            </div>
          ) : (
            <Card className="border-slate-200 p-6 flex flex-col max-h-[calc(100vh-210px)] overflow-y-auto">
              {/* Section Tabs inside Form */}
              <Tabs value={activeEditTab} onValueChange={setActiveEditTab} className="w-full">
                <TabsList className="flex flex-wrap gap-1 bg-slate-100 p-1 mb-6 max-w-full overflow-x-auto whitespace-nowrap">
                  <TabsTrigger value="header">Contact Header</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="certifications">Certifications</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>

                {/* HEADER TAB */}
                <TabsContent value="header" className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-base">Header Contact Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        value={getSectionContent('header').header?.name || ''}
                        onChange={(e) => updateSection('header', {
                          header: { ...getSectionContent('header').header, name: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-jobtitle">Job Title</Label>
                      <Input
                        id="edit-jobtitle"
                        value={getSectionContent('header').header?.jobTitle || ''}
                        onChange={(e) => updateSection('header', {
                          header: { ...getSectionContent('header').header, jobTitle: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-email">Email Address</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={getSectionContent('header').header?.email || ''}
                        onChange={(e) => updateSection('header', {
                          header: { ...getSectionContent('header').header, email: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-phone">Phone Number</Label>
                      <Input
                        id="edit-phone"
                        value={getSectionContent('header').header?.phone || ''}
                        onChange={(e) => updateSection('header', {
                          header: { ...getSectionContent('header').header, phone: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        value={getSectionContent('header').header?.location || ''}
                        onChange={(e) => updateSection('header', {
                          header: { ...getSectionContent('header').header, location: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h4 className="text-sm font-semibold text-slate-800">Social & Website Profiles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="edit-linkedin">LinkedIn URL</Label>
                        <Input
                          id="edit-linkedin"
                          placeholder="linkedin.com/in/username"
                          value={getSectionContent('header').header?.links?.find((l: any) => l.label.toLowerCase() === 'linkedin')?.url || ''}
                          onChange={(e) => {
                            const headerObj = getSectionContent('header').header || {};
                            const linksObj = headerObj.links || [];
                            let updatedLinks = [...linksObj];
                            const linkIdx = updatedLinks.findIndex((l: any) => l.label.toLowerCase() === 'linkedin');
                            if (linkIdx > -1) {
                              if (e.target.value) {
                                updatedLinks[linkIdx] = { ...updatedLinks[linkIdx], url: e.target.value };
                              } else {
                                updatedLinks.splice(linkIdx, 1);
                              }
                            } else if (e.target.value) {
                              updatedLinks.push({ label: 'LinkedIn', url: e.target.value });
                            }
                            updateSection('header', {
                              header: { ...headerObj, links: updatedLinks }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-github">GitHub URL</Label>
                        <Input
                          id="edit-github"
                          placeholder="github.com/username"
                          value={getSectionContent('header').header?.links?.find((l: any) => l.label.toLowerCase() === 'github')?.url || ''}
                          onChange={(e) => {
                            const headerObj = getSectionContent('header').header || {};
                            const linksObj = headerObj.links || [];
                            let updatedLinks = [...linksObj];
                            const linkIdx = updatedLinks.findIndex((l: any) => l.label.toLowerCase() === 'github');
                            if (linkIdx > -1) {
                              if (e.target.value) {
                                updatedLinks[linkIdx] = { ...updatedLinks[linkIdx], url: e.target.value };
                              } else {
                                updatedLinks.splice(linkIdx, 1);
                              }
                            } else if (e.target.value) {
                              updatedLinks.push({ label: 'GitHub', url: e.target.value });
                            }
                            updateSection('header', {
                              header: { ...headerObj, links: updatedLinks }
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-portfolio">Portfolio Website URL</Label>
                        <Input
                          id="edit-portfolio"
                          placeholder="yourportfolio.com"
                          value={getSectionContent('header').header?.links?.find((l: any) => l.label.toLowerCase() === 'portfolio' || l.label.toLowerCase() === 'website')?.url || ''}
                          onChange={(e) => {
                            const headerObj = getSectionContent('header').header || {};
                            const linksObj = headerObj.links || [];
                            let updatedLinks = [...linksObj];
                            const linkIdx = updatedLinks.findIndex((l: any) => l.label.toLowerCase() === 'portfolio' || l.label.toLowerCase() === 'website');
                            if (linkIdx > -1) {
                              if (e.target.value) {
                                updatedLinks[linkIdx] = { ...updatedLinks[linkIdx], url: e.target.value };
                              } else {
                                updatedLinks.splice(linkIdx, 1);
                              }
                            } else if (e.target.value) {
                              updatedLinks.push({ label: 'Portfolio', url: e.target.value });
                            }
                            updateSection('header', {
                              header: { ...headerObj, links: updatedLinks }
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* SUMMARY TAB */}
                <TabsContent value="summary" className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-base font-medium">Professional Summary</h3>
                  <div className="space-y-1">
                    <Label htmlFor="edit-summary">Profile Description</Label>
                    <Textarea
                      id="edit-summary"
                      value={getSectionContent('summary').summary || ''}
                      onChange={(e) => updateSection('summary', { summary: e.target.value })}
                      rows={8}
                    />
                  </div>
                </TabsContent>

                {/* SKILLS TAB */}
                <TabsContent value="skills" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base font-medium">Skills Categories</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const cur = getSectionContent('skills').skills || [];
                      updateSection('skills', { skills: [...cur, { category: '', skills: [] }] });
                    }}>
                      Add Category
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {(getSectionContent('skills').skills || []).map((group: any, idx: number) => (
                      <div key={idx} className="border border-slate-100 p-4 rounded-lg space-y-2 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <Input
                            placeholder="e.g. Languages"
                            value={group.category}
                            className="max-w-xs font-semibold"
                            onChange={(e) => {
                              const list = [...getSectionContent('skills').skills];
                              list[idx].category = e.target.value;
                              updateSection('skills', { skills: list });
                            }}
                          />
                          <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                            const list = (getSectionContent('skills').skills || []).filter((_: any, i: number) => i !== idx);
                            updateSection('skills', { skills: list });
                          }}>
                            Remove
                          </Button>
                        </div>
                        <Input
                          placeholder="Skills comma separated: React, Vue"
                          value={group.skills.join(', ')}
                          onChange={(e) => {
                            const list = [...getSectionContent('skills').skills];
                            list[idx].skills = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean);
                            updateSection('skills', { skills: list });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* EXPERIENCE TAB */}
                <TabsContent value="experience" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base font-medium">Work History</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const cur = getSectionContent('experience').experiences || [];
                      updateSection('experience', {
                        experiences: [...cur, { id: nanoid(), company: '', role: '', startDate: '', endDate: '', current: false, description: [] }]
                      });
                    }}>
                      Add Position
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(getSectionContent('experience').experiences || []).map((exp: any, idx: number) => (
                      <div key={exp.id || idx} className="border border-slate-100 p-4 rounded-lg space-y-3 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Job Position #{idx + 1}</span>
                          <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                            const list = (getSectionContent('experience').experiences || []).filter((e: any) => e.id !== exp.id);
                            updateSection('experience', { experiences: list });
                          }}>
                            Delete
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Company Name</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => {
                                const list = [...getSectionContent('experience').experiences];
                                list[idx].company = e.target.value;
                                updateSection('experience', { experiences: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Job Title</Label>
                            <Input
                              value={exp.role}
                              onChange={(e) => {
                                const list = [...getSectionContent('experience').experiences];
                                list[idx].role = e.target.value;
                                updateSection('experience', { experiences: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Start Date</Label>
                            <Input
                              value={exp.startDate}
                              onChange={(e) => {
                                const list = [...getSectionContent('experience').experiences];
                                list[idx].startDate = e.target.value;
                                updateSection('experience', { experiences: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">End Date</Label>
                            <Input
                              value={exp.endDate}
                              disabled={exp.current}
                              onChange={(e) => {
                                const list = [...getSectionContent('experience').experiences];
                                list[idx].endDate = e.target.value;
                                updateSection('experience', { experiences: list });
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => {
                              const list = [...getSectionContent('experience').experiences];
                              list[idx].current = e.target.checked;
                              if (e.target.checked) list[idx].endDate = 'Present';
                              updateSection('experience', { experiences: list });
                            }}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span className="text-xs font-semibold text-slate-700">Currently Work Here</span>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Description Bullets (one per line)</Label>
                          <Textarea
                            value={exp.description.join('\n')}
                            onChange={(e) => {
                              const list = [...getSectionContent('experience').experiences];
                              list[idx].description = e.target.value.split('\n').filter(Boolean);
                              updateSection('experience', { experiences: list });
                            }}
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* PROJECTS TAB */}
                <TabsContent value="projects" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base font-medium">Projects</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const cur = getSectionContent('projects').projects || [];
                      updateSection('projects', {
                        projects: [...cur, { id: nanoid(), name: '', description: '', technologies: [], link: '', date: '' }]
                      });
                    }}>
                      Add Project
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(getSectionContent('projects').projects || []).map((proj: any, idx: number) => (
                      <div key={proj.id || idx} className="border border-slate-100 p-4 rounded-lg space-y-3 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Project #{idx + 1}</span>
                          <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                            const list = (getSectionContent('projects').projects || []).filter((p: any) => p.id !== proj.id);
                            updateSection('projects', { projects: list });
                          }}>
                            Delete
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Project Name</Label>
                            <Input
                              value={proj.name}
                              onChange={(e) => {
                                const list = [...getSectionContent('projects').projects];
                                list[idx].name = e.target.value;
                                updateSection('projects', { projects: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Date</Label>
                            <Input
                              value={proj.date}
                              onChange={(e) => {
                                const list = [...getSectionContent('projects').projects];
                                list[idx].date = e.target.value;
                                updateSection('projects', { projects: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Technologies (comma-separated)</Label>
                            <Input
                              value={proj.technologies.join(', ')}
                              onChange={(e) => {
                                const list = [...getSectionContent('projects').projects];
                                list[idx].technologies = e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean);
                                updateSection('projects', { projects: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Link URL</Label>
                            <Input
                              value={proj.link}
                              onChange={(e) => {
                                const list = [...getSectionContent('projects').projects];
                                list[idx].link = e.target.value;
                                updateSection('projects', { projects: list });
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={proj.description}
                            onChange={(e) => {
                              const list = [...getSectionContent('projects').projects];
                              list[idx].description = e.target.value;
                              updateSection('projects', { projects: list });
                            }}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* EDUCATION TAB */}
                <TabsContent value="education" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base font-medium">Education Background</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const cur = getSectionContent('education').educations || [];
                      updateSection('education', {
                        educations: [...cur, { id: nanoid(), institution: '', degree: '', field: '', graduationDate: '', gpa: '' }]
                      });
                    }}>
                      Add Education
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(getSectionContent('education').educations || []).map((edu: any, idx: number) => (
                      <div key={edu.id || idx} className="border border-slate-100 p-4 rounded-lg space-y-3 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Education #{idx + 1}</span>
                          <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                            const list = (getSectionContent('education').educations || []).filter((e: any) => e.id !== edu.id);
                            updateSection('education', { educations: list });
                          }}>
                            Delete
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => {
                                const list = [...getSectionContent('education').educations];
                                list[idx].institution = e.target.value;
                                updateSection('education', { educations: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => {
                                const list = [...getSectionContent('education').educations];
                                list[idx].degree = e.target.value;
                                updateSection('education', { educations: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Field of Study</Label>
                            <Input
                              value={edu.field}
                              onChange={(e) => {
                                const list = [...getSectionContent('education').educations];
                                list[idx].field = e.target.value;
                                updateSection('education', { educations: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Graduation Date</Label>
                            <Input
                              value={edu.graduationDate}
                              onChange={(e) => {
                                const list = [...getSectionContent('education').educations];
                                list[idx].graduationDate = e.target.value;
                                updateSection('education', { educations: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">GPA</Label>
                            <Input
                              value={edu.gpa}
                              onChange={(e) => {
                                const list = [...getSectionContent('education').educations];
                                list[idx].gpa = e.target.value;
                                updateSection('education', { educations: list });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* CERTIFICATIONS TAB */}
                <TabsContent value="certifications" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base font-medium">Certifications</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const cur = getSectionContent('certifications').certifications || [];
                      updateSection('certifications', {
                        certifications: [...cur, { id: nanoid(), name: '', issuer: '', date: '', link: '' }]
                      });
                    }}>
                      Add Certification
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(getSectionContent('certifications').certifications || []).map((cert: any, idx: number) => (
                      <div key={cert.id || idx} className="border border-slate-100 p-4 rounded-lg space-y-3 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Certification #{idx + 1}</span>
                          <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                            const list = (getSectionContent('certifications').certifications || []).filter((c: any) => c.id !== cert.id);
                            updateSection('certifications', { certifications: list });
                          }}>
                            Delete
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Certification Name</Label>
                            <Input
                              value={cert.name}
                              onChange={(e) => {
                                const list = [...getSectionContent('certifications').certifications];
                                list[idx].name = e.target.value;
                                updateSection('certifications', { certifications: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Issuer</Label>
                            <Input
                              value={cert.issuer}
                              onChange={(e) => {
                                const list = [...getSectionContent('certifications').certifications];
                                list[idx].issuer = e.target.value;
                                updateSection('certifications', { certifications: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Issue Date</Label>
                            <Input
                              value={cert.date}
                              onChange={(e) => {
                                const list = [...getSectionContent('certifications').certifications];
                                list[idx].date = e.target.value;
                                updateSection('certifications', { certifications: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Credential Link</Label>
                            <Input
                              value={cert.link}
                              onChange={(e) => {
                                const list = [...getSectionContent('certifications').certifications];
                                list[idx].link = e.target.value;
                                updateSection('certifications', { certifications: list });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* ACHIEVEMENTS TAB */}
                <TabsContent value="achievements" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base font-medium">Achievements</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const cur = getSectionContent('achievements').achievements || [];
                      updateSection('achievements', {
                        achievements: [...cur, '']
                      });
                    }}>
                      Add Achievement
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {(getSectionContent('achievements').achievements || []).map((ach: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="e.g. Winner of national hackathon out of 500+ teams"
                          value={ach}
                          onChange={(e) => {
                            const list = [...getSectionContent('achievements').achievements];
                            list[idx] = e.target.value;
                            updateSection('achievements', { achievements: list });
                          }}
                        />
                        <Button variant="ghost" size="sm" className="text-red-500 h-9" onClick={() => {
                          const list = (getSectionContent('achievements').achievements || []).filter((_: any, i: number) => i !== idx);
                          updateSection('achievements', { achievements: list });
                        }}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
