import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Upload, FileText, Linkedin, AlertTriangle, Trash2, Edit3, Lock, Plus, Target, Briefcase, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import ResumeUploader from '@/components/ResumeUploader';
import ResumeScratchBuilder from '@/components/ResumeScratchBuilder';
import ResumeAIGenerator from '@/components/ResumeAIGenerator';
import ResumeLinkedInImporter from '@/components/ResumeLinkedInImporter';
import ResumeEditor from '@/components/ResumeEditor';
import { Resume, ParsedResume, ResumeSection } from '@shared/types';
import { nanoid } from 'nanoid';
import { useResumeStorage } from '@/_core/hooks/useResumeStorage';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { matchPresetJobByTitle } from '@/lib/jobDescriptions';
import { ensureStandardResumeSections } from '@/lib/resumeSections';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ResumeBuilder() {
  const { isAuthenticated } = useAuth();
  const storage = useResumeStorage();
  const [location, setLocation] = useLocation();

  const [targetProfile, setTargetProfile] = useState<{
    targetRole: string;
    experience: string;
    market: string;
    jobDescription: string;
  } | null>(null);

  const [setupTargetRole, setSetupTargetRole] = useState('');
  const [setupExperience, setSetupExperience] = useState('3–5 yrs');
  const [setupMarket, setSetupMarket] = useState('Global');
  const [setupJobDescription, setSetupJobDescription] = useState('');

  const [mode, setMode] = useState<'upload' | 'scratch' | 'ai' | 'linkedin'>(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode');
    if (m === 'scratch' || m === 'ai' || m === 'linkedin') {
      return m;
    }
    return 'upload';
  });
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [resumesList, setResumesList] = useState<Resume[]>([]);

  // Fetch resumes list on mount and when activeResume changes
  const fetchResumes = async () => {
    try {
      const list = await storage.listResumes();
      setResumesList(list);
    } catch (e) {
      console.error("Failed to load resumes list:", e);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [activeResume]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode');
    if (m === 'scratch' || m === 'ai' || m === 'linkedin' || m === 'upload') {
      setMode(m);
      setActiveResume(null);
    }
  }, [location]);

  const createResumeFromParsed = (parsed: ParsedResume): Resume => {
    let targetCountryCode = parsed.header?.targetCountryCode || '';
    if (targetProfile) {
      if (targetProfile.market === 'India') targetCountryCode = 'IN';
      else if (targetProfile.market === 'Gulf') targetCountryCode = 'AE';
      else if (targetProfile.market === 'US') targetCountryCode = 'US';
      else if (targetProfile.market === 'Global') targetCountryCode = 'GB';
    }

    const sections: ResumeSection[] = [
      {
        id: nanoid(),
        type: 'header',
        order: 1,
        visible: true,
        content: {
          header: {
            name: parsed.header?.name || '',
            email: parsed.header?.email || '',
            phone: parsed.header?.phone || '',
            location: parsed.header?.location || '',
            links: parsed.header?.links || [],
            jobTitle: targetProfile?.targetRole || parsed.header?.jobTitle || '',
            targetRole: targetProfile?.targetRole || parsed.header?.targetRole || parsed.header?.jobTitle || '',
            countryCode: parsed.header?.countryCode || '',
            locationFields: parsed.header?.locationFields || {},
            targetCountryCode: targetCountryCode,
          }
        }
      },
      {
        id: nanoid(),
        type: 'summary',
        order: 2,
        visible: true,
        content: { summary: parsed.summary || '' }
      },
      {
        id: nanoid(),
        type: 'skills',
        order: 3,
        visible: true,
        content: { skills: parsed.skills || [] }
      },
      {
        id: nanoid(),
        type: 'experience',
        order: 4,
        visible: true,
        content: { experiences: parsed.experiences || [] }
      },
      {
        id: nanoid(),
        type: 'projects',
        order: 5,
        visible: true,
        content: { projects: parsed.projects || [] }
      },
      {
        id: nanoid(),
        type: 'education',
        order: 6,
        visible: true,
        content: { educations: parsed.educations || [] }
      },
      {
        id: nanoid(),
        type: 'certifications',
        order: 7,
        visible: true,
        content: { certifications: parsed.certifications || [] }
      },
      {
        id: nanoid(),
        type: 'achievements',
        order: 8,
        visible: true,
        content: { achievements: parsed.achievements || [] }
      },
      {
        id: nanoid(),
        type: 'languages',
        order: 9,
        visible: true,
        content: { languages: parsed.languages || [] }
      },
      {
        id: nanoid(),
        type: 'references',
        order: 10,
        visible: true,
        content: { references: parsed.references || [] }
      }
    ];

    const matchedJobId = matchPresetJobByTitle(
      targetProfile?.targetRole || parsed.header?.jobTitle,
      targetProfile?.targetRole || parsed.header?.targetRole || parsed.header?.jobTitle
    );

    return ensureStandardResumeSections({
      id: nanoid(),
      userId: isAuthenticated ? 'user' : 'guest',
      title: parsed.header?.name ? `${parsed.header.name}'s Resume` : 'Untitled Resume',
      templateId: 'classic-ats-blue',
      jobDescriptionId: matchedJobId || undefined,
      sections,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  const handleResumeLoad = async (parsed: ParsedResume) => {
    if (!isAuthenticated && resumesList.length >= 3) {
      toast.error("Guest limit reached! You can save a maximum of 3 resumes locally. Please sign in to save unlimited resumes.");
      return;
    }
    const newResume = createResumeFromParsed(parsed);
    try {
      const saved = await storage.saveResume(newResume);
      setActiveResume(saved);
      const jobTitle = parsed.header?.jobTitle;
      const targetRole = parsed.header?.targetRole;
      if (jobTitle || targetRole) {
        toast.success(
          `Resume parsed. Job title: ${jobTitle || "—"}, Target role: ${targetRole || jobTitle || "—"}`
        );
      } else {
        toast.success("Draft saved successfully!");
      }
    } catch (e: any) {
      toast.error("Failed to save resume: " + e.message);
    }
  };

  const handleResumeUpdate = async (updatedResume: Resume) => {
    try {
      const saved = await storage.saveResume(updatedResume);
      setActiveResume(saved);
    } catch (e: any) {
      toast.error("Failed to save updates: " + e.message);
    }
  };

  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this draft?")) return;
    try {
      await storage.deleteResume(id);
      toast.success("Draft deleted.");
      fetchResumes();
    } catch (err) {
      toast.error("Failed to delete draft.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans glass-bg">
      {/* Guest Mode Alert Banner */}
      {!isAuthenticated && activeResume && (
        <div className="bg-amber-500/10 dark:bg-amber-500/5 backdrop-blur-md text-amber-800 dark:text-amber-250 px-4 py-2 text-center text-xs font-semibold shadow-xs flex items-center justify-center gap-2 relative z-50 animate-fade-in border-b border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
          <span>Working as Guest: Your resumes are saved locally to this browser.</span>
          <Button 
            size="sm" 
            onClick={() => setLocation("/login?convert=true")}
            className="ml-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white font-bold py-1 px-3 text-xs shadow-xs rounded-lg h-7 transition-colors border-none cursor-pointer"
          >
            <Lock className="w-3 h-3 mr-1" />
            Save to Account
          </Button>
        </div>
      )}

      {/* Header */}
      <header className="bg-card/45 dark:bg-slate-950/40 border-b border-border dark:border-white/10 sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-350 hover:text-foreground dark:hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/icon-192.png" alt="HexaCv Logo" className="w-9 h-9 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">HexaCv Resume Builder</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Build your ATS-friendly resume</p>
              </div>
            </div>
          </div>
          {activeResume && (
            <Button
              variant="outline"
              onClick={() => setActiveResume(null)}
              className="border-border dark:border-white/10 text-foreground dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 font-medium rounded-lg text-sm transition-colors bg-card dark:bg-white/5"
            >
              Start New / View Drafts
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-6 py-8 flex-grow flex flex-col">
        {activeResume ? (
          <div className="h-[calc(100vh-180px)] flex-grow">
            <ResumeEditor resume={activeResume} onUpdate={handleResumeUpdate} />
          </div>
        ) : (
          <div className="space-y-8 w-full animate-fade-slide-up">
            {/* Guest limit reminder */}
             {!isAuthenticated && resumesList.length > 0 && (
              <Card className="border border-amber-500/20 bg-amber-500/5 rounded-2xl shadow-sm backdrop-blur-sm">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-800 dark:text-amber-200 text-sm">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>You have used <strong className="font-extrabold">{resumesList.length}/3</strong> guest resume slots. Sign in to unlock unlimited cloud storage.</span>
                  </div>
                  <Link href="/login">
                    <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-850 dark:text-amber-100 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 text-xs font-bold rounded-lg shrink-0 bg-transparent">
                      Sign In / Create Account
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* List of drafts */}
            {resumesList.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Your Saved Drafts</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {resumesList.map((r) => (
                    <Card 
                      key={r.id} 
                      onClick={() => setActiveResume(r)}
                      className="glass-panel cursor-pointer hover:shadow-md hover:border-primary/45 transition-all dark:bg-slate-900/20 flex flex-col justify-between rounded-xl overflow-hidden group"
                    >
                      <CardHeader className="pb-3 pt-5 px-5">
                        <CardTitle className="text-base text-slate-800 dark:text-slate-200 font-bold truncate group-hover:text-primary transition-colors">{r.title}</CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Last edited: {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "unknown"}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-2.5 pb-3 px-5 border-t border-border dark:border-white/10 bg-slate-100/50 dark:bg-slate-950/20 flex justify-between items-center">
                        <Badge variant="outline" className="text-[10px] bg-slate-55 dark:bg-white/5 border-border dark:border-white/10 text-slate-650 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md">
                          {r.userId === 'guest' ? 'Local Storage' : 'Cloud Sync'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-slate-550 hover:text-foreground dark:text-slate-400 dark:hover:text-slate-200 p-1.5 h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveResume(r);
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/10 p-1.5 h-8 w-8 rounded-lg transition-all"
                            onClick={(e) => handleDeleteDraft(r.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                  {!isAuthenticated && resumesList.length < 3 && (
                    <Card 
                      onClick={() => setMode('scratch')}
                      className="border border-dashed border-slate-300 dark:border-white/20 hover:border-blue-400/50 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex flex-col items-center justify-center p-6 text-center transition-all rounded-xl min-h-[125px] group bg-slate-50/50 dark:bg-slate-900/10"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-2 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-primary transition-colors border border-slate-200 dark:border-white/10">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-350 group-hover:text-primary dark:group-hover:text-white transition-colors">Create Another Resume</span>
                      <span className="text-xs text-slate-550 dark:text-slate-500 mt-1">({3 - resumesList.length} slots remaining)</span>
                    </Card>
                  )}
                </div>
              </div>
            )}
                      {/* Target Profile Setup or Creation Tabs */}
            {targetProfile && (
              <Card className="border border-blue-500/20 bg-blue-500/5 rounded-2xl shadow-sm backdrop-blur-sm animate-fade-slide-up">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-500 shrink-0 animate-pulse" />
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        Targeting: <span className="text-blue-600 dark:text-blue-400">{targetProfile.targetRole}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Experience: <span className="font-semibold text-slate-700 dark:text-slate-350">{targetProfile.experience}</span> &middot; Market: <span className="font-semibold text-slate-700 dark:text-slate-350">{targetProfile.market}</span>
                        {targetProfile.jobDescription && " &middot; Job Description Provided"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setSetupTargetRole(targetProfile.targetRole);
                      setSetupExperience(targetProfile.experience);
                      setSetupMarket(targetProfile.market);
                      setSetupJobDescription(targetProfile.jobDescription);
                      setTargetProfile(null);
                    }}
                    className="border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold rounded-lg shrink-0 bg-transparent cursor-pointer"
                  >
                    Change Target Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {!targetProfile ? (
              <Card className="glass-panel rounded-2xl overflow-hidden dark:bg-slate-900/20 border-slate-200 dark:border-white/10 shadow-lg animate-fade-slide-up">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-white/10 p-6">
                  <CardTitle className="flex items-center gap-2.5 font-extrabold text-slate-900 dark:text-slate-100 text-xl">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Configure Target Profile
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Specify your target preferences to unlock the builder. This configures ATS optimizations and prefills your resume.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="setup-target-role" className="font-bold text-slate-700 dark:text-slate-350 text-xs uppercase tracking-wider pl-1">Target Job Title *</Label>
                    <Input
                      id="setup-target-role"
                      placeholder="e.g. Generative AI Engineer"
                      value={setupTargetRole}
                      onChange={(e) => setSetupTargetRole(e.target.value)}
                      className="rounded-xl border-slate-200 dark:border-white/10 py-5 text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-xs"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="font-bold text-slate-700 dark:text-slate-350 text-xs uppercase tracking-wider pl-1">Experience Level *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {['Fresher', '1–3 yrs', '3–5 yrs', '5–8 yrs', '8+ yrs'].map((exp) => {
                        const isSelected = setupExperience === exp;
                        return (
                          <button
                            key={exp}
                            type="button"
                            onClick={() => setSetupExperience(exp)}
                            className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-500/5 text-blue-600 dark:text-blue-400 shadow-xs scale-[1.02]'
                                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                          >
                            <span>{exp}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-bold text-slate-700 dark:text-slate-350 text-xs uppercase tracking-wider pl-1">Target Market *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { value: 'India', label: 'India', flag: '🇮🇳' },
                        { value: 'Gulf', label: 'Gulf', flag: '🇦🇪' },
                        { value: 'US', label: 'US', flag: '🇺🇸' },
                        { value: 'Global', label: 'Global', flag: '🌐' }
                      ].map((item) => {
                        const isSelected = setupMarket === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setSetupMarket(item.value)}
                            className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-500/5 text-blue-600 dark:text-blue-400 shadow-xs scale-[1.02]'
                                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                          >
                            <span className="text-xl">{item.flag}</span>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setup-job-desc" className="font-bold text-slate-700 dark:text-slate-350 text-xs uppercase tracking-wider pl-1">Job Description (optional)</Label>
                    <Textarea
                      id="setup-job-desc"
                      placeholder="Paste the job description or core keywords you want to target (this matches ATS requirements)..."
                      value={setupJobDescription}
                      onChange={(e) => setSetupJobDescription(e.target.value)}
                      rows={5}
                      className="rounded-xl border-slate-200 dark:border-white/10 p-3 leading-relaxed text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-xs"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      if (!setupTargetRole.trim()) {
                        toast.error('Please enter a target job title.');
                        return;
                      }
                      setTargetProfile({
                        targetRole: setupTargetRole,
                        experience: setupExperience,
                        market: setupMarket,
                        jobDescription: setupJobDescription
                      });
                      toast.success("Target profile configured!");
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-755 text-white font-bold py-5 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 w-full text-sm border-none cursor-pointer"
                  >
                    Proceed to Builder Modes
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-panel rounded-2xl overflow-hidden dark:bg-slate-900/20 border-slate-200 dark:border-white/10 shadow-lg animate-fade-slide-up">
                <div className="border-b border-slate-200 dark:border-white/10 px-6 py-5 bg-slate-50/50 dark:bg-slate-950/20">
                  <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-slate-100/80 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                      <TabsTrigger value="upload" className="gap-2 text-slate-500 dark:text-slate-400 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all text-xs sm:text-sm">
                        <Upload className="w-4 h-4 shrink-0" />
                        Upload Resume
                      </TabsTrigger>
                      <TabsTrigger value="scratch" className="gap-2 text-slate-500 dark:text-slate-400 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all text-xs sm:text-sm">
                        <FileText className="w-4 h-4 shrink-0" />
                        Build Scratch
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="gap-2 text-slate-500 dark:text-slate-400 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all text-xs sm:text-sm">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        Auto Generate
                      </TabsTrigger>
                      <TabsTrigger value="linkedin" className="gap-2 text-slate-500 dark:text-slate-400 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all text-xs sm:text-sm">
                        <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-current shrink-0" />
                        LinkedIn Import
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="p-8">
                  {mode === 'upload' && <ResumeUploader onParsed={handleResumeLoad} onStartFromScratch={() => setMode('scratch')} />}
                  {mode === 'scratch' && (
                    <ResumeScratchBuilder 
                      onComplete={handleResumeLoad} 
                      prefilledRole={targetProfile.targetRole}
                      prefilledCountryCode={
                        targetProfile.market === 'India' ? 'IN' : 
                        targetProfile.market === 'Gulf' ? 'AE' : 
                        targetProfile.market === 'US' ? 'US' : 
                        targetProfile.market === 'Global' ? 'GB' : ''
                      }
                    />
                  )}
                  {mode === 'ai' && (
                    <ResumeAIGenerator 
                      onGenerated={handleResumeLoad} 
                      prefilledRole={targetProfile.targetRole}
                      prefilledExperience={targetProfile.experience}
                      prefilledMarket={targetProfile.market}
                      prefilledJobDescription={targetProfile.jobDescription}
                    />
                  )}
                  {mode === 'linkedin' && <ResumeLinkedInImporter onImported={handleResumeLoad} />}
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
