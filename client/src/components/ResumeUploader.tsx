import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { ParsedResume } from '@shared/types';
import { trpc } from '@/lib/trpc';

interface ResumeUploaderProps {
  onParsed: (data: ParsedResume) => void;
}

export default function ResumeUploader({ onParsed }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseMutation = trpc.resume.parse.useMutation();

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1];
        if (!base64) {
          throw new Error('Failed to read file as base64 string.');
        }

        const parsed = await parseMutation.mutateAsync({
          filename: file.name,
          base64,
        });

        setSuccess(true);
        setTimeout(() => {
          onParsed(parsed);
        }, 1000);
      } catch (err: any) {
        console.error('File parsing error:', err);
        setError(err?.message || 'Failed to process file. Please try again.');
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file.');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-2xl p-14 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50/40 shadow-lg shadow-blue-500/5' 
            : 'border-slate-200 hover:border-blue-450 hover:bg-slate-50/40 hover:shadow-md'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Subtle grid mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f006_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f006_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

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

        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <Upload className="w-9 h-9 text-white animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
          
          <div className="space-y-1">
            <p className="font-extrabold text-slate-800 text-base sm:text-lg">Drag and drop your resume file</p>
            <p className="text-sm text-slate-550 font-medium">or <span className="text-blue-600 font-bold hover:underline">browse files</span> on your device</p>
          </div>
          
          {/* Format Badges */}
          <div className="flex gap-2 justify-center pt-1.5">
            <span className="px-2.5 py-1 bg-white text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200/80 shadow-sm">PDF</span>
            <span className="px-2.5 py-1 bg-white text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200/80 shadow-sm">DOCX</span>
            <span className="px-2.5 py-1 bg-white text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200/80 shadow-sm">TXT</span>
          </div>

          <p className="text-xs text-slate-400 font-semibold">Maximum file size: 10MB</p>
        </div>
      </div>

      {/* File Info */}
      {file && (
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between animate-fade-slide-up">
          <div>
            <p className="font-bold text-slate-800 text-sm">{file.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-650 hover:bg-red-50/50 rounded-lg font-semibold"
            onClick={() => {
              setFile(null);
              setSuccess(false);
            }}
          >
            Remove File
          </Button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="rounded-xl shadow-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="bg-green-50/50 border-green-200 rounded-xl shadow-sm">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-semibold text-xs leading-relaxed">
            Resume uploaded and parsed successfully! Your information is ready to edit.
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Button */}
      {file && !success && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold gap-2 py-6 rounded-xl shadow-md hover:shadow transition-all text-sm"
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
        <div className="bg-blue-50/30 border border-blue-150 rounded-xl p-5 shadow-sm animate-fade-slide-up">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2.5">
            Suggested Next Steps
          </p>
          <ol className="space-y-2 text-xs text-slate-650 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold">1</span>
              <span>Review and edit parsed resume items in the builder layout.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold">2</span>
              <span>Compare your resume against target job description tags.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold">3</span>
              <span>Instantly print/export to PDF when satisfied with matches.</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
