import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { ParsedResume } from '@shared/types';
import { toast } from 'sonner';

interface ResumeAIGeneratorProps {
  onGenerated: (data: ParsedResume) => void;
}

export default function ResumeAIGenerator({ onGenerated }: ResumeAIGeneratorProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [experienceDetails, setExperienceDetails] = useState('');

  const generateMutation = trpc.ai.generateFullResume.useMutation({
    onSuccess: (data) => {
      toast.success('Resume generated successfully!');
      // Map generated response to ParsedResume format
      const parsedResume: ParsedResume = {
        header: data.header || {},
        summary: data.summary || '',
        skills: data.skills || [],
        experiences: data.experiences || [],
        projects: data.projects || [],
        educations: data.educations || [],
        certifications: data.certifications || [],
        // Fallback for fields not present in ParsedResume definition but in output
        ...data
      };
      onGenerated(parsedResume);
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to generate resume. Using template structure.');
    }
  });

  const handleGenerate = () => {
    if (!jobTitle.trim()) {
      toast.error('Please enter a target job title.');
      return;
    }
    generateMutation.mutate({
      jobTitle,
      experienceDetails
    });
  };

  return (
    <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
        <CardTitle className="flex items-center gap-2.5 font-bold text-slate-800 text-lg">
          <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
          Smart Resume Generator
        </CardTitle>
        <CardDescription className="text-slate-500 text-sm mt-1 leading-relaxed">
          Provide your target job role and outline your background or experiences, and our assistant will structure a complete, tailored resume for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="target-role" className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Target Job Title *</Label>
          <Input
            id="target-role"
            placeholder="e.g. Senior Frontend Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 py-5 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience-summary" className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Your Background & Highlights</Label>
          <Textarea
            id="experience-summary"
            placeholder="e.g. 5 years of experience building React apps, worked at Google and Stripe, designed high-performance billing system, proficient in GraphQL..."
            rows={5}
            value={experienceDetails}
            onChange={(e) => setExperienceDetails(e.target.value)}
            className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm leading-relaxed p-3.5"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 py-6 rounded-xl shadow-md hover:shadow transition-all text-sm mt-2"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Resume...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate with HexaSmart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
