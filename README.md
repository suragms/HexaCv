# HexaCv - AI Resume Builder

**Prepared by:** Surag & Anandu Krishna | HexaStack Solutions  
**Website:** https://www.hexastacksolutions.com/  
**Version:** 1.0.0  
**License:** © 2026 HexaStack Solutions

---

## Overview

**HexaCv** is a full-featured, Progressive Web App (PWA) resume builder that empowers users to create, customize, and export professional resumes with AI-powered job description alignment. Built with modern web technologies, HexaCv provides a seamless experience across mobile, tablet, and desktop devices.

### Key Features

- **Resume Upload & Parsing:** Support for PDF, DOCX, and TXT formats with client-side text extraction
- **Build from Scratch:** Guided multi-step form for creating resumes from the ground up
- **Job Description Targeting:** Preset roles and custom job description input for resume alignment
- **Multiple Templates:** Four professional designs (Classic ATS Blue, Minimal Executive, Modern Sidebar Lite, Technical Compact)
- **Real-time Preview:** Live resume preview that updates instantly as you edit
- **PDF Export:** One-click download of polished, print-ready resumes
- **PWA Support:** Installable app with offline functionality and service worker
- **Complete Documentation:** In-app guides with UI/UX and TTS prompts

---

## Quick Start

### Prerequisites

- Node.js 22.13.0 or higher
- pnpm 10.4.1 or higher
- MySQL/TiDB database connection

### Installation

