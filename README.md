# HexaCv - AI Resume Builder

**Prepared by:** Surag & Anandu Krishna | HexaStack Solutions  
**Website:** https://www.hexastacksolutions.com/  
**Version:** 1.1.0  
**License:** © 2026 HexaStack Solutions

---

## Overview

**HexaCv** is a full-featured, Progressive Web App (PWA) resume builder that empowers users to create, customize, and export professional resumes with AI-powered job description alignment. Built with modern web technologies, HexaCv provides a seamless experience across mobile, tablet, and desktop devices. 

---

### Key Features

- **Optional Authentication & Guest Mode:** Open the app and start building instantly as a Guest. Guest data persists in `LocalStorage` with a limit of 3 resumes.
- **Auto Cloud Migration:** Upon registration or login, guest resumes, cover letters, and reports are automatically migrated to the cloud database.
- **Robust Resume Upload & Parsing:** Support for PDF, DOCX, and TXT with raw text cleaning (strips consecutive duplicates, page numbers, and repeating headers/footers) and strict LLM parsing schemas.
- **Zero AI-Fabrication Guarantee:** Structured parser enforces "Genuine Content Only", mapping roles, company names, and dates verbatim with no hallucinated achievements.
- **Candidate Job Title Auto-Detection:** Automatically infers the candidate's core professional target role based on the uploaded document's content.
- **AI Summary Rewriting:** Tailor your professional summary instantly to any target job description and target country ATS standards with a dedicated "Rewrite with AI" interface.
- **Print-Safe Preview & Typography:** Features Google Fonts `Inter` styling and strict disc bullet rendering that overrides standard Tailwind CSS reset rules.
- **Super Admin CRM & Analytics:** Track guest sessions, conversions, cloud backup statistics, and database analytics through the CRM panel.
- **PWA Support:** Installable app with offline capabilities and service workers.

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

# Generate database schema & apply migrations
pnpm run db:push

# Start development server
pnpm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
# Build frontend and backend
pnpm run build

# Start production server
pnpm run start
```

---

## Project Structure

```
hexacv-app/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Landing.tsx         # Landing page (with Guest/Register CTAs)
│   │   │   ├── ResumeBuilder.tsx   # Resume builder interface (with Guest warning banner)
│   │   │   ├── Login.tsx           # Glassmorphic OAuth and local bypass login
│   │   │   └── Documentation.tsx   # In-app documentation
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ResumeUploader.tsx  # Document drag & drop uploader
│   │   │   ├── ResumeScratchBuilder.tsx
│   │   │   ├── ResumeEditor.tsx    # Editor (with AI Summary Rewriter)
│   │   │   ├── ResumePreview.tsx   # Print-safe preview using Inter font stack
│   │   │   └── AdminCRM.tsx        # Super Admin CRM with guest conversion statistics
│   │   ├── hooks/                  # Custom React hooks
│   │   │   └── useResumeStorage.ts # Unified storage coordinator (Local vs Cloud)
│   │   ├── lib/                    # Utility functions
│   │   │   ├── templates.ts        # Template definitions
│   │   │   ├── jobDescriptions.ts  # Job description presets
│   │   │   ├── pdfExport.ts        # PDF generation utilities
│   │   │   └── trpc.ts             # TRPC client configuration
│   │   ├── App.tsx                 # Main app component and router
│   │   └── main.tsx                # Entry point
│   ├── public/                      # Static assets
│   │   ├── manifest.json           # PWA manifest
│   │   ├── service-worker.js       # Service worker
│   │   └── favicon.ico             # App icon
│   └── index.html                  # HTML template
├── server/                          # Backend Express application
│   ├── routers.ts                  # tRPC procedure definitions (guest, auth, AI routers)
│   ├── db.ts                       # Database queries & conversion tracking
│   ├── fileParser.ts               # Raw text cleaning + LLM parsing & post-deduplication
│   ├── aiSuggestions.ts            # LLM prompts for bullet & summary rewriting
│   ├── storage.ts                  # S3 storage helpers
│   └── _core/                      # Framework core (cookies, contexts, oauth)
├── drizzle/                         # Database schema and migrations
│   ├── schema.ts                   # Table definitions (guest_sessions, cloud_backups, resumes)
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
| Database ORM | Drizzle ORM |
| Database | MySQL/TiDB |
| Authentication | Manus OAuth + Optional Guest session tracking |
| PDF Generation | jsPDF + html2canvas |
| PWA | Service Worker + Web App Manifest |
| Testing | Vitest |
| Package Manager | pnpm |

---

## Features in Detail

### 1. Guest Experience & Local Storage
- **Anonymous Entry:** Users can start building resumes immediately.
- **Local Persistence:** Resumes and reports saved to browser's `LocalStorage` (up to 3 resume files).
- **Auto Cloud Migration:** As soon as a guest logs in, their drafts are uploaded to the MySQL database and local storage is cleared.

### 2. Strict PDF/DOCX Parser & Sanitizer
- **Raw Cleaning:** Filters out page numbers ("Page 1 of 5") and duplicate lines (e.g. repeated page headers or footers in double-column layouts).
- **Structured Schema:** Converts PDF text layers to JSON using structured schemas.
- **Genuine Check:** Rejects fabricated text. Dates and company names are mapped verbatim.
- **Post-LLM Clean:** Server-side deduplication merges duplicate skill categories, filters repetitive bullet points, and generates unique IDs.

### 3. AI Professional Summary Rewrite
- **Tailored Summaries:** A "Rewrite with AI" button is integrated into the summary editor tab.
- **ATS Alignment:** Rewrites are tailored to target job titles, target descriptions, and regional formatting standards.
- **Concise Layout:** Restricts summaries to 2-4 sentences with strong action verbs.

### 4. Print-Ready Template Preview
- **Disc Bullets Rendering:** Restores custom `list-style-type: disc` markers that Tailwind CSS's preflight resets would otherwise remove.
- **Typography:** Enforces a clean, standard, print-safe Google Font `Inter` stack on the PDF template layouts.

### 5. Admin CRM & Dashboard Analytics
- **Conversion Tracking:** Measures active guest counts, registered counts, and conversion percentages.
- **Cloud Backup:** Shows active backups and backup history metrics.

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

### Type Checking & Formatting

```bash
# Check TypeScript compilation
pnpm run check

# Format code
pnpm run format
```

---

## Changelog

### Version 1.1.0 (June 2026)
- **Guest Mode Persistence:** Added `LocalStorage` guest support with a 3-resume draft limit.
- **Automatic Cloud Migration:** Unified hook to sync local data to the database upon user login.
- **Sanitized PDF Parser:** Prevented AI hallucinations, auto-detected target roles, and eliminated duplicated text.
- **AI Summary Rewriting:** Added a 1-click summary optimizer inside the editor.
- **Styling Upgrade:** Enforced Inter fonts and bullet disc styling to prevent layout resets.
- **CRM conversion rates:** Active guest session analytics implemented in the super admin panel.

### Version 1.0.0 (Initial Release)
- Landing page with HexaStack branding
- Basic resume upload and parsing
- Multi-step builder from scratch
- Four professional templates
- Preset job descriptions and keyword mapping
- PDF exports

---

## Credits

**Developed by:** Surag & Anandu Krishna  
**Organization:** HexaStack Solutions  
**Website:** https://www.hexastacksolutions.com/

---

**Thank you for using HexaCv! Good luck with your job search! 🚀**
