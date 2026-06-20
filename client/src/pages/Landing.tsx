import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import {
  ArrowRight,
  Download,
  FileText,
  Zap,
  Target,
  Smartphone,
} from 'lucide-react';
import { Link } from 'wouter';

export default function Landing() {
  const { installPrompt, isOnline, installApp } = usePWA();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HC</span>
            </div>
            <span className="font-bold text-lg text-slate-900">HexaCv</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Features
            </a>
            <a href="#templates" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Template
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {installPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={installApp}
                className="hidden sm:inline-flex gap-2"
              >
                <Download className="w-4 h-4" />
                Install App
              </Button>
            )}
            <Link href="/dashboard">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              ✨ Powered by HexaStack Solutions
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Build Your Perfect Resume in Minutes
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Upload your existing resume or build from scratch. Tailor your CV to any job description with AI-powered alignment. Export a polished PDF instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto gap-2">
                  Upload Resume
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  Build from Scratch
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-6">
              {isOnline ? (
                '✓ Online • Works offline • No account required'
              ) : (
                '✓ Currently offline • Your work is saved locally'
              )}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl p-8 h-96 flex items-center justify-center border border-slate-200">
            <div className="text-center">
              <FileText className="w-24 h-24 text-blue-400 mx-auto mb-4" />
              <p className="text-slate-600">Resume Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to create a standout resume
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Upload className="w-6 h-6" />,
                title: 'Smart Upload',
                description: 'Upload PDF, Word, or text files. Automatically parse and extract your resume content.',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'AI-Powered',
                description: 'Align your resume to any job description. Get keyword suggestions and content improvements.',
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: 'Job Targeting',
                description: 'Select from preset jobs or add custom job descriptions to tailor your resume.',
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: 'Professional Template',
                description: 'One beautifully designed, ATS-optimized template that works for all career stages and industries.',
              },
              {
                icon: <Download className="w-6 h-6" />,
                title: 'Instant Export',
                description: 'Download your resume as a beautifully formatted PDF with a single click.',
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: 'Mobile Ready',
                description: 'Build and edit your resume on any device. Works perfectly on mobile, tablet, and desktop.',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="border-slate-200 hover:shadow-lg transition">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Section */}
      <section id="templates" className="py-20 bg-slate-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              One Professional Template
            </h2>
            <p className="text-lg text-slate-600">
              Carefully designed for ATS optimization and visual appeal
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-64 flex items-center justify-center">
                <FileText className="w-24 h-24 text-slate-400" />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Professional Resume Template</CardTitle>
                <CardDescription className="text-base mt-2">
                  A clean, modern single-column layout optimized for ATS scanning and visual impact. Works perfectly for all industries and career levels. Features clear section hierarchy, professional typography, and ample whitespace for readability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-slate-700">ATS-optimized formatting for maximum compatibility</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-slate-700">Professional typography and spacing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-slate-700">Supports all standard resume sections</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-slate-700">Mobile-responsive design</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PWA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Install as an App</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            HexaCv is a Progressive Web App. Install it on your device for instant access, offline functionality, and a native app experience.
          </p>
          {installPrompt && (
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 gap-2"
              onClick={installApp}
            >
              <Download className="w-4 h-4" />
              Install HexaCv
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HC</span>
                </div>
                <span className="font-bold text-white">HexaCv</span>
              </div>
              <p className="text-sm">AI-powered resume builder by HexaStack Solutions.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#templates" className="hover:text-white transition">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="/documentation" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.hexastacksolutions.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    HexaStack Solutions
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.hexastacksolutions.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    Visit Website
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">About</h3>
              <p className="text-sm">
                Prepared by <strong>Surag & Anandu Krishna</strong>
              </p>
              <p className="text-sm mt-2">HexaStack Solutions</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>
              © 2026 HexaStack Solutions. Prepared by Surag & Anandu Krishna.{' '}
              <a
                href="https://www.hexastacksolutions.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition"
              >
                www.hexastacksolutions.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icon component for upload
function Upload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
