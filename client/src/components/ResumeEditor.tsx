import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, Eye, Edit3, Settings, Undo, Redo, ZoomIn, ZoomOut, 
  Sparkles, CheckCircle2, AlertTriangle, Plus, Trash2, ArrowUp, ArrowDown,
  User, AlignLeft, Code, Briefcase, Folder, GraduationCap, Award, Trophy,
  PanelLeft, PanelLeftClose, Globe, Users, LayoutList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Resume, TemplateId, ParsedResume, ResumeSection } from '@shared/types';
import { TEMPLATES } from '@/lib/templates';
import { PRESET_JOBS } from '@/lib/jobDescriptions';
import ResumePreview from './ResumePreview';
import CountryLocationFields from './CountryLocationFields';
import { exportResumeToPDF, exportResumeToDOCX } from '@/lib/pdfExport';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const WIZARD_STEPS = [
  { id: 1, label: 'Contact', key: 'header', icon: User },
  { id: 2, label: 'Summary', key: 'summary', icon: AlignLeft },
  { id: 3, label: 'Skills', key: 'skills', icon: Code },
  { id: 4, label: 'Experience', key: 'experience', icon: Briefcase },
  { id: 5, label: 'Projects', key: 'projects', icon: Folder },
  { id: 6, label: 'Education', key: 'education', icon: GraduationCap },
  { id: 7, label: 'Credentials', key: 'certifications', icon: Award },
  { id: 8, label: 'Languages', key: 'languages', icon: Globe },
  { id: 9, label: 'References', key: 'references', icon: Users },
  { id: 10, label: 'Custom', key: 'custom', icon: LayoutList },
  { id: 11, label: 'Layout', key: 'layout', icon: Settings },
  { id: 12, label: 'Review', key: 'achievements', icon: Trophy },
];

interface ResumeEditorProps {
  resume: Resume;
  onUpdate: (resume: Resume) => void;
}

