-- Supabase Migration: 001_initial_schema.sql
-- Career Intelligence & Resume Engine (CIRE)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    headline TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Skills
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'language', 'framework', 'database', 'cloud', 'tool', 'ai_ml', 'soft'
    proficiency TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
    years_of_experience NUMERIC DEFAULT 1,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, name)
);

-- 3. Experiences
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    employment_type TEXT DEFAULT 'full_time', -- 'full_time', 'internship', 'contract', 'part_time'
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    responsibilities TEXT[] DEFAULT '{}',
    achievements TEXT[] DEFAULT '{}',
    technologies TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    role TEXT,
    technologies TEXT[] DEFAULT '{}',
    github_url TEXT,
    deployment_url TEXT,
    architecture_overview TEXT,
    highlights TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Education
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    gpa TEXT,
    coursework TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    skills_covered TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    organization TEXT,
    date DATE NOT NULL,
    ranking TEXT,
    description TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Source Documents
CREATE TABLE IF NOT EXISTS public.source_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT,
    sha256_hash TEXT NOT NULL,
    extracted_text TEXT,
    parse_status TEXT DEFAULT 'pending', -- 'pending', 'parsed', 'failed'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. GitHub Accounts
CREATE TABLE IF NOT EXISTS public.github_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    github_username TEXT NOT NULL,
    avatar_url TEXT,
    profile_url TEXT,
    connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. GitHub Repositories
CREATE TABLE IF NOT EXISTS public.github_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    repo_name TEXT NOT NULL,
    repo_full_name TEXT NOT NULL,
    html_url TEXT NOT NULL,
    description TEXT,
    primary_language TEXT,
    detected_languages JSONB DEFAULT '{}',
    manifest_hash TEXT,
    detected_skills TEXT[] DEFAULT '{}',
    demonstrated_features TEXT[] DEFAULT '{}',
    selected_for_analysis BOOLEAN DEFAULT FALSE,
    last_analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, repo_full_name)
);

-- 11. LinkedIn Imports
CREATE TABLE IF NOT EXISTS public.linkedin_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    import_type TEXT NOT NULL, -- 'archive_zip', 'profile_json', 'post_text', 'manual'
    raw_content TEXT,
    extracted_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Unified Career Evidence Model
CREATE TABLE IF NOT EXISTS public.career_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'professional_experience', 'project', 'github_code', 'github_readme', 'linkedin_post', 'certificate', 'achievement', 'education', 'uploaded_document'
    title TEXT NOT NULL,
    claim TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    source_type TEXT NOT NULL, -- 'github', 'linkedin', 'document', 'profile', 'manual'
    source_id TEXT,
    source_reference TEXT,
    confidence NUMERIC DEFAULT 1.0,
    verification_status TEXT DEFAULT 'VERIFIED', -- 'VERIFIED', 'AI_INFERRED', 'USER_ADDED', 'USER_REJECTED', 'NEEDS_REVIEW'
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. Jobs
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    job_url TEXT,
    job_description TEXT NOT NULL,
    description_hash TEXT NOT NULL,
    status TEXT DEFAULT 'Analyzed', -- 'Saved', 'Analyzed', 'Resume Generated', 'Applied', 'Interview', 'Offer', 'Rejected'
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. Job Requirements
CREATE TABLE IF NOT EXISTS public.job_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    requirement TEXT NOT NULL,
    category TEXT NOT NULL, -- 'REQUIRED', 'PREFERRED', 'RESPONSIBILITY', 'CONTEXT'
    keywords TEXT[] DEFAULT '{}',
    weight NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. Job Matches
CREATE TABLE IF NOT EXISTS public.job_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    requirement_id UUID REFERENCES public.job_requirements(id) ON DELETE CASCADE NOT NULL,
    evidence_id UUID REFERENCES public.career_evidence(id) ON DELETE CASCADE,
    match_strength TEXT NOT NULL, -- 'STRONG', 'PARTIAL', 'NONE'
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. Resume Versions
CREATE TABLE IF NOT EXISTS public.resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    version_name TEXT NOT NULL,
    target_role TEXT NOT NULL,
    target_company TEXT,
    template_id TEXT DEFAULT 'minimal-professional', -- 'minimal-professional', 'modern-technical', 'compact-engineering'
    page_count INTEGER DEFAULT 1,
    resume_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. Resume Bullets
CREATE TABLE IF NOT EXISTS public.resume_bullets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_version_id UUID REFERENCES public.resume_versions(id) ON DELETE CASCADE NOT NULL,
    section TEXT NOT NULL, -- 'summary', 'experience', 'projects', 'achievements'
    bullet_text TEXT NOT NULL,
    evidence_ids UUID[] DEFAULT '{}',
    has_unsupported_claim BOOLEAN DEFAULT FALSE,
    validation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 18. ATS Reports
CREATE TABLE IF NOT EXISTS public.ats_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_version_id UUID REFERENCES public.resume_versions(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    heuristic_score NUMERIC NOT NULL,
    matched_keywords TEXT[] DEFAULT '{}',
    missing_required_skills TEXT[] DEFAULT '{}',
    formatting_issues TEXT[] DEFAULT '{}',
    bullet_length_issues TEXT[] DEFAULT '{}',
    unsupported_claims TEXT[] DEFAULT '{}',
    analysis_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 19. Generation Runs (AI Cost & Audit Log)
CREATE TABLE IF NOT EXISTS public.generation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    operation TEXT NOT NULL, -- 'job_analysis', 'evidence_matching', 'resume_generation', 'bullet_rewrite', 'ats_analysis', 'document_extraction', 'github_analysis'
    provider TEXT NOT NULL, -- 'gemini', 'ollama'
    model TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    is_cached BOOLEAN DEFAULT FALSE,
    prompt_version TEXT DEFAULT 'v1',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indices for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_experiences_user_id ON public.experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_career_evidence_user_id ON public.career_evidence(user_id);
CREATE INDEX IF NOT EXISTS idx_career_evidence_type ON public.career_evidence(type);
CREATE INDEX IF NOT EXISTS idx_career_evidence_status ON public.career_evidence(verification_status);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON public.resume_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_runs_user_id_created ON public.generation_runs(user_id, created_at);

-- Row Level Security (RLS) Enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_runs ENABLE ROW LEVEL SECURITY;

-- Standard RLS Policies: users access only their own rows
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skills" ON public.skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own experiences" ON public.experiences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own education" ON public.education FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own certificates" ON public.certificates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON public.achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own source documents" ON public.source_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own github account" ON public.github_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own github repos" ON public.github_repositories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own linkedin imports" ON public.linkedin_imports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own evidence" ON public.career_evidence FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own jobs" ON public.jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own job requirements" ON public.job_requirements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own job matches" ON public.job_matches FOR ALL USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_matches.job_id AND j.user_id = auth.uid()));
CREATE POLICY "Users can manage own resume versions" ON public.resume_versions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own resume bullets" ON public.resume_bullets FOR ALL USING (EXISTS (SELECT 1 FROM public.resume_versions rv WHERE rv.id = resume_bullets.resume_version_id AND rv.user_id = auth.uid()));
CREATE POLICY "Users can manage own ats reports" ON public.ats_reports FOR ALL USING (EXISTS (SELECT 1 FROM public.resume_versions rv WHERE rv.id = ats_reports.resume_version_id AND rv.user_id = auth.uid()));
CREATE POLICY "Users can manage own generation runs" ON public.generation_runs FOR ALL USING (auth.uid() = user_id);
