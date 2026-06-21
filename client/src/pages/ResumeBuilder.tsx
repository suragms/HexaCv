import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Upload, FileText, Linkedin, AlertTriangle, Trash2, Edit3, Lock, Plus } from 'lucide-react';
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

export default function ResumeBuilder() {
  const { isAuthenticated } = useAuth();
  const storage = useResumeStorage();
  const [, setLocation] = useLocation();

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

  const createResumeFromParsed = (parsed: ParsedResume): Resume => {
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
            jobTitle: parsed.header?.jobTitle || '',
            countryCode: parsed.header?.countryCode || '',
            locationFields: parsed.header?.locationFields || {},
            targetCountryCode: parsed.header?.targetCountryCode || '',
          }
        }
      },
      {
        id: nanoid(),
        type: 'summary',
        order: 2,
        visible: !!parsed.summary,
        content: { summary: parsed.summary }
      },
      {
        id: nanoid(),
        type: 'skills',
        order: 3,
        visible: parsed.skills && parsed.skills.length > 0,
        content: { skills: parsed.skills || [] }
      },
      {
        id: nanoid(),
        type: 'experience',
        order: 4,
        visible: parsed.experiences && parsed.experiences.length > 0,
        content: { experiences: parsed.experiences || [] }
      },
      {
        id: nanoid(),
        type: 'projects',
        order: 5,
        visible: parsed.projects && parsed.projects.length > 0,
        content: { projects: parsed.projects || [] }
      },
      {
        id: nanoid(),
        type: 'education',
        order: 6,
        visible: parsed.educations && parsed.educations.length > 0,
        content: { educations: parsed.educations || [] }
      },
      {
        id: nanoid(),
        type: 'certifications',
        order: 7,
        visible: parsed.certifications && parsed.certifications.length > 0,
        content: { certifications: parsed.certifications || [] }
      },
      {
        id: nanoid(),
        type: 'achievements',
        order: 8,
        visible: !!(parsed.achievements && parsed.achievements.length > 0),
        content: { achievements: parsed.achievements || [] }
      }
    ];

    return {
      id: nanoid(),
      userId: isAuthenticated ? 'user' : 'guest',
      title: parsed.header?.name ? `${parsed.header.name}'s Resume` : 'Untitled Resume',
      templateId: 'classic-ats-blue',
      sections,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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
      toast.success("Draft saved successfully!");
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Guest Mode Alert Banner */}
      {!isAuthenticated && activeResume && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 text-center text-sm font-medium shadow-inner flex items-center justify-center gap-2 relative z-50 animate-fade-in">
          <AlertTriangle className="w-4 h-4 animate-pulse text-white" />
          <span>Working as Guest: Your resumes are saved locally to this browser.</span>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => setLocation("/login?convert=true")}
            className="ml-3 bg-white text-orange-600 hover:bg-slate-100 font-semibold py-1 px-3 text-xs shadow rounded-md h-7"
          >
            <Lock className="w-3 h-3 mr-1" />
            Save to Account
          </Button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">HexaCv Resume Builder</h1>
              <p className="text-sm text-slate-600">Build your ATS-friendly resume</p>
            </div>
          </div>
          {activeResume && (
            <Button
              variant="outline"
              onClick={() => setActiveResume(null)}
              className="border-slate-200 hover:bg-slate-50"
            >
              Start New / View Drafts
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-[95vw] xl:max-w-[1600px] mx-auto px-4 py-6 flex-grow flex flex-col">
        {activeResume ? (
          <div className="h-[calc(100vh-180px)] flex-grow">
            <ResumeEditor resume={activeResume} onUpdate={handleResumeUpdate} />
          </div>
        ) : (
          <div className="space-y-6 max-w-6xl mx-auto w-full">
            {/* Guest limit reminder */}
            {!isAuthenticated && resumesList.length > 0 && (
              <Card className="border border-amber-200 bg-amber-50/50">
                <CardContent className="p-4 flex items-center justify-between text-amber-800 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>You have used <strong>{resumesList.length}/3</strong> guest resume slots. Sign in to unlock unlimited storage.</span>
                  </div>
                  <Link href="/login">
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs">
                      Sign In / Create Account
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* List of drafts */}
            {resumesList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Saved Drafts</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resumesList.map((r) => (
                    <Card 
                      key={r.id} 
                      onClick={() => setActiveResume(r)}
                      className="border border-slate-200 cursor-pointer hover:shadow-md transition bg-white flex flex-col justify-between"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-slate-800 font-bold truncate">{r.title}</CardTitle>
                        <CardDescription className="text-xs">
                          Last edited: {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "unknown"}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-2 border-t border-slate-50 bg-slate-50/30 flex justify-between rounded-b-xl items-center">
                        <Badge variant="outline" className="text-[10px] bg-white border-slate-200 text-slate-600 font-normal">
                          {r.userId === 'guest' ? 'LocalStorage' : 'Cloud Sync'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            size="icon-sm" 
                            variant="ghost" 
                            className="text-slate-500 hover:text-slate-900 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveResume(r);
                            }}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            size="icon-sm" 
                            variant="ghost" 
                            className="text-red-500 hover:bg-red-50 p-1 animate-hover"
                            onClick={(e) => handleDeleteDraft(r.id, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                  {!isAuthenticated && resumesList.length < 3 && (
                    <Card 
                      onClick={() => setMode('scratch')}
                      className="border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center p-6 text-center hover:bg-slate-50 transition min-h-[125px]"
                    >
                      <Plus className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm font-semibold text-slate-600">Create Another Resume</span>
                      <span className="text-xs text-slate-500 mt-0.5">({3 - resumesList.length} slots remaining)</span>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Creation tabs */}
            <Card className="border-slate-200">
              <div className="border-b border-slate-200 px-6 pt-6">
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                  <TabsList className="grid w-full max-w-2xl grid-cols-4">
                    <TabsTrigger value="upload" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Resume
                    </TabsTrigger>
                    <TabsTrigger value="scratch" className="gap-2">
                      <FileText className="w-4 h-4" />
                      Build from Scratch
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      AI Generate
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="gap-2">
                      <Linkedin className="w-4 h-4 text-blue-600 fill-current" />
                      LinkedIn Import
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="p-6">
                {mode === 'upload' && <ResumeUploader onParsed={handleResumeLoad} />}
                {mode === 'scratch' && <ResumeScratchBuilder onComplete={handleResumeLoad} />}
                {mode === 'ai' && <ResumeAIGenerator onGenerated={handleResumeLoad} />}
                {mode === 'linkedin' && <ResumeLinkedInImporter onImported={handleResumeLoad} />}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