```bash
# Clone or navigate to project directory
cd /home/ubuntu/hexacv-app

# Install dependencies
pnpm install

# Generate database schema
pnpm drizzle-kit generate

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

---

## Project Structure

```
hexacv-app/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Landing.tsx         # Landing page
│   │   │   ├── ResumeBuilder.tsx   # Resume builder interface
│   │   │   └── Documentation.tsx   # In-app documentation
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ResumeUploader.tsx
│   │   │   ├── ResumeScratchBuilder.tsx
│   │   │   ├── ResumeEditor.tsx
│   │   │   └── ResumePreview.tsx
│   │   ├── hooks/                  # Custom React hooks
│   │   │   └── usePWA.ts          # PWA functionality
│   │   ├── lib/                    # Utility functions
│   │   │   ├── templates.ts        # Template definitions
│   │   │   ├── jobDescriptions.ts  # Job description presets
│   │   │   ├── resumeParser.ts     # Resume parsing logic
│   │   │   └── pdfExport.ts        # PDF generation utilities
│   │   ├── App.tsx                 # Main app component
│   │   └── main.tsx                # Entry point
│   ├── public/                      # Static assets
│   │   ├── manifest.json           # PWA manifest
│   │   ├── service-worker.js       # Service worker
│   │   └── favicon.ico             # App icon
│   └── index.html                  # HTML template
├── server/                          # Backend Express application
│   ├── routers.ts                  # tRPC procedure definitions
│   ├── db.ts                       # Database queries
│   ├── storage.ts                  # S3 storage helpers
│   └── _core/                      # Framework core
├── drizzle/                         # Database schema and migrations
│   ├── schema.ts                   # Table definitions
│   └── migrations/                 # SQL migration files
├── shared/                          # Shared types and constants
│   ├── types.ts                    # TypeScript type definitions
│   └── const.ts                    # Shared constants
├── BUILD_AND_DEPLOYMENT.md         # Build and deployment guide
├── DESIGN_AND_PROMPTS.md           # Design system and TTS prompts
├── USER_GUIDE.md                   # End-user guide
├── ARCHITECTURE.md                 # Architecture documentation
└── README.md                        # This file
```

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Backend | Express.js + tRPC 11 |
| Database | MySQL/TiDB |
| Authentication | Manus OAuth |
| PDF Generation | jsPDF + html2canvas |
| PWA | Service Worker + Web App Manifest |
| Testing | Vitest |
| Package Manager | pnpm |

---

## Features in Detail

### 1. Landing Page

The landing page introduces HexaCv with:

- **Hero Section:** Compelling headline, value proposition, and CTAs
- **Features Overview:** Six key features with icons and descriptions
- **Template Showcase:** Preview of all four professional templates
- **Call-to-Action:** Prominent button encouraging users to get started
- **Footer:** HexaStack Solutions branding and links

### 2. Resume Upload & Parsing

Users can upload existing resumes in multiple formats:

- **Supported Formats:** PDF, DOCX, TXT
- **Client-side Processing:** All parsing happens on the user's device
- **Automatic Extraction:** Sections automatically identified and organized
- **Data Normalization:** Parsed content cleaned and validated

### 3. Resume Builder from Scratch

Guided multi-step form for creating resumes:

- **Step 1:** Contact information (name, email, phone, location)
- **Step 2:** Professional summary (optional)
- **Step 3:** Skills (categorized by type)
- **Step 4:** Work experience (company, role, dates, description)
- **Step 5:** Projects (name, description, technologies)
- **Step 6:** Education (institution, degree, field, graduation date)
- **Step 7:** Certifications (name, issuer, date)
- **Step 8:** Review and confirmation

### 4. Resume Editor

Professional editor interface with:

- **Left Sidebar:** Template and job description selectors
- **Center Panel:** Edit resume content section by section
- **Right Panel:** Live preview of resume
- **Real-time Updates:** Preview updates instantly as user types
- **Section Management:** Toggle visibility, reorder sections

### 5. Template System

Four professional templates:

| Template | Design | Best For |
|----------|--------|----------|
| Classic ATS Blue | Traditional single-column | Corporate roles |
| Minimal Executive | Clean, modern aesthetic | Senior positions |
| Modern Sidebar Lite | Two-column with sidebar | Creative professionals |
| Technical Compact | Dense, tech-focused | Developers, engineers |

### 6. Job Description Targeting

Align resume to specific job requirements:

- **Preset Jobs:** 8 common roles (Full-Stack Developer, Frontend Engineer, etc.)
- **Custom Input:** Paste any job description
- **Keyword Extraction:** Automatic keyword identification
- **Match Score:** See how well your resume aligns with the job
- **Suggestions:** Get recommendations for content improvements

### 7. PDF Export

Export resume as professional PDF:

- **One-Click Download:** Simple export process
- **Template-Specific Styling:** PDF preserves template design
- **Print-Friendly:** Optimized for both screen and print
- **Multiple Downloads:** Export as many times as needed

### 8. PWA Support

Progressive Web App features:

- **Installable:** Add to home screen on mobile or install on desktop
- **Offline Support:** Works without internet connection
- **Service Worker:** Caches app shell and assets
- **Fast Loading:** Instant app startup
- **No Account Required:** Use without registration

---

## Documentation

### For Developers

- **BUILD_AND_DEPLOYMENT.md:** Complete build instructions, deployment guide, and environment setup
- **ARCHITECTURE.md:** System architecture, data models, and design decisions
- **DESIGN_AND_PROMPTS.md:** Design system, UI/UX prompts, and TTS narration prompts

### For End Users

- **USER_GUIDE.md:** Step-by-step guide to using HexaCv, including tips and best practices
- **In-app Documentation:** Accessible from the app's documentation page

### For Designers

- **DESIGN_AND_PROMPTS.md:** Comprehensive design guidelines, color palette, typography, and responsive design patterns

---

## TTS Narration Prompts

All TTS prompts follow the **tts-prompter format** for Stitch AI integration:

```
[Style Instructions]: [Spoken Text]
```

Examples:

**Landing Page Hero:**
```
Speak in English with a professional, confident, and welcoming tone: Build your perfect resume in minutes. Upload your existing resume or build from scratch. Tailor your CV to any job description with AI-powered alignment. Export a polished PDF instantly. HexaCv is powered by HexaStack Solutions.
```

**Resume Editor:**
```
Speak in English with a calm and instructional tone: You're now in the resume editor. On the left, you'll see all your resume sections. Click any section to edit its content. Your changes appear instantly in the live preview on the right. You can reorder sections by dragging, toggle section visibility, and edit bullets inline. When you're satisfied, click Export PDF to download your resume.
```

See **DESIGN_AND_PROMPTS.md** for all TTS prompts.

---

## Deployment

### Manus Platform

HexaCv is optimized for deployment on the Manus platform:

1. **Create Checkpoint:** Save project state in Manus UI
2. **Configure Secrets:** Set environment variables in Manus Settings
3. **Deploy:** Click "Publish" button in Management UI
4. **Verify:** Test all features in production

### Environment Variables

Required environment variables (automatically injected by Manus):

```bash
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login
OWNER_OPEN_ID=owner-id
OWNER_NAME=Owner Name
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
```

---

## Branding

### HexaStack Solutions Identity

- **Company:** HexaStack Solutions
- **Founders:** Surag & Anandu Krishna
- **Website:** https://www.hexastacksolutions.com/
- **Product:** HexaCv - AI Resume Builder

### Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | #1e40af | Primary CTA, headers |
| Dark Slate | #0f172a | Text, dark backgrounds |
| Light Slate | #f8fafc | Light backgrounds |
| Success Green | #16a34a | Success states |

---

## Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Type Checking

```bash
# Check TypeScript compilation
pnpm check

