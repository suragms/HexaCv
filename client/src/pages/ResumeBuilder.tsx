import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Sparkles, Upload, FileText, Linkedin } from 'lucide-react';
import { Link } from 'wouter';
import ResumeUploader from '@/components/ResumeUploader';
import ResumeScratchBuilder from '@/components/ResumeScratchBuilder';
import ResumeAIGenerator from '@/components/ResumeAIGenerator';
import ResumeLinkedInImporter from '@/components/ResumeLinkedInImporter';
import ResumeEditor from '@/components/ResumeEditor';
import { Resume, ParsedResume, ResumeSection } from '@shared/types';
import { nanoid } from 'nanoid';

export default function ResumeBuilder() {
  const [mode, setMode] = useState<'upload' | 'scratch' | 'ai' | 'linkedin'>('upload');
  const [activeResume, setActiveResume] = useState<Resume | null>(null);

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
      userId: 'guest',
      title: parsed.header?.name ? `${parsed.header.name}'s Resume` : 'Untitled Resume',
      templateId: 'classic-ats-blue',
      sections,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  const handleResumeLoad = (parsed: ParsedResume) => {
    const newResume = createResumeFromParsed(parsed);
    setActiveResume(newResume);
  };

  const handleResumeUpdate = (updatedResume: Resume) => {
    setActiveResume(updatedResume);
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
              className="border-slate-200"
            >
              Start New Resume
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {activeResume ? (
          <div className="h-[calc(100vh-140px)]">
            <ResumeEditor resume={activeResume} onUpdate={handleResumeUpdate} />
          </div>
        ) : (
          <Card className="border-slate-200">
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
              <div className="border-b border-slate-200 px-6 pt-6">
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
              </div>

              <div className="p-6">
                <TabsContent value="upload" className="mt-0">
                  <ResumeUploader onParsed={handleResumeLoad} />
                </TabsContent>

                <TabsContent value="scratch" className="mt-0">
                  <ResumeScratchBuilder onComplete={handleResumeLoad} />
                </TabsContent>

                <TabsContent value="ai" className="mt-0">
                  <ResumeAIGenerator onGenerated={handleResumeLoad} />
                </TabsContent>

                <TabsContent value="linkedin" className="mt-0">
                  <ResumeLinkedInImporter onImported={handleResumeLoad} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        )}
      </main>
    </div>
  );
}

