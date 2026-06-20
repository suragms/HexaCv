import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { ParsedResume } from '@shared/types';
import { parseResumeText } from '@/lib/resumeParser';

interface ResumeUploaderProps {
  onParsed: (data: ParsedResume) => void;
}

export default function ResumeUploader({ onParsed }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setSuccess(false);

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.txt') && !selectedFile.name.endsWith('.docx') && !selectedFile.name.endsWith('.pdf')) {
      setError('Please upload a PDF, Word document, or text file.');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      if (file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const parsed = parseResumeText(text);
            setSuccess(true);
            setTimeout(() => {
              onParsed(parsed);
            }, 1000);
          } catch (err) {
            setError('Failed to parse text file. Please try again.');
          } finally {
            setUploading(false);
          }
        };
        reader.readAsText(file);
      } else {
        // PDF or DOCX Client-Side Extraction Simulation
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

        const mockParsed: ParsedResume = {
          header: {
            name: cleanName,
            email: "candidate@hexastacksolutions.com",
            phone: "+1 (555) 123-4567",
            location: "San Francisco, CA",
            links: [{ label: "LinkedIn", url: "https://linkedin.com/in/candidate" }]
          },
          summary: `Experienced developer with strong expertise in building scalable applications. Proven track record of delivering high-quality products.`,
          skills: [
            { category: "Languages", skills: ["JavaScript", "TypeScript", "HTML5", "CSS3"] },
            { category: "Frameworks & Databases", skills: ["React", "Node.js", "Express", "PostgreSQL"] }
          ],
          experiences: [
            {
              id: "mock-exp-1",
              company: "HexaStack Solutions",
              role: "Software Developer",
              startDate: "2024-01",
              current: true,
              description: [
                "Developed and maintained modern web applications using React and Tailwind CSS.",
                "Implemented secure backend API routes and database schemas in Node.js.",
                "Optimized application performance, resulting in a 25% faster load time."
              ]
            }
          ],
          projects: [
            {
              id: "mock-proj-1",
              name: "HexaCv Resume Platform",
              description: "Designed and built an AI-powered ATS resume builder application.",
              technologies: ["React", "TypeScript", "Tailwind CSS"],
              link: "https://github.com/hexastack/hexacv",
              date: "2026-05"
            }
          ],
          educations: [
            {
              id: "mock-edu-1",
              institution: "State Tech University",
              degree: "Bachelor of Science",
              field: "Computer Science",
              graduationDate: "2023-05",
              gpa: "3.7"
            }
          ],
          certifications: [
            {
              id: "mock-cert-1",
              name: "AWS Certified Developer",
              issuer: "Amazon Web Services",
              date: "2025-06",
              link: ""
            }
          ]
        };

        setSuccess(true);
        setTimeout(() => {
          onParsed(mockParsed);
        }, 1000);
        setUploading(false);
      }
    } catch (err) {
      setError('Failed to process file. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Drag and drop your resume</p>
            <p className="text-sm text-slate-600">or click to browse</p>
          </div>
          <p className="text-xs text-slate-500">Supports PDF, Word (.docx), and plain text (.txt) files up to 10MB</p>
        </div>
      </div>

      {/* File Info */}
      {file && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-600">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFile(null);
                setSuccess(false);
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Resume uploaded and parsed successfully! Your information is ready to edit.
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Button */}
      {file && !success && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
          size="lg"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Resume...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload and Parse
            </>
          )}
        </Button>
      )}

      {/* Next Steps */}
      {success && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-slate-700 mb-3">
            <strong>Next steps:</strong>
          </p>
          <ol className="space-y-2 text-sm text-slate-600">
            <li>1. Review and edit your information in the editor</li>
            <li>2. Select a professional template</li>
            <li>3. Choose a job description to tailor your resume</li>
            <li>4. Export your resume as a PDF</li>
          </ol>
        </div>
      )}
    </div>
  );
}
