# Career Intelligence & Resume Engine (CIRE)

> **Truthful, Evidence-Grounded Career Knowledge Base & ATS Resume Engine**
> Aggregate real professional evidence from GitHub, LinkedIn, certificates, uploaded resumes, and projects; map job requirements to verified evidence; and generate ATS-friendly, tailored resumes without fabricating facts.

---

## 1. Core Product Philosophy & Pipeline

CIRE strictly adheres to an evidence-first architecture where the AI is never permitted to invent qualifications or metrics:

```
USER SOURCES (GitHub / LinkedIn / Certificates / Resumes)
       ↓
INGESTION & EXTRACTION (Deterministic + AI with strict JSON schemas)
       ↓
NORMALIZATION & VERIFICATION (Explicit vs Inferred, User Approval)
       ↓
CAREER KNOWLEDGE BASE (PostgreSQL + RLS + Structured Evidence)
       ↓
JOB DESCRIPTION ANALYSIS (Required / Preferred / Responsibilities)
       ↓
EVIDENCE MATCHING (Exact + Semantic Relevance Signal)
       ↓
RESUME COMPOSITION (Deterministic JSON Model)
       ↓
FACT / CLAIM VALIDATION (Flags unsupported metrics or skills)
       ↓
ATS ANALYSIS (Keyword Coverage, Heuristic Formatting Checks)
       ↓
HUMAN REVIEW & EDITING (Side-by-side preview with evidence inspection)
       ↓
EXPORT (ATS-Friendly DOCX & Print-to-PDF)
```

### What CIRE Does:
- Rewrites, shortens, reorders, and combines verified information.
- Highlights relevant technologies backed by evidence.
- Emphasizes relevant projects and achievements.
- Flags unverified claims instead of inventing them.

### What CIRE Never Does:
- NEVER invents companies, dates, or job titles.
- NEVER invents performance metrics (e.g. "reduced latency by 40%") unless explicitly verified.
- NEVER inserts unverified technologies (e.g. AWS, Kubernetes) simply because they appear in the target job description.
- NEVER mutates the Master Career Profile during job-specific resume generation.

---

## 2. Tech Stack

