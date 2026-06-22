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
  CheckCircle,
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Landing() {
  const { installPrompt, isOnline, installApp } = usePWA();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/icon-192.png" 
              alt="HexaCv Logo" 
              className="w-9 h-9 rounded-xl object-contain shadow-sm border border-slate-100" 
            />
            <span className="font-bold text-xl text-slate-900 tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              HexaCv
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#templates" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Template
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {installPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={installApp}
                className="hidden sm:inline-flex gap-2 border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-all"
              >
                <Download className="w-4 h-4" />
                Install App
              </Button>
            )}
            {isAuthenticated ? (
              <Link href="/builder">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/builder">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hidden sm:inline-flex">
                    Build Resume
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 border border-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wide">
              <span>✨ Powered by HexaStack Solutions</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Build Your Perfect Resume with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                AI Alignment
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
              Upload your CV or build from scratch. Automatically tailor your content to match target job descriptions with precision keywords and instant ATS score reviews.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/builder">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto shadow-md hover:shadow-lg transition-all gap-2 py-6 px-8 text-base">
                  Build Resume Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-200 hover:bg-slate-50 transition-all gap-2 py-6 px-8 text-base text-slate-700">
                    Get Started Free
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isOnline ? (
                <span>Works offline • No account required</span>
              ) : (
                <span>Currently offline • All changes saved locally</span>
              )}
            </div>
          </div>
          
          {/* Hero Visual Mockup */}
          <div className="lg:col-span-5 relative w-full h-[400px] flex items-center justify-center">
            {/* Background glowing gradients */}
            <div className="absolute w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl -z-10 translate-x-20 translate-y-12"></div>

            {/* Mockup Resume Card */}
            <div className="absolute top-8 left-6 w-[280px] bg-white rounded-xl shadow-2xl border border-slate-100 p-5 rotate-[-3deg] hover:rotate-0 transition-transform duration-500 select-none">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  SK
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Sarah K. Jenkins</div>
                  <div className="text-[9px] text-blue-600 font-semibold">Senior Software Engineer</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[8px] font-bold text-slate-400 tracking-wider uppercase mb-1">Work Experience</div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-slate-100 rounded w-11/12"></div>
                    <div className="h-1.5 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-1.5 bg-slate-100 rounded w-4/5"></div>
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-bold text-slate-400 tracking-wider uppercase mb-1">Key Skills</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[7px] font-bold">React</span>
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[7px] font-bold">TypeScript</span>
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[7px] font-bold">NodeJS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup AI Suggestion Box */}
            <div className="absolute bottom-6 right-4 w-[240px] bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-850 p-4 rotate-[4deg] hover:rotate-0 transition-transform duration-500 select-none z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Zap className="w-3 h-3 fill-current" />
                </div>
                <div className="font-semibold text-xs text-slate-100">AI Alignment Suggestion</div>
              </div>
              <p className="text-[9px] text-slate-300 leading-relaxed mb-3">
                Add <span className="text-blue-400 font-semibold">"Architected cloud-native microservices"</span> to match target job keyword: <span className="text-emerald-400">"Cloud Architecture"</span>.
              </p>
              <div className="flex gap-2">
                <div className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[8px] rounded transition-colors cursor-pointer">
                  Apply Suggestion
                </div>
                <div className="px-2.5 py-1 bg-slate-800 text-slate-400 font-semibold text-[8px] rounded transition-colors cursor-pointer">
                  Ignore
                </div>
              </div>
            </div>

            {/* Mockup ATS Score badge */}
            <div className="absolute top-4 right-10 w-[125px] bg-white rounded-xl shadow-lg border border-slate-50 p-3 flex items-center gap-2.5 rotate-[2deg] z-20 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="16" cy="16" r="13" stroke="#f1f5f9" strokeWidth="3" fill="transparent" />
                  <circle cx="16" cy="16" r="13" stroke="#10b981" strokeWidth="3" fill="transparent" strokeDasharray="81.6" strokeDashoffset="12" />
                </svg>
                <span className="absolute text-[8px] font-extrabold text-slate-800">94%</span>
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-700 leading-none">ATS Score</div>
                <div className="text-[7px] text-emerald-600 font-bold mt-1">Highly Aligned</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 border-t border-slate-100">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Everything You Need to Get Hired
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Powerful built-in tools to extract, optimize, and tailor your professional profile
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <UploadIcon className="w-5 h-5" />,
                title: 'Smart Resume Parser',
                description: 'Upload PDF, Word, or text files. Automatically parse and extract your structured history in seconds.',
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: 'AI Tailored Alignment',
                description: 'Match your resume to any job description. Get instant missing keyword suggestions and content edits.',
              },
              {
                icon: <Target className="w-5 h-5" />,
                title: 'ATS Match Rating',
                description: 'See exactly how well your profile aligns with target roles before submitting application forms.',
              },
              {
                icon: <FileText className="w-5 h-5" />,
                title: 'Modern Single Column Template',
                description: 'A clean, ATS-optimized layout designed to clear filters easily and look excellent to recruiters.',
              },
              {
                icon: <CheckCircle className="w-5 h-5" />,
                title: 'Instant PDF Export',
                description: 'Generate, preview, and download your polished PDF copy instantly with print-perfect formatting.',
              },
              {
                icon: <Smartphone className="w-5 h-5" />,
                title: 'Progressive Web App',
                description: 'Install directly onto your device. Enjoy quick access, responsive layouts, and robust offline support.',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="border-slate-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-300 group">
                <CardHeader>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-slate-900 group-hover:text-blue-700 transition-colors font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Section */}
      <section id="templates" className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              One Professional Template
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Designed specifically to meet ATS guidelines and clean visual presentation standards
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-slate-200 overflow-hidden shadow-lg bg-white">
              <div className="bg-slate-100/50 border-b border-slate-100 p-8 flex justify-center">
                {/* Mini Resume Canvas */}
                <div className="w-full max-w-[420px] bg-white rounded shadow-md border border-slate-150 p-6 space-y-4 text-left font-sans select-none">
                  {/* Title Header */}
                  <div className="text-center pb-3 border-b border-blue-600/10">
                    <div className="font-bold text-sm text-slate-900 tracking-tight leading-none">Jonathan Bennett</div>
                    <div className="text-[7.5px] text-slate-500 mt-1 flex justify-center gap-1.5 flex-wrap">
                      <span>jonathan@email.com</span>
                      <span>•</span>
                      <span>+1 (555) 012-3456</span>
                      <span>•</span>
                      <span>Austin, TX</span>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div>
                    <div className="text-[8px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Professional Summary</div>
                    <p className="text-[7.5px] text-slate-600 leading-relaxed">
                      Results-oriented Backend Engineer with 5+ years of experience constructing scalable distributed architectures. Expert in TypeScript, NodeJS, PostgreSQL, and cloud deployments.
                    </p>
                  </div>
                  
                  {/* Experience */}
                  <div>
                    <div className="text-[8px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Work Experience</div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[7.5px] font-bold text-slate-800 leading-none">
                          <span>Senior Backend Engineer • cloudFlow Inc.</span>
                          <span className="text-slate-400 font-normal">2023 - Present</span>
                        </div>
                        <ul className="list-disc list-inside text-[7px] text-slate-600 space-y-0.5 mt-0.5 pl-1.5">
                          <li>Engineered event-driven APIs scaling to handle over 10M daily requests.</li>
                          <li>Reduced infrastructure overhead by 22% through container orchestration.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="text-[8px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Skills</div>
                    <div className="text-[7.5px] text-slate-700">
                      <strong>Languages & Tools:</strong> JavaScript, Go, SQL, Docker, Redis, Kubernetes, AWS
                    </div>
                  </div>
                </div>
              </div>
              
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold text-slate-900">Classic ATS Blue Layout</CardTitle>
                <CardDescription className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  A beautiful, clean, single-column document designed for maximum readability. Supported by clear section hierarchy, professional font ratios, and optimal spacing that prevents parser conversion issues.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-6 pt-0">
                <div className="grid sm:grid-cols-2 gap-3.5 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      ✓
                    </div>
                    <span className="text-slate-600">ATS parser compatible standard formatting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      ✓
                    </div>
                    <span className="text-slate-600">Professional spacing and margins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      ✓
                    </div>
                    <span className="text-slate-600">Supports certifications & custom links</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      ✓
                    </div>
                    <span className="text-slate-600">Looks excellent on screen and paper</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PWA Install Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white py-20 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-0"></div>

        <div className="container max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/10 backdrop-blur-sm shadow-inner">
            <Smartphone className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Install HexaCv on Your Device</h2>
          <p className="text-slate-300 max-w-xl mx-auto text-base leading-relaxed">
            Access your resumes instantly from your home screen, work on edits without an active network, and experience fluid native-like performance.
          </p>
          {installPrompt && (
            <div className="pt-2">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-slate-50 font-bold transition-all shadow-md gap-2 py-6 px-8 text-base"
                onClick={installApp}
              >
                <Download className="w-4 h-4" />
                Install HexaCv App
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/icon-192.png" alt="HexaCv Logo" className="w-8 h-8 rounded-lg object-contain" />
                <span className="font-bold text-white text-lg tracking-tight">HexaCv</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Next-generation AI-powered resume building and optimization platform.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Product</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#templates" className="hover:text-white transition-colors">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="/documentation" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="https://www.hexastacksolutions.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    HexaStack Solutions
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.hexastacksolutions.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Visit Website
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">About</h3>
              <p className="text-sm leading-relaxed">
                Prepared by <strong>Surag & Anandu Krishna</strong>
              </p>
              <p className="text-sm text-slate-500 mt-2 font-medium">HexaStack Solutions</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
            <p>
              © 2026 HexaStack Solutions. Prepared by Surag & Anandu Krishna.{' '}
              <a
                href="https://www.hexastacksolutions.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
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

// Icon component for upload fallback
function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
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