# Format code
pnpm format
```

---

## Performance

HexaCv is optimized for performance:

- **Fast Initial Load:** Optimized bundle size and lazy loading
- **Instant Preview:** Real-time updates without lag
- **Efficient Parsing:** Client-side parsing with minimal overhead
- **PWA Caching:** Service worker caches assets for instant loading
- **Responsive Design:** Optimized for all device sizes

---

## Accessibility

HexaCv meets WCAG 2.1 AA accessibility standards:

- **Keyboard Navigation:** All features accessible via keyboard
- **Screen Reader Support:** Compatible with screen readers
- **Color Contrast:** Readable on all display types
- **Focus Indicators:** Clear focus rings on interactive elements
- **Semantic HTML:** Proper heading hierarchy and labels

---

## Privacy & Security

- **Client-Side Processing:** All data processing happens on the user's device
- **No Server Upload:** User files never sent to servers
- **Local Storage:** Resume data stored locally on device
- **No Tracking:** No analytics or tracking cookies
- **Data Control:** Users can delete data anytime

---

## Troubleshooting

### Common Issues

**Issue: Resume didn't parse correctly**
- Try uploading a different format
- Ensure resume follows standard format
- Try building from scratch instead

**Issue: PDF export isn't working**
- Try a different browser
- Check download settings
- Ensure pop-ups aren't blocked

**Issue: App running slowly**
- Close other browser tabs
- Clear browser cache
- Try a different browser

See **USER_GUIDE.md** for more troubleshooting tips.

---

## Support

For questions or issues:

- **Website:** https://www.hexastacksolutions.com/
- **In-app Documentation:** See documentation page in app
- **User Guide:** See USER_GUIDE.md

---

## Contributing

HexaCv is developed and maintained by Surag & Anandu Krishna at HexaStack Solutions.

For contributions or feature requests, please visit https://www.hexastacksolutions.com/

---

## License

All rights reserved. © 2026 HexaStack Solutions.

HexaCv is provided as-is for personal and professional use.

---

## Credits

**Developed by:** Surag & Anandu Krishna  
**Organization:** HexaStack Solutions  
**Website:** https://www.hexastacksolutions.com/

---

## Changelog

### Version 1.0.0 (June 2026)

**Initial Release**
- Landing page with HexaStack branding
- Resume upload and parsing
- Resume builder from scratch
- Resume editor with live preview
- Four professional templates
- Job description targeting
- PDF export
- PWA support
- Complete documentation
- User guide

---

## Getting Started

1. **Visit HexaCv:** Open the app in your browser
2. **Choose Your Path:** Upload existing resume or build from scratch
3. **Edit and Customize:** Use the editor to refine your resume
4. **Select Template:** Choose from four professional designs
5. **Target Job:** Select or enter a job description
6. **Export:** Download your resume as PDF
7. **Submit:** Send your resume to employers

---

## Next Steps

- **Install as App:** Add HexaCv to your home screen for offline access
- **Build Multiple Resumes:** Create different versions for different roles
- **Share Feedback:** Let us know what you think at https://www.hexastacksolutions.com/
- **Follow Updates:** Check back for new features and improvements

---

**Thank you for using HexaCv! Good luck with your job search! 🚀**

For more information, visit **https://www.hexastacksolutions.com/**