export default function ResumeEditor({ resume, onUpdate }: ResumeEditorProps) {
  const [localResume, setLocalResume] = useState<Resume>(resume);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(resume.templateId as TemplateId);
  const [selectedJob, setSelectedJob] = useState<string>(resume.jobDescriptionId || '');
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [activeEditTab, setActiveEditTab] = useState<string>('header');
  const [zoom, setZoom] = useState<number>(70); // Set default zoom to 70% to fit live preview side-by-side
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState<boolean>(false);
  const [isTabsListCollapsed, setIsTabsListCollapsed] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [atsRules, setAtsRules] = useState<any>(null);

  const headerContent = (localResume.sections.find(s => s.type === 'header')?.content.header || {}) as any;
  const currentCountry = headerContent.countryCode || '';
  const targetCountry = headerContent.targetCountryCode || '';

  useEffect(() => {
    fetch('/countries')
      .then(res => res.ok ? res.json() : [])
      .then(data => setCountriesList(data))
      .catch(err => console.error('Error fetching countries in ResumeEditor:', err));
  }, []);

  useEffect(() => {
    if (!currentCountry || !targetCountry) {
      setAtsRules(null);
      return;
    }
    fetch(`/country-ats-rules/${currentCountry}/${targetCountry}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setAtsRules(data))
      .catch(err => console.error('Error fetching ATS rules in ResumeEditor:', err));
  }, [currentCountry, targetCountry]);

  // Validation helpers
  const isValidEmail = (email: string) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      let testUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        testUrl = 'https://' + url;
      }
      new URL(testUrl);
      return true;
    } catch {
      return false;
    }
  };

  const isValidPhone = (phone: string) => {
    if (!phone) return true;
    return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(phone);
  };

  // History stack for Undo/Redo
  const [history, setHistory] = useState<Resume[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep localResume in sync with outside resume (e.g. from parent initial state or undo/redo)
  useEffect(() => {
    // If the base changes (e.g., loaded new resume or undid/redid), update local state
    setLocalResume(resume);
  }, [resume.id]);

  // Ensure missing sections are initialized for backwards compatibility
  useEffect(() => {
    const typesPresent = resume.sections.map(s => s.type);
    let updatedSections = [...resume.sections];
    let changed = false;
    
    const missingTypes: ('languages' | 'references' | 'custom')[] = [];
    if (!typesPresent.includes('languages')) missingTypes.push('languages');
    if (!typesPresent.includes('references')) missingTypes.push('references');
    if (!typesPresent.includes('custom')) missingTypes.push('custom');
    
    if (missingTypes.length > 0) {
      let maxOrder = Math.max(...resume.sections.map(s => s.order), 0);
      missingTypes.forEach(type => {
        maxOrder++;
        updatedSections.push({
          id: nanoid(),
          type: type as any,
          order: maxOrder,
          visible: true,
          content: type === 'languages' ? { languages: [] } : type === 'references' ? { references: [] } : { customSections: [] }
        });
      });
      changed = true;
    }
    
    if (changed) {
      onUpdate({ ...resume, sections: updatedSections });
      setLocalResume({ ...resume, sections: updatedSections });
    }
  }, [resume.id]);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([resume]);
      setHistoryIndex(0);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Debounced helper to push to history
  const pushToHistory = (updated: Resume) => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    historyTimeoutRef.current = setTimeout(() => {
      setHistory((prevHistory) => {
        const nextHistory = prevHistory.slice(0, historyIndex + 1);
        const lastEntry = nextHistory[nextHistory.length - 1];
        if (lastEntry && JSON.stringify(lastEntry.sections) === JSON.stringify(updated.sections)) {
          return prevHistory;
        }
        setHistoryIndex(nextHistory.length);
        return [...nextHistory, updated];
      });
    }, 800);
  };

  // Update local resume data immediately and parent data after 1.5s debounce
  const updateResumeData = (updated: Resume) => {
    setLocalResume(updated);
    setAutoSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onUpdate(updated);
      pushToHistory(updated);
      setAutoSaveStatus('saved');
    }, 1500);
  };

  // Vertical tabs mapping
  const formSections = [
    { id: 'header', label: 'Contact Info', icon: User },
    { id: 'summary', label: 'Summary', icon: AlignLeft },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
  ];

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      const prev = history[nextIndex];
      setLocalResume(prev);
      onUpdate(prev);
      toast.success('Undo successful');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const next = history[nextIndex];
      setLocalResume(next);
      onUpdate(next);
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
      await exportResumeToPDF(element, `${localResume.title || 'resume'}.pdf`);
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
      await exportResumeToDOCX(element, `${localResume.title || 'resume'}.doc`);
      toast.success('Word document downloaded successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export DOCX.');
    }
  };

  // ATS engine score calculation
  const getResumeTextContent = (): string => {
    let text = '';
    localResume.sections.forEach((sec) => {
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
      } else if (sec.type === 'languages' && sec.content.languages) {
        sec.content.languages.forEach(l => {
          text += ` ${l.language} ${l.proficiency}`;
        });
      } else if (sec.type === 'references' && sec.content.references) {
        sec.content.references.forEach(r => {
          text += ` ${r.name} ${r.company} ${r.title} ${r.email}`;
        });
      } else if (sec.type === 'custom' && sec.content.customSections) {
        sec.content.customSections.forEach(s => {
          text += ` ${s.title}`;
          s.items.forEach(i => {
            text += ` ${i.title} ${i.subtitle} ${i.description}`;
          });
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

    // 1. Keyword match - combine job keywords with target country ATS keywords
    const jobKeywords = activeJob ? [...activeJob.keywords] : [];
    let regionalKeywords: string[] = [];
    if (atsRules) {
      const parsedKeywords = typeof atsRules.keywords === 'string'
        ? JSON.parse(atsRules.keywords)
        : atsRules.keywords;
      if (Array.isArray(parsedKeywords)) {
        regionalKeywords = parsedKeywords;
      }
    }
    const allKeywordsToCheck = Array.from(new Set([...jobKeywords, ...regionalKeywords]));

    if (allKeywordsToCheck.length > 0) {
      allKeywordsToCheck.forEach(keyword => {
        if (resumeText.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
        } else {
          missingKeywords.push(keyword);
        }
      });
      keywordScore = Math.round((matchedKeywords.length / allKeywordsToCheck.length) * 100);
    } else {
      keywordScore = 100; // No keywords to check
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

    // 4. Localization Validation & regional hiring alignment checks
    const locationErrors: string[] = [];
    let phoneFormatError = '';

    const headerSec = localResume.sections.find(s => s.type === 'header');
    const headerVal = (headerSec?.content.header || {}) as any;
    const fields = (headerVal.locationFields || {}) as any;
    const targetCode = headerVal.targetCountryCode;
    const currentCode = headerVal.countryCode;

    if (targetCode && countriesList.length > 0) {
      const targetC = countriesList.find(c => c.code === targetCode);
      if (targetC) {
        const expectedFields = targetC.locationFields || [];
        const hasState = expectedFields.some((f: any) => f.key === 'state');
        const hasDistrict = expectedFields.some((f: any) => f.key === 'district');
        const hasEmirate = expectedFields.some((f: any) => f.key === 'emirate');
        const hasCounty = expectedFields.some((f: any) => f.key === 'county');
        const hasPostal = expectedFields.some((f: any) => f.key === 'postalCode');

        if (hasState && !fields.state) {
          locationErrors.push(`Missing State for target country ${targetC.name}.`);
        }
        if (hasDistrict && !fields.district) {
          locationErrors.push(`Missing District for target country ${targetC.name}.`);
        }
        if (hasEmirate && !fields.emirate) {
          locationErrors.push(`Missing Emirate for target country ${targetC.name}.`);
        }
        if (hasCounty && !fields.county) {
          locationErrors.push(`Missing County for target country ${targetC.name}.`);
        }
        if (!fields.city) {
          locationErrors.push(`Missing City for target country ${targetC.name}.`);
        }
        if (hasPostal) {
          if (!fields.postalCode) {
            locationErrors.push(`Missing ${targetC.postalCodeLabel || 'Postal Code'} for target country ${targetC.name}.`);
          } else if (targetC.code === 'US' && !/^\d{5}(-\d{4})?$/.test(fields.postalCode)) {
            locationErrors.push(`ZIP Code format invalid for United States (expected 5 digits).`);
          } else if (targetC.code === 'IN' && !/^\d{6}$/.test(fields.postalCode)) {
            locationErrors.push(`PIN Code format invalid for India (expected 6 digits).`);
          }
        }
      }
    }

    if (currentCode && headerVal.phone && countriesList.length > 0) {
      const currentC = countriesList.find(c => c.code === currentCode);
      if (currentC && currentC.phoneRegex) {
        const num = headerVal.phone;
        const dial = currentC.dialCode;
        const localNum = num.startsWith(dial) ? num.slice(dial.length).trim() : num.trim();
        if (localNum) {
          const regex = new RegExp(currentC.phoneRegex);
          if (!regex.test(localNum)) {
            phoneFormatError = `Phone number doesn't match expected pattern for ${currentC.name}: ${currentC.phoneFormat}`;
          }
        }
      }
    }

    // Apply score deductions for formatting errors
    if (locationErrors.length > 0) {
      readabilityScore = Math.max(50, readabilityScore - 10);
    }
    if (phoneFormatError) {
      readabilityScore = Math.max(50, readabilityScore - 5);
    }

    const overallScore = activeJob || regionalKeywords.length > 0
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
    if (!selectedJob && regionalKeywords.length === 0) {
      suggestions.push('Select a target job description to get tailored keyword suggestions.');
    }

    // Add target country warnings
    locationErrors.forEach(err => suggestions.push(err));
    if (phoneFormatError) {
      suggestions.push(phoneFormatError);
    }

    // Add regional hiring expectations as tips
    if (atsRules?.regionalHiringExpectations) {
      suggestions.push(`Hiring market tips for ${countriesList.find(c => c.code === targetCountry)?.name || targetCountry}: ${atsRules.regionalHiringExpectations}`);
    }
    if (atsRules?.preferredFormatting) {
      suggestions.push(`Preferred layout for ${countriesList.find(c => c.code === targetCountry)?.name || targetCountry}: ${atsRules.preferredFormatting}`);
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
    const updatedSections = localResume.sections.map((sec) => {
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
    updateResumeData({ ...localResume, sections: updatedSections });
  };

  const getSectionContent = (type: string): any => {
    return localResume.sections.find((s) => s.type === type)?.content || {};
  };

  // Reorder list items (experience, project, education, language, reference, etc.)
  const moveItem = (sectionType: string, index: number, direction: 'up' | 'down') => {
    const content = getSectionContent(sectionType);
    let listKey = '';
    if (sectionType === 'experience') listKey = 'experiences';
    else if (sectionType === 'projects') listKey = 'projects';
    else if (sectionType === 'education') listKey = 'educations';
    else if (sectionType === 'certifications') listKey = 'certifications';
    else if (sectionType === 'languages') listKey = 'languages';
    else if (sectionType === 'references') listKey = 'references';
    else if (sectionType === 'custom') listKey = 'customSections';

    if (!listKey) return;

    const list = [...(content[listKey] || [])];
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }

    updateSection(sectionType, { [listKey]: list });
  };

  // Reorder entire sections (e.g. move Skills above Summary)
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const sorted = [...localResume.sections].sort((a, b) => a.order - b.order);
    if (direction === 'up' && index > 0) {
      const temp = sorted[index].order;
      sorted[index].order = sorted[index - 1].order;
      sorted[index - 1].order = temp;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const temp = sorted[index].order;
      sorted[index].order = sorted[index + 1].order;
      sorted[index + 1].order = temp;
    }
    
    // Normalize order index
    const updated = sorted
      .sort((a, b) => a.order - b.order)
      .map((sec, idx) => ({ ...sec, order: idx }));

    updateResumeData({ ...localResume, sections: updated });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const updated = localResume.sections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, visible: !s.visible };
      }
      return s;
    });
    updateResumeData({ ...localResume, sections: updated });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans text-slate-800">
      {/* LEFT COLUMN - Edit Form with Guided Step Stepper */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 h-full">
        {/* Toggle Mode header on mobile, regular title + quick settings on desktop */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100 shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Resume Builder Editor</h2>
              <p className="text-[10px] text-slate-500 font-medium">Progress saved automatically</p>
            </div>
          </div>
          
          {/* Quick Layout Controls on Header */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 px-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Layout:</span>
              <span className="text-[11px] font-extrabold text-slate-700">Exclusive ATS (Emerald)</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Label htmlFor="quick-job-select" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Target Job:</Label>
              <Select value={selectedJob} onValueChange={(v) => {
                setSelectedJob(v);
                updateResumeData({ ...localResume, jobDescriptionId: v });
              }}>
                <SelectTrigger id="quick-job-select" className="h-8 text-xs font-semibold rounded-lg border-slate-200 bg-white min-w-[140px] max-w-[180px]">
                  <SelectValue placeholder="Select target..." />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_JOBS.map(j => (
                    <SelectItem key={j.id} value={j.id} className="text-xs">{j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 rounded-lg" onClick={handleUndo} disabled={historyIndex <= 0} title="Undo">
                <Undo className="w-3.5 h-3.5 text-slate-600" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 rounded-lg" onClick={handleRedo} disabled={historyIndex >= history.length - 1} title="Redo">
                <Redo className="w-3.5 h-3.5 text-slate-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Card with guided steps */}
        <Card className="border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-210px)] bg-white shadow-sm p-0 rounded-xl">
          {/* Horizontal Stepper Progress Indicator */}
          <div className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
            {WIZARD_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = WIZARD_STEPS.findIndex(s => s.key === activeEditTab) > idx;
              const isActive = activeEditTab === step.key;
              
              return (
                <div key={step.id} className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveEditTab(step.key)}
                    className={cn(
                      "flex items-center gap-2 p-1.5 px-3 rounded-xl text-xs font-bold transition-all border outline-none",
                      isActive 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105" 
                        : isCompleted 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black border",
                      isActive 
                        ? "bg-white/20 border-white/30 text-white" 
                        : isCompleted 
                          ? "bg-emerald-100 border-emerald-200 text-emerald-800" 
                          : "bg-slate-100 border-slate-200 text-slate-600"
                    )}>
                      {step.id}
                    </span>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{step.label}</span>
                  </button>
                  {idx < WIZARD_STEPS.length - 1 && (
                    <div className={cn(
                      "w-4 h-[2px] rounded-full shrink-0",
                      isCompleted ? "bg-emerald-400" : "bg-slate-200"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto h-full">
            <Tabs value={activeEditTab} onValueChange={setActiveEditTab} className="w-full h-full">


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
                        className={cn(!isValidEmail(getSectionContent('header').header?.email) && "border-red-500 focus-visible:ring-red-500")}
                        value={getSectionContent('header').header?.email || ''}
                        onChange={(e) => updateSection('header', {
                          header: { ...getSectionContent('header').header, email: e.target.value }
                        })}
                      />
                      {!isValidEmail(getSectionContent('header').header?.email) && (
                        <span className="text-[10px] text-red-500 font-medium block">Please enter a valid email address.</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <CountryLocationFields
                        compact
                        countryCode={getSectionContent('header').header?.countryCode || ''}
                        locationFields={getSectionContent('header').header?.locationFields || {}}
                        phone={getSectionContent('header').header?.phone || ''}
                        targetCountryCode={getSectionContent('header').header?.targetCountryCode || ''}
                        onCountryChange={(code) => updateSection('header', {
                          header: { ...getSectionContent('header').header, countryCode: code }
                        })}
                        onTargetCountryChange={(code) => updateSection('header', {
                          header: { ...getSectionContent('header').header, targetCountryCode: code }
                        })}
                        onLocationFieldChange={(fields) => updateSection('header', {
                          header: { ...getSectionContent('header').header, locationFields: fields }
                        })}
                        onPhoneChange={(phone) => updateSection('header', {
                          header: { ...getSectionContent('header').header, phone }
                        })}
                        onLocationStringChange={(location) => updateSection('header', {
                          header: { ...getSectionContent('header').header, location }
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
                          className={cn(!isValidUrl(getSectionContent('header').header?.links?.find((l: any) => l.label.toLowerCase() === 'linkedin')?.url) && "border-red-500 focus-visible:ring-red-500")}
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
                        {!isValidUrl(getSectionContent('header').header?.links?.find((l: any) => l.label.toLowerCase() === 'linkedin')?.url) && (
                          <span className="text-[10px] text-red-500 font-medium block">Please enter a valid URL.</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-github">GitHub URL</Label>
                        <Input
                          id="edit-github"
                          placeholder="github.com/username"
                          className={cn(!isValidUrl(getSectionContent('header').header?.links?.find((l: any) => l.label.toLowerCase() === 'github')?.url) && "border-red-500 focus-visible:ring-red-500")}
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
                        {!isValidUrl(getSectionContent('header').header?.links?.find((l: any) => l.label.toLowerCase() === 'github')?.url) && (
                          <span className="text-[10px] text-red-500 font-medium block">Please enter a valid URL.</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-portfolio">Portfolio Website URL</Label>
                        <Input
                          id="edit-portfolio"
                          placeholder="yourportfolio.com"
                          className={cn(!isValidUrl(getSectionContent('header').header?.links?.find((l: any) => l.label.toLowerCase() === 'portfolio' || l.label.toLowerCase() === 'website')?.url) && "border-red-500 focus-visible:ring-red-500")}
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
                        {!isValidUrl(getSectionContent('header').header?.links?.find((l: any) => l.label.toLowerCase() === 'portfolio' || l.label.toLowerCase() === 'website')?.url) && (
                          <span className="text-[10px] text-red-500 font-medium block">Please enter a valid URL.</span>
                        )}
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
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('experience', idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('experience', idx, 'down')}
                              disabled={idx === (getSectionContent('experience').experiences || []).length - 1}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                              const list = (getSectionContent('experience').experiences || []).filter((e: any) => e.id !== exp.id);
                              updateSection('experience', { experiences: list });
                            }}>
                              Delete
                            </Button>
                          </div>
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
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('projects', idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('projects', idx, 'down')}
                              disabled={idx === (getSectionContent('projects').projects || []).length - 1}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                              const list = (getSectionContent('projects').projects || []).filter((p: any) => p.id !== proj.id);
                              updateSection('projects', { projects: list });
                            }}>
                              Delete
                            </Button>
                          </div>
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
                              className={cn(!isValidUrl(proj.link) && "border-red-500 focus-visible:ring-red-500")}
                              onChange={(e) => {
                                const list = [...getSectionContent('projects').projects];
                                list[idx].link = e.target.value;
                                updateSection('projects', { projects: list });
                              }}
                            />
                            {!isValidUrl(proj.link) && (
                              <span className="text-[10px] text-red-500 font-medium block">Please enter a valid URL.</span>
                            )}
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
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('education', idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('education', idx, 'down')}
                              disabled={idx === (getSectionContent('education').educations || []).length - 1}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                              const list = (getSectionContent('education').educations || []).filter((e: any) => e.id !== edu.id);
                              updateSection('education', { educations: list });
                            }}>
                              Delete
                            </Button>
                          </div>
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
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('certifications', idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('certifications', idx, 'down')}
                              disabled={idx === (getSectionContent('certifications').certifications || []).length - 1}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                              const list = (getSectionContent('certifications').certifications || []).filter((c: any) => c.id !== cert.id);
                              updateSection('certifications', { certifications: list });
                            }}>
                              Delete
                            </Button>
                          </div>
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
                              className={cn(!isValidUrl(cert.link) && "border-red-500 focus-visible:ring-red-500")}
                              onChange={(e) => {
                                const list = [...getSectionContent('certifications').certifications];
                                list[idx].link = e.target.value;
                                updateSection('certifications', { certifications: list });
                              }}
                            />
                            {!isValidUrl(cert.link) && (
                              <span className="text-[10px] text-red-500 font-medium block">Please enter a valid URL.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* LANGUAGES TAB */}
                <TabsContent value="languages" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base font-medium">Languages Spoken</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const cur = getSectionContent('languages').languages || [];
                      updateSection('languages', {
                        languages: [...cur, { language: '', proficiency: '' }]
                      });
                    }}>
                      Add Language
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(getSectionContent('languages').languages || []).map((lang: any, idx: number) => (
                      <div key={idx} className="border border-slate-100 p-4 rounded-lg space-y-3 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Language #{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('languages', idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('languages', idx, 'down')}
                              disabled={idx === (getSectionContent('languages').languages || []).length - 1}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                              const list = (getSectionContent('languages').languages || []).filter((_: any, i: number) => i !== idx);
                              updateSection('languages', { languages: list });
                            }}>
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Language *</Label>
                            <Input
                              value={lang.language}
                              placeholder="e.g. French"
                              onChange={(e) => {
                                const list = [...getSectionContent('languages').languages];
                                list[idx].language = e.target.value;
                                updateSection('languages', { languages: list });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Proficiency</Label>
                            <Input
                              value={lang.proficiency}
                              placeholder="e.g. Professional Working, Native"
                              onChange={(e) => {
                                const list = [...getSectionContent('languages').languages];
                                list[idx].proficiency = e.target.value;
                                updateSection('languages', { languages: list });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(getSectionContent('languages').languages || []).length === 0 && (
                      <p className="text-xs text-slate-400 italic">No languages added. Add languages to showcase bilingual or multilingual skills.</p>
                    )}
                  </div>
                </TabsContent>

                {/* REFERENCES TAB */}
                <TabsContent value="references" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base font-medium">Professional References</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const cur = getSectionContent('references').references || [];
                      updateSection('references', {
                        references: [...cur, { id: nanoid(), name: '', company: '', title: '', email: '', phone: '', availableOnRequest: false }]
                      });
                    }}>
                      Add Reference
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(getSectionContent('references').references || []).map((ref: any, idx: number) => (
                      <div key={ref.id || idx} className="border border-slate-100 p-4 rounded-lg space-y-3 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Reference #{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('references', idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('references', idx, 'down')}
                              disabled={idx === (getSectionContent('references').references || []).length - 1}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => {
                              const list = (getSectionContent('references').references || []).filter((r: any) => r.id !== ref.id);
                              updateSection('references', { references: list });
                            }}>
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pb-1">
                          <input
                            type="checkbox"
                            id={`ref-available-${ref.id}`}
                            checked={ref.availableOnRequest}
                            onChange={(e) => {
                              const list = [...getSectionContent('references').references];
                              list[idx].availableOnRequest = e.target.checked;
                              updateSection('references', { references: list });
                            }}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <Label htmlFor={`ref-available-${ref.id}`} className="text-xs font-semibold text-slate-700 cursor-pointer">
                            Available upon request
                          </Label>
                        </div>

                        {!ref.availableOnRequest && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Name *</Label>
                              <Input
                                value={ref.name}
                                placeholder="e.g. Jane Doe"
                                onChange={(e) => {
                                  const list = [...getSectionContent('references').references];
                                  list[idx].name = e.target.value;
                                  updateSection('references', { references: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Company</Label>
                              <Input
                                value={ref.company}
                                placeholder="e.g. Google"
                                onChange={(e) => {
                                  const list = [...getSectionContent('references').references];
                                  list[idx].company = e.target.value;
                                  updateSection('references', { references: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={ref.title}
                                placeholder="e.g. Director of Engineering"
                                onChange={(e) => {
                                  const list = [...getSectionContent('references').references];
                                  list[idx].title = e.target.value;
                                  updateSection('references', { references: list });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Email</Label>
                              <Input
                                type="email"
                                value={ref.email}
                                placeholder="jane.doe@example.com"
                                className={cn(!isValidEmail(ref.email) && "border-red-500 focus-visible:ring-red-500")}
                                onChange={(e) => {
                                  const list = [...getSectionContent('references').references];
                                  list[idx].email = e.target.value;
                                  updateSection('references', { references: list });
                                }}
                              />
                              {!isValidEmail(ref.email) && (
                                <span className="text-[9px] text-red-500 font-semibold block">Invalid email format.</span>
                              )}
                            </div>
                            <div className="space-y-1 col-span-2">
                              <Label className="text-xs">Phone</Label>
                              <Input
                                value={ref.phone}
                                placeholder="e.g. +1 (555) 019-2834"
                                className={cn(!isValidPhone(ref.phone) && "border-red-500 focus-visible:ring-red-500")}
                                onChange={(e) => {
                                  const list = [...getSectionContent('references').references];
                                  list[idx].phone = e.target.value;
                                  updateSection('references', { references: list });
                                }}
                              />
                              {!isValidPhone(ref.phone) && (
                                <span className="text-[9px] text-red-500 font-semibold block">Invalid phone number.</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {(getSectionContent('references').references || []).length === 0 && (
                      <p className="text-xs text-slate-400 italic">No references added. Add references or select "Available upon request".</p>
                    )}
                  </div>
                </TabsContent>

                {/* CUSTOM SECTIONS TAB */}
                <TabsContent value="custom" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base font-medium">Custom Sections</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const cur = getSectionContent('custom').customSections || [];
                      updateSection('custom', {
                        customSections: [...cur, { id: nanoid(), title: '', items: [] }]
                      });
                    }}>
                      Add Custom Section
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {(getSectionContent('custom').customSections || []).map((sect: any, sectIdx: number) => (
                      <div key={sect.id || sectIdx} className="border border-slate-200 p-4 rounded-lg space-y-4 bg-slate-50/50">
                        <div className="flex justify-between items-center gap-3">
                          <div className="flex-1 max-w-sm">
                            <Label className="text-xs font-bold text-slate-500">Section Title *</Label>
                            <Input
                              value={sect.title}
                              placeholder="e.g. Volunteer Work, Patents"
                              className="font-bold h-9 mt-1"
                              onChange={(e) => {
                                const list = [...getSectionContent('custom').customSections];
                                list[sectIdx].title = e.target.value;
                                updateSection('custom', { customSections: list });
                              }}
                            />
                          </div>
                          
                          <div className="flex items-center gap-2 mt-5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('custom', sectIdx, 'up')}
                              disabled={sectIdx === 0}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-slate-700" 
                              onClick={() => moveItem('custom', sectIdx, 'down')}
                              disabled={sectIdx === (getSectionContent('custom').customSections || []).length - 1}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 h-8 font-bold" onClick={() => {
                              const list = (getSectionContent('custom').customSections || []).filter((s: any) => s.id !== sect.id);
                              updateSection('custom', { customSections: list });
                            }}>
                              Remove
                            </Button>
                          </div>
                        </div>

                        {/* Items in custom section */}
                        <div className="space-y-3 bg-white border border-slate-100 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Section Items</span>
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                              const list = [...getSectionContent('custom').customSections];
                              list[sectIdx].items = [...(list[sectIdx].items || []), { id: nanoid(), title: '', subtitle: '', description: '' }];
                              updateSection('custom', { customSections: list });
                            }}>
                              Add Item
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {(sect.items || []).map((item: any, itemIdx: number) => (
                              <div key={item.id || itemIdx} className="border border-slate-100 p-3 rounded-md bg-slate-50 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-400">Item #{itemIdx + 1}</span>
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-slate-400 hover:text-slate-600" 
                                      onClick={() => {
                                        const list = [...getSectionContent('custom').customSections];
                                        const items = [...list[sectIdx].items];
                                        if (itemIdx > 0) {
                                          const tmp = items[itemIdx];
                                          items[itemIdx] = items[itemIdx - 1];
                                          items[itemIdx - 1] = tmp;
                                          list[sectIdx].items = items;
                                          updateSection('custom', { customSections: list });
                                        }
                                      }}
                                      disabled={itemIdx === 0}
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-slate-400 hover:text-slate-600" 
                                      onClick={() => {
                                        const list = [...getSectionContent('custom').customSections];
                                        const items = [...list[sectIdx].items];
                                        if (itemIdx < items.length - 1) {
                                          const tmp = items[itemIdx];
                                          items[itemIdx] = items[itemIdx + 1];
                                          items[itemIdx + 1] = tmp;
                                          list[sectIdx].items = items;
                                          updateSection('custom', { customSections: list });
                                        }
                                      }}
                                      disabled={itemIdx === (sect.items || []).length - 1}
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => {
                                      const list = [...getSectionContent('custom').customSections];
                                      list[sectIdx].items = list[sectIdx].items.filter((i: any) => i.id !== item.id);
                                      updateSection('custom', { customSections: list });
                                    }}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-[10px]">Item Title *</Label>
                                    <Input
                                      value={item.title}
                                      placeholder="e.g. Volunteer"
                                      className="h-8 text-xs"
                                      onChange={(e) => {
                                        const list = [...getSectionContent('custom').customSections];
                                        list[sectIdx].items[itemIdx].title = e.target.value;
                                        updateSection('custom', { customSections: list });
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px]">Subtitle / Organization</Label>
                                    <Input
                                      value={item.subtitle}
                                      placeholder="e.g. Red Cross"
                                      className="h-8 text-xs"
                                      onChange={(e) => {
                                        const list = [...getSectionContent('custom').customSections];
                                        list[sectIdx].items[itemIdx].subtitle = e.target.value;
                                        updateSection('custom', { customSections: list });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px]">Description</Label>
                                  <Textarea
                                    value={item.description || ''}
                                    placeholder="e.g. Managed team of 15 volunteers..."
                                    className="text-xs"
                                    rows={2}
                                    onChange={(e) => {
                                      const list = [...getSectionContent('custom').customSections];
                                      list[sectIdx].items[itemIdx].description = e.target.value;
                                      updateSection('custom', { customSections: list });
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(getSectionContent('custom').customSections || []).length === 0 && (
                      <p className="text-xs text-slate-400 italic">No custom sections added. Add volunteer work, certifications, patents, or publications.</p>
                    )}
                  </div>
                </TabsContent>

                {/* LAYOUT TAB */}
                <TabsContent value="layout" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-base font-medium">Section Order & Visibility</h3>
                    <p className="text-xs text-slate-500">Arrange and show/hide resume sections</p>
                  </div>
                  <div className="space-y-2 border border-slate-250 rounded-xl p-4 bg-slate-50/50">
                    {[...localResume.sections].sort((a, b) => a.order - b.order).map((sec, idx, sortedList) => (
                      <div key={sec.id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                          <span className="text-sm font-semibold capitalize text-slate-700">
                            {sec.type === 'custom' ? `Custom Sections` : sec.type === 'certifications' ? 'Certifications (Credentials)' : sec.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Toggle visibility */}
                          <div className="flex items-center gap-1.5 mr-2">
                            <input
                              type="checkbox"
                              id={`vis-${sec.id}`}
                              checked={sec.visible}
                              onChange={() => toggleSectionVisibility(sec.id)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            />
                            <label htmlFor={`vis-${sec.id}`} className="text-xs font-medium text-slate-500 cursor-pointer select-none">
                              {sec.visible ? 'Visible' : 'Hidden'}
                            </label>
                          </div>
                          {/* Move up / down */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-700"
                            onClick={() => moveSection(idx, 'up')}
                            disabled={idx === 0 || sec.type === 'header'} // header is usually locked at top
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-700"
                            onClick={() => moveSection(idx, 'down')}
                            disabled={idx === sortedList.length - 1 || sec.type === 'header'}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* ACHIEVEMENTS & FINAL REVIEW TAB */}
                <TabsContent value="achievements" className="space-y-6">
                  {/* 1. Achievements Editor */}
                  <div className="space-y-4 border-b border-slate-100 pb-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">Achievements Highlights</h3>
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => {
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
                            className="h-10 rounded-xl"
                          />
                          <Button variant="ghost" size="sm" className="text-red-500 h-9" onClick={() => {
                            const list = (getSectionContent('achievements').achievements || []).filter((_: any, i: number) => i !== idx);
                            updateSection('achievements', { achievements: list });
                          }}>
                            Remove
                          </Button>
                        </div>
                      ))}
                      {(getSectionContent('achievements').achievements || []).length === 0 && (
                        <p className="text-xs text-slate-400 italic">No achievements added. Add key milestones to stand out.</p>
                      )}
                    </div>
                  </div>

                  {/* 2. Review and Download Section */}
                  <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">Final Review & Export</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Detailed ATS Score Widget */}
                      <Card className="border border-slate-200/80 shadow-sm p-4 space-y-4 bg-slate-50/50 rounded-xl">
                        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                          ATS Score Details
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="relative flex items-center justify-center shrink-0">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                              <circle cx="32" cy="32" r="28" stroke={atsSummary.score >= 70 ? "#10b981" : atsSummary.score >= 40 ? "#f59e0b" : "#ef4444"} strokeWidth="6" fill="transparent"
                                strokeDasharray={175} strokeDashoffset={175 - (175 * atsSummary.score) / 100} />
                            </svg>
                            <span className="absolute text-base font-black text-slate-800">{atsSummary.score}</span>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-800">
                              {atsSummary.score >= 70 ? 'Ready for Applications!' : atsSummary.score >= 40 ? 'Needs Improvement' : 'Urgent Actions Required'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-semibold">Keywords: {atsSummary.matchedKeywords.length} matched</p>
                            <p className="text-[10px] text-slate-500 font-semibold">Sections: {atsSummary.completenessScore}% filled</p>
                          </div>
                        </div>

                        {atsSummary.suggestions.length > 0 && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1">
                            <span className="text-[10px] font-black text-amber-800 block">Suggestions:</span>
                            <ul className="text-[10px] text-amber-700 list-disc pl-4 space-y-1 font-medium max-h-24 overflow-y-auto font-medium">
                              {atsSummary.suggestions.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>

                      {/* Completion Panel */}
                      <Card className="border border-slate-200/80 shadow-sm p-6 flex flex-col items-center justify-center text-center bg-white rounded-xl space-y-4 min-h-[220px]">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 animate-pulse">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 text-sm">All Sections Completed!</h4>
                          <p className="text-[10px] text-slate-500 max-w-[240px]">
                            You have filled in all the core information. Click "Finish & Export" to download your ATS-ready resume.
                          </p>
                        </div>
                        
                        <Button 
                          onClick={() => setShowDownloadModal(true)} 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 h-10 px-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-200" />
                          Finish & Export
                        </Button>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
            </Tabs>
          </div>
          
          {/* Wizard Navigation Footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
            <Button
              variant="outline"
              disabled={activeEditTab === 'header'}
              onClick={() => {
                const curIdx = WIZARD_STEPS.findIndex(s => s.key === activeEditTab);
                if (curIdx > 0) {
                  setActiveEditTab(WIZARD_STEPS[curIdx - 1].key);
                }
              }}
              className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold px-5 h-10 rounded-xl"
            >
              Back
            </Button>
            
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Step {WIZARD_STEPS.findIndex(s => s.key === activeEditTab) + 1} of {WIZARD_STEPS.length}
            </div>

            <Button
              onClick={() => {
                const curIdx = WIZARD_STEPS.findIndex(s => s.key === activeEditTab);
                if (curIdx < WIZARD_STEPS.length - 1) {
                  setActiveEditTab(WIZARD_STEPS[curIdx + 1].key);
                } else {
                  setShowDownloadModal(true);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 h-10 rounded-xl"
            >
              {activeEditTab === WIZARD_STEPS[WIZARD_STEPS.length - 1].key ? 'Finish & Export' : 'Next Step'}
            </Button>
          </div>
        </Card>
      </div>

      {/* RIGHT COLUMN - Live Preview */}
      <div className={cn(
        "col-span-12 flex flex-col gap-4 h-full transition-all duration-300 lg:col-span-5",
        previewMode === 'edit' ? "hidden lg:flex" : "flex"
      )}>
        {/* Toggle Mode header on mobile (hidden on desktop) */}
        <div className="lg:hidden flex justify-between items-center bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as any)} className="w-full">
            <TabsList className="grid grid-cols-2 w-48">
              <TabsTrigger value="edit" className="gap-1.5 py-1.5 text-xs">
                <Edit3 className="w-3.5 h-3.5" />
                Edit Form
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1.5 py-1.5 text-xs">
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Live Preview Card with zoom controls */}
        <Card className="border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-210px)] bg-white shadow-sm p-0 rounded-xl">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Live Preview</span>
              
              {/* Quick ATS Badge */}
              <div className="relative group cursor-pointer flex items-center gap-1.5 bg-white border border-slate-200 p-1 px-2.5 rounded-full shadow-sm hover:border-emerald-300 hover:bg-emerald-50/20 transition-all select-none">
                <span className="relative flex h-2 w-2">
                  <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    atsSummary.score >= 70 ? "bg-emerald-400" : atsSummary.score >= 40 ? "bg-amber-400" : "bg-rose-400"
                  )}></span>
                  <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    atsSummary.score >= 70 ? "bg-emerald-500" : atsSummary.score >= 40 ? "bg-amber-500" : "bg-rose-500"
                  )}></span>
                </span>
                <span className="text-[10px] font-black text-slate-600">ATS: {atsSummary.score}</span>
                
                {/* Detailed ATS tooltip popover on hover */}
                <div className="invisible group-hover:visible absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50 text-slate-700 transition-all text-left">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    ATS Optimization
                  </h4>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-500">Overall Match:</span>
                      <span className="font-bold text-slate-800">{atsSummary.score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-500">Keywords:</span>
                      <span className="font-bold text-slate-800">{atsSummary.matchedKeywords.length} matched</span>
                    </div>
                    {atsSummary.suggestions.length > 0 && (
                      <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-lg p-2 mt-1">
                        <span className="font-bold block mb-1">Suggestions:</span>
                        <ul className="list-disc pl-3.5 space-y-0.5 max-h-24 overflow-y-auto font-medium">
                          {atsSummary.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 items-center">
              <Button variant="outline" size="icon" className="h-7 w-7 border-slate-200" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                <ZoomOut className="w-3.5 h-3.5 text-slate-500" />
              </Button>
              <span className="text-[11px] text-slate-600 font-extrabold px-1 min-w-[32px] text-center">{zoom}%</span>
              <Button variant="outline" size="icon" className="h-7 w-7 border-slate-200" onClick={() => setZoom(Math.min(150, zoom + 10))}>
                <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex">
            <ResumePreview resume={localResume} templateId={selectedTemplate} zoom={zoom} />
          </div>
        </Card>
      </div>
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-lg border border-slate-200/80 shadow-2xl bg-white rounded-2xl overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 p-6 text-white text-center relative">
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-lg font-bold outline-none"
              >
                ✕
              </button>
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-200 animate-bounce" />
              <h3 className="text-xl font-bold">Resume Completed!</h3>
              <p className="text-xs text-emerald-100/90 mt-1">Your ATS-optimized resume is ready for download</p>
            </div>
            
            {/* Content */}
            <CardContent className="p-6 space-y-6">
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                    <circle cx="24" cy="24" r="20" stroke={atsSummary.score >= 70 ? "#10b981" : atsSummary.score >= 40 ? "#f59e0b" : "#ef4444"} strokeWidth="4" fill="transparent"
                      strokeDasharray={125} strokeDashoffset={125 - (125 * atsSummary.score) / 100} />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-800">{atsSummary.score}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800">ATS Match Score</span>
                  <p className="text-[10px] text-slate-500 font-semibold">Keywords: {atsSummary.matchedKeywords.length} matched • Sections: {atsSummary.completenessScore}% filled</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleExportPDF} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 h-12 rounded-xl shadow-md transition-all flex items-center justify-center"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Format
                </Button>
              </div>
            </CardContent>
            
            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end">
              <Button 
                variant="ghost" 
                onClick={() => setShowDownloadModal(false)}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 h-9 px-4 rounded-lg"
              >
                Back to Editor
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
