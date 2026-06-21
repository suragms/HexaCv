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