- **Framework**: [Next.js 16 App Router](https://nextjs.org/) (React 19, TypeScript strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with subtle, professional design tokens
- **Icons**: [Lucide React](https://lucide.dev/) + Custom SVG brand components
- **Database & Auth**: [Supabase](https://supabase.com/) PostgreSQL with Row Level Security (RLS) & Local Persistent Adapter
- **Document Processing**: `docx` (ATS-compliant DOCX generation), `mammoth` (DOCX parsing), `pdf-parse` (PDF extraction)
- **AI Providers**:
  - **Primary**: Google Gemini API (`gemini-1.5-flash` via `@google/generative-ai`)
  - **Local/Offline**: [Ollama](https://ollama.ai/) (`llama3` via HTTP JSON API)
  - **Deterministic Heuristic Engine**: Zero-crash grounded fallback

---

## 3. Key Implemented Features

1. **Career Intelligence Dashboard**:
   - Profile completeness percentage with actionable guidance.
   - Real-time stat counts (projects, repositories, skills, experience, certificates, achievements, evidence, resumes).
   - Quick actions to import sources or analyze target opportunities.
2. **Master Career Profile**:
   - Canonical single source of truth (personal info, headline, contact, URLs, summary).
   - Isolated from job-specific tailoring.
3. **Projects, Experience, Skills, Education, Certificates, Achievements**:
   - Full CRUD operations with automatic traceable Career Evidence generation.
   - Categorized skills matrix (languages, frameworks, databases, tools, cloud, AI/ML, soft skills).
4. **GitHub Repository Evidence**:
   - Manifest analysis (package.json, requirements.txt, Dockerfile).
   - Distinguishes **Explicit Facts** from **Inferred Features**.
   - Selective analysis to prevent uncontrolled costs.
5. **LinkedIn Data Ingestion**:
   - Safe, authorized import of posts and export data.
   - Post claims stored with `NEEDS_REVIEW` status for user approval.
6. **Source Document Ingestion**:
   - Multi-format parser (PDF, DOCX, TXT, images).
   - SHA-256 hash deduplication to prevent re-processing identical documents.
   - Pre-commit structured review screen.
7. **Unified Evidence Explorer**:
   - Central repository of all career claims.
   - Filtering by status (`VERIFIED`, `AI_INFERRED`, `NEEDS_REVIEW`, `USER_REJECTED`).
   - One-click verification and rejection toggles.
8. **Job Description Analyzer**:
   - Extracts `REQUIRED`, `PREFERRED`, `RESPONSIBILITY`, and `KEYWORDS`.
   - Description hash caching to eliminate duplicate AI calls.
9. **Evidence Matching Engine**:
   - Maps each job requirement to verified evidence in the user's knowledge base.
   - Highlights Supported, Partial/Inferred, and Missing requirements.
10. **Tailored Resume Builder & Editor**:
    - Choice of 3 ATS-friendly templates: Minimal Professional, Modern Technical, Compact Engineering.
    - 1-page or 2-page budget control.
    - Side-by-side interactive bullet editor and live formatted resume preview.
    - `[View Evidence]` button on every bullet tracing back to the source code or employment entry.
    - Direct export to ATS-formatted `.docx` and print-to-PDF.
11. **ATS Heuristic Analyzer & Fact Checker**:
    - Keyword density coverage (Matched vs Missing).
    - Hard claim validation flagging unsupported percentages or technologies.
12. **Cost Controls & AI Budget Dashboard**:
    - Global AI spend safety kill switch (`AI_ENABLED=true/false`).
    - Configurable daily quotas and per-operation rate limits.
    - Audit log recording latency, model, provider, and cache hits.

---

## 4. Environment Configuration

Create a `.env.local` file based on `.env.example`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider Configuration
AI_ENABLED=true
AI_PROVIDER=gemini # options: gemini, ollama
GEMINI_API_KEY=your-gemini-api-key

# Local Ollama Configuration (Optional free/offline local inference)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# AI Cost Control & Daily Quotas
AI_DAILY_REQUEST_LIMIT=30
MAX_RESUME_GENERATIONS_PER_DAY=5
MAX_JOB_ANALYSIS_PER_DAY=10
MAX_BULLET_REWRITES_PER_DAY=20
MAX_GITHUB_ANALYSES_PER_DAY=10
MAX_DOCUMENT_ANALYSES_PER_DAY=10
MAX_ATS_ANALYSES_PER_DAY=10

# GitHub Integration
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_PERSONAL_ACCESS_TOKEN=
```

---

## 5. Local Setup & Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (verifies anti-fabrication rules & CRUD)
npm test

# 3. Start development server
npm run dev

# 4. Open application
# Navigate to http://localhost:3000
```

---

## 6. Database Migration (Supabase PostgreSQL)

The schema migration is located at `supabase/migrations/001_initial_schema.sql`.

To run on Supabase:
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`.
3. Execute the script to create all 19 normalized tables, indexes, and Row Level Security (RLS) policies.

---

## 7. Verification Test Suite

CIRE includes an automated test suite verifying anti-fabrication guarantees:

```bash
npm test
```

### Verified Test Cases:
- **Test 1**: Master Profile CRUD operations.
- **Test 2**: Technical Projects addition and automatic Career Evidence registration.
- **Test 3**: AI Cost Safety & Daily Quotas enforcement.
- **Test 4**: Job Description parsing and requirement classification.
- **Test 5**: Requirement-to-Evidence Matching (Strong match vs No Evidence).
- **Test 6 (Anti-Fabrication)**:
  - Blocks unsupported metrics (`"40% improvement"` blocked).
  - Blocks unverified technologies (`Kubernetes` / `AWS` blocked when absent from candidate evidence).
  - Approves truthful, evidence-backed claims.
- **Test 7**: ATS Heuristic score and keyword coverage.
- **Test 8**: Snapshot isolation between tailored resumes and the Master Career Profile.

---

## 8. Deployment (Free-First Architecture)

- **Frontend & API**: Deploy to [Vercel](https://vercel.com/) with one click.
- **Database**: [Supabase Free Tier](https://supabase.com/) PostgreSQL + Auth + Storage.
- **AI**: Google Gemini API (Free tier) or Local Ollama.
- **Infrastructure Cost**: **$0.00 / month** on free tiers.
