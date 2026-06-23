import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import {
  ArrowRight,
  Download,
  Zap,
  Target,
  Smartphone,
  Upload,
  Layers,
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Landing() {
  const { installPrompt, isOnline, installApp } = usePWA();
  const { isAuthenticated } = useAuth();


  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden glass-bg">
      {/* TopAppBar Navigation */}
      <header className="bg-white/80 dark:bg-surface-container/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-6 md:px-12 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-primary text-[28px]"><Layers className="w-7 h-7 text-primary" /></span>
            <span className="font-bold text-xl text-foreground dark:text-slate-100 tracking-tight group-hover:text-primary transition-colors">HexaCv</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground font-medium hover:text-primary dark:hover:text-primary transition-colors duration-200">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {installPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={installApp}
                className="hidden sm:inline-flex gap-2 border-slate-200/50 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-blue-400 bg-card hover:bg-muted dark:bg-white/5 transition-all"
              >
                <Download className="w-4 h-4" />
                Install App
              </Button>
            )}
            {isAuthenticated ? (
              <Link href="/builder">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow transition-all border border-blue-500/30">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-medium hover:bg-black/5 dark:hover:bg-white/5">
                    Sign In
                  </Button>
                </Link>
                <Link href="/builder">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow transition-all border border-blue-500/30">
                    Build Resume
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-20 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold tracking-wide">
                <span>✨ Powered by HexaStack Solutions</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground dark:text-slate-100 leading-tight tracking-tight">
                Next-Gen Resume Building. <span className="gradient-text">Designed for ATS Victory.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground dark:text-slate-350 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Upload, optimize, and export high-scoring professional resumes client-side. Built for ambitious professionals who value efficiency and modern aesthetics.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/builder?mode=upload">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/20 hover:brightness-110 transition-all duration-300 transform hover:-translate-y-0.5 gap-2">
                    Start Building Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full px-8 py-6 glass-panel rounded-xl font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 border border-slate-200/50 dark:border-white/15 bg-slate-50/50 dark:bg-white/5">
                    Learn More
                  </Button>
                </a>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-slate-400 pt-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>✓ Online • Works offline • No account required</span>
              </div>
            </div>

            {/* Right visuals */}
            <div className="relative w-full h-[440px] flex items-center justify-center select-none mt-12 lg:mt-0">
              {/* Background glowing gradients */}
              <div className="absolute w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-drift-orb-1"></div>
              <div className="absolute w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 translate-x-20 translate-y-12 animate-drift-orb-2"></div>

              {/* Mockup Resume Card */}
              <div className="absolute top-8 left-4 w-[280px] glass-panel rounded-xl shadow-2xl border border-slate-200 dark:border-white/15 p-5 rotate-[-3deg] hover:rotate-0 hover:scale-[1.02] hover:z-30 transition-all duration-500 animate-float-resume bg-white/60 dark:bg-slate-900/40">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    SK
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Sarah K. Jenkins</div>
                    <div className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">Senior Software Engineer</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[8px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-1">Work Experience</div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded w-11/12"></div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-1">Key Skills</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 bg-blue-50/50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded text-[7px] font-bold">React</span>
                      <span className="px-1.5 py-0.5 bg-blue-50/50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded text-[7px] font-bold">TypeScript</span>
                      <span className="px-1.5 py-0.5 bg-blue-50/50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded text-[7px] font-bold">NodeJS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mockup AI Suggestion Box */}
              <div className="absolute bottom-6 right-2 w-[250px] glass-floating text-foreground rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 p-4 rotate-[4deg] hover:rotate-0 hover:scale-[1.02] hover:z-30 transition-all duration-500 animate-float-suggestion z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                    <Zap className="w-3 h-3 fill-current" />
                  </div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">Smart Alignment Suggestion</div>
                </div>
                <p className="text-[9px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  Add <span className="text-blue-600 dark:text-blue-400 font-semibold">"Architected cloud-native microservices"</span> to match target job keyword: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">"Cloud Architecture"</span>.
                </p>
                <div className="flex gap-2">
                  <div className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[8px] rounded transition-colors cursor-pointer">
                    Apply Suggestion
                  </div>
                  <div className="px-2.5 py-1 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-650 dark:text-slate-300 font-semibold text-[8px] rounded transition-colors cursor-pointer hover:bg-slate-200/50 dark:hover:bg-white/10">
                    Ignore
                  </div>
                </div>
              </div>

              {/* Mockup ATS Score badge */}
              <div className="absolute top-4 right-8 w-[125px] glass-panel rounded-xl shadow-lg border border-slate-200 dark:border-white/15 p-3 flex items-center gap-2.5 rotate-[2deg] hover:rotate-0 hover:scale-[1.05] hover:z-30 transition-all duration-300 animate-float-ats z-20 bg-white/60 dark:bg-slate-900/40">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="16" cy="16" r="13" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="3" fill="transparent" />
                    <circle cx="16" cy="16" r="13" stroke="#16a34a" strokeWidth="3" fill="transparent" strokeDasharray="81.6" strokeDashoffset="12" />
                  </svg>
                  <span className="absolute text-[8px] font-extrabold text-slate-900 dark:text-slate-100">92%</span>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-800 dark:text-slate-200 leading-none">ATS Score</div>
                  <div className="text-[7px] text-emerald-600 dark:text-emerald-500 font-bold mt-1">Highly Aligned</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 md:px-12 py-20 relative border-t border-slate-200/50 dark:border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">Engineered for Success</h2>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Everything you need to construct a compelling career narrative, engineered for precision and impact.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Upload className="w-6 h-6 text-primary" />,
                title: 'Smart Parser',
                description: 'Upload your existing PDF or Word files. Our advanced client-side parser extracts text intelligently, maintaining structural integrity without sending data to a server.',
                colspan: ''
              },
              {
                icon: <Zap className="w-6 h-6 text-primary" />,
                title: 'AI Optimization',
                description: 'Tailor your content to specific job descriptions. Our local AI models suggest high-impact keywords and structural improvements to boost ATS compatibility.',
                colspan: ''
              },
              {
                icon: <Target className="w-6 h-6 text-secondary" />,
                title: 'Private & Offline',
                description: 'Your professional data is highly sensitive. Processing happens entirely within your browser. Install as a PWA and work offline anywhere.',
                colspan: 'md:col-span-3 lg:col-span-1'
              }
            ].map((feature, idx) => (
              <div key={idx} className={`glass-panel glass-interactive rounded-2xl p-8 flex flex-col items-start ${feature.colspan}`}>
                <div className="w-12 h-12 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-grow">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>



        {/* PWA Install Banner */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900 text-white py-20 relative overflow-hidden border-t border-b border-slate-200/50 dark:border-white/5">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-0"></div>

          <div className="container max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 backdrop-blur-sm shadow-inner">
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
                  className="bg-[#b8c4ff] text-[#002584] hover:bg-[#b8c4ff]/90 font-bold transition-all shadow-md gap-2 py-6 px-8 text-base border-none"
                  onClick={installApp}
                >
                  <Download className="w-4 h-4" />
                  Install HexaCv App
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-[#060e20] text-slate-400 py-16 border-t border-slate-200/20 dark:border-white/5">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3 group cursor-pointer">
                <img 
                  src="/icon-192.png" 
                  alt="HexaCv Logo" 
                  className="w-8 h-8 rounded-lg object-contain animate-logo-hover transition-transform duration-300" 
                />
                <span className="font-bold text-white dark:text-white text-lg tracking-tight group-hover:text-primary transition-colors">HexaCv</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Next-generation smart resume building and optimization platform.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Product</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#features" className="hover:text-primary transition-colors">
                    Features
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
                    className="hover:text-primary transition-colors"
                  >
                    HexaStack Solutions
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.hexastacksolutions.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
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

          <div className="border-t border-white/5 pt-8 text-center text-xs text-slate-500">
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
