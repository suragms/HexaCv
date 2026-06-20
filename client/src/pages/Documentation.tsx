import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, Zap, Volume2 } from 'lucide-react';
import { Link } from 'wouter';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Documentation</h1>
            <p className="text-sm text-slate-600">Complete guides and prompts for HexaCv</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guide" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Build Guide
            </TabsTrigger>
            <TabsTrigger value="design" className="gap-2">
              <Zap className="w-4 h-4" />
              UI/UX Prompts
            </TabsTrigger>
            <TabsTrigger value="tts" className="gap-2">
              <Volume2 className="w-4 h-4" />
              TTS Prompts
            </TabsTrigger>
          </TabsList>

          {/* Build Guide Tab */}
          <TabsContent value="guide" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started with HexaCv</CardTitle>
                <CardDescription>Learn how to build and manage your resume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="font-semibold text-slate-900 mb-2">What is HexaCv?</h3>
                  <p className="text-slate-600">
                    HexaCv is an AI-powered resume builder that helps you create, tailor, and export professional resumes. Built by HexaStack Solutions (Surag & Anandu Krishna), HexaCv combines intelligent parsing, job description alignment, and multiple professional templates to help you land your next role.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-2">Two Ways to Start</h3>
                  <div className="space-y-3">
                    <div className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-1">Upload Your Resume</h4>
                      <p className="text-sm text-slate-600">
                        Have an existing resume? Upload it as a PDF, Word document, or plain text file. HexaCv will automatically parse and extract your information into organized sections.
                      </p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-1">Build from Scratch</h4>
                      <p className="text-sm text-slate-600">
                        Start fresh with our guided form. Fill in your information section by section, and HexaCv will organize it into a professional resume.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-2">Key Features</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>✓ <strong>Smart Parsing:</strong> Automatically extract and organize resume content</li>
                    <li>✓ <strong>Job Targeting:</strong> Select preset jobs or add custom job descriptions</li>
                    <li>✓ <strong>AI Alignment:</strong> Get keyword suggestions to match job requirements</li>
                    <li>✓ <strong>Multiple Templates:</strong> Choose from 4 professional designs</li>
                    <li>✓ <strong>Live Preview:</strong> See changes instantly as you edit</li>
                    <li>✓ <strong>PDF Export:</strong> Download your resume with one click</li>
                    <li>✓ <strong>Offline Support:</strong> Works without internet connection</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-2">Resume Sections</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    HexaCv organizes your resume into these standard sections:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><strong>Header:</strong> Name, email, phone, location, and links</li>
                    <li><strong>Summary:</strong> Professional overview (optional)</li>
                    <li><strong>Skills:</strong> Categorized technical and soft skills</li>
                    <li><strong>Experience:</strong> Work history with descriptions</li>
                    <li><strong>Projects:</strong> Notable projects and achievements</li>
                    <li><strong>Education:</strong> Degrees and institutions</li>
                    <li><strong>Certifications:</strong> Professional certifications</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-2">Template Selection</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Choose the template that best matches your career stage and industry:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><strong>Classic ATS Blue:</strong> Traditional single-column design, optimized for ATS systems. Best for corporate roles.</li>
                    <li><strong>Minimal Executive:</strong> Clean, modern aesthetic with minimal styling. Ideal for senior positions.</li>
                    <li><strong>Modern Sidebar Lite:</strong> Contemporary two-column layout with sidebar. Perfect for creative professionals.</li>
                    <li><strong>Technical Compact:</strong> Dense, tech-focused design. Great for developers and engineers.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-2">Exporting Your Resume</h3>
                  <p className="text-sm text-slate-600">
                    Once you're satisfied with your resume, click the "Export PDF" button to download a beautifully formatted PDF file ready to send to employers.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-2">About HexaStack Solutions</h3>
                  <p className="text-sm text-slate-600">
                    HexaCv is developed by <strong>Surag & Anandu Krishna</strong> at HexaStack Solutions. Visit{' '}
                    <a
                      href="https://www.hexastacksolutions.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      www.hexastacksolutions.com
                    </a>{' '}
                    to learn more.
                  </p>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* UI/UX Design Prompts Tab */}
          <TabsContent value="design" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>UI/UX Design Prompts</CardTitle>
                <CardDescription>Design guidelines for HexaCv pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Landing Page Design</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 space-y-2">
                    <p>
                      <strong>Hero Section:</strong> Create an inspiring hero with a clear value proposition. Use a gradient background (blue to slate), bold typography, and a prominent CTA. Include a visual mockup of a resume or dashboard on the right side.
                    </p>
                    <p>
                      <strong>Features Section:</strong> Display 6 key features in a 3x2 grid. Each feature should have an icon, title, and short description. Use card components with hover effects.
                    </p>
                    <p>
                      <strong>Templates Section:</strong> Show all 4 templates with preview images. Use a 2x2 grid on desktop, stack vertically on mobile. Include template names and brief descriptions.
                    </p>
                    <p>
                      <strong>CTA Section:</strong> Add a prominent call-to-action section encouraging users to get started. Use contrasting colors (blue on white or white on blue).
                    </p>
                    <p>
                      <strong>Footer:</strong> Include HexaStack Solutions branding, links to templates, documentation, and company website. Credit founders: Surag & Anandu Krishna.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Resume Builder Page Design</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 space-y-2">
                    <p>
                      <strong>Layout:</strong> Use a two-tab interface (Upload / Build from Scratch). Tabs should be clearly labeled and easy to switch between.
                    </p>
                    <p>
                      <strong>Upload Section:</strong> Create a drag-and-drop file upload area with support for PDF, DOCX, and TXT files. Show upload progress and parsing status.
                    </p>
                    <p>
                      <strong>Build from Scratch:</strong> Use a multi-step form with clear section headers. Each step should focus on one resume section (Header, Summary, Skills, etc.). Include form validation and helpful placeholders.
                    </p>
                    <p>
                      <strong>Progress Indicator:</strong> Show progress through the form with a step indicator or progress bar.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Resume Editor Page Design</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 space-y-2">
                    <p>
                      <strong>Three-Column Layout:</strong> Left sidebar for section navigation, center for editing, right for live preview.
                    </p>
                    <p>
                      <strong>Section Navigation:</strong> Vertical list of resume sections with visibility toggles and drag handles for reordering.
                    </p>
                    <p>
                      <strong>Editor Panel:</strong> Form inputs for editing section content. Support inline editing for bullets and list items.
                    </p>
                    <p>
                      <strong>Live Preview:</strong> Real-time preview of the resume using the selected template. Updates instantly as user types.
                    </p>
                    <p>
                      <strong>Template & Job Selector:</strong> Dropdowns to select template and job description. Show preview updates immediately.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Color Palette</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="w-full h-12 bg-blue-600 rounded-lg border border-slate-200"></div>
                      <p className="text-sm font-medium">Primary: #1e40af</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-12 bg-slate-900 rounded-lg border border-slate-200"></div>
                      <p className="text-sm font-medium">Dark: #0f172a</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-12 bg-slate-50 rounded-lg border border-slate-200"></div>
                      <p className="text-sm font-medium">Light: #f8fafc</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-12 bg-green-600 rounded-lg border border-slate-200"></div>
                      <p className="text-sm font-medium">Success: #16a34a</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Typography</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><strong>Headings:</strong> Inter, 700 weight, sizes 24px-48px</li>
                    <li><strong>Body:</strong> Inter, 400-500 weight, 14px-16px</li>
                    <li><strong>Code/Monospace:</strong> JetBrains Mono, 400 weight</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Mobile Responsiveness</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>✓ Stack three-column layout to single column on mobile</li>
                    <li>✓ Use bottom sheet for section navigation on mobile</li>
                    <li>✓ Simplify preview to full-width on small screens</li>
                    <li>✓ Ensure touch-friendly button sizes (min 44x44px)</li>
                    <li>✓ Optimize forms for mobile input (large inputs, clear labels)</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TTS Prompts Tab */}
          <TabsContent value="tts" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>TTS Narration Prompts</CardTitle>
                <CardDescription>Text-to-speech prompts for all HexaCv pages (Stitch AI / tts-prompter format)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Landing Page Hero</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
                    <p className="whitespace-pre-wrap break-words">
                      Speak in English with a professional, confident, and welcoming tone: Build your perfect resume in minutes. Upload your existing resume or build from scratch. Tailor your CV to any job description with AI-powered alignment. Export a polished PDF instantly. HexaCv is powered by HexaStack Solutions.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Features Section</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
                    <p className="whitespace-pre-wrap break-words">
                      Speak in English with an enthusiastic and informative tone: HexaCv offers six powerful features. Smart Upload: Upload PDF, Word, or text files and automatically parse your resume content. AI-Powered: Align your resume to any job description and get keyword suggestions. Job Targeting: Select from preset jobs or add custom job descriptions. Multiple Templates: Choose from four professional designs. Instant Export: Download your resume as a beautifully formatted PDF. Mobile Ready: Build and edit your resume on any device.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Resume Builder - Upload Tab</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
                    <p className="whitespace-pre-wrap break-words">
                      Speak in English with a helpful and encouraging tone: Upload your existing resume to get started. HexaCv supports PDF, Word documents, and plain text files. Simply drag and drop your file or click to browse. Your resume will be automatically parsed and organized into standard sections.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Resume Builder - Build from Scratch Tab</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
                    <p className="whitespace-pre-wrap break-words">
                      Speak in English with a clear and instructional tone: Build your resume from scratch using our guided form. Fill in your information section by section: Header with your contact information, Professional Summary, Skills organized by category, Work Experience with detailed descriptions, Projects you've worked on, Education and degrees, and Certifications. Take your time to provide accurate and detailed information.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Template Selection</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
                    <p className="whitespace-pre-wrap break-words">
                      Speak in English with a professional and advisory tone: Choose the template that best matches your career stage and industry. Classic ATS Blue is a traditional single-column design optimized for ATS systems, best for corporate roles. Minimal Executive is a clean, modern aesthetic ideal for senior positions. Modern Sidebar Lite is a contemporary two-column layout perfect for creative professionals. Technical Compact is a dense, tech-focused design great for developers and engineers.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Job Description Targeting</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
                    <p className="whitespace-pre-wrap break-words">
                      Speak in English with an informative and supportive tone: Select a job description to tailor your resume. Choose from preset roles like Full-Stack Developer, Frontend Engineer, Backend Engineer, DevOps Engineer, Data Scientist, or Product Manager. Or enter a custom job description. HexaCv will analyze the job requirements and suggest keywords and content improvements to align your resume.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Resume Editor</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
                    <p className="whitespace-pre-wrap break-words">
                      Speak in English with a calm and instructional tone: You're now in the resume editor. On the left, you'll see all your resume sections. Click any section to edit its content. Your changes appear instantly in the live preview on the right. You can reorder sections by dragging, toggle section visibility, and edit bullets inline. When you're satisfied, click Export PDF to download your resume.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">PDF Export</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
                    <p className="whitespace-pre-wrap break-words">
                      Speak in English with an encouraging and professional tone: Your resume is ready to export. Click the Export PDF button to download a beautifully formatted PDF file. The PDF is optimized for both screen viewing and printing. You can download it as many times as you'd like and customize it further in the editor.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">Documentation Page</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
                    <p className="whitespace-pre-wrap break-words">
                      Speak in English with a helpful and informative tone: Welcome to HexaCv documentation. This guide covers everything you need to know about building and managing your resume. HexaCv is an AI-powered resume builder developed by Surag and Anandu Krishna at HexaStack Solutions. Visit hexastacksolutions.com to learn more. You can upload an existing resume or build from scratch. Choose from four professional templates. Tailor your resume to any job description. Export your resume as a PDF with one click.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-3">About HexaStack Solutions</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto">
                    <p className="whitespace-pre-wrap break-words">
                      Speak in English with a professional and proud tone: HexaCv is developed by Surag and Anandu Krishna at HexaStack Solutions. HexaStack Solutions is dedicated to building innovative tools that help professionals succeed. Visit www.hexastacksolutions.com to learn more about our work and other products.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900 mb-2">TTS Format Reference</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    All TTS prompts follow the tts-prompter format: <code className="bg-slate-100 px-2 py-1 rounded">[Style Instructions]: [Spoken Text]</code>
                  </p>
                  <p className="text-sm text-slate-600">
                    Style instructions control tone, pacing, and emotion. Spoken text is what the TTS engine will read aloud. Separate them with a colon.
                  </p>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-slate-700 mb-2">
            <strong>HexaCv</strong> is developed by <strong>Surag & Anandu Krishna</strong> at HexaStack Solutions
          </p>
          <a
            href="https://www.hexastacksolutions.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Visit www.hexastacksolutions.com
          </a>
        </div>
      </main>
    </div>
  );
}
