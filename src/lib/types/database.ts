export type SkillCategory = 'language' | 'framework' | 'database' | 'cloud' | 'tool' | 'ai_ml' | 'soft';
export type Proficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type EmploymentType = 'full_time' | 'internship' | 'contract' | 'part_time';

export type EvidenceType = 
  | 'professional_experience'
  | 'project'
  | 'github_code'
  | 'github_readme'
  | 'linkedin_post'
  | 'certificate'
  | 'achievement'
  | 'education'
  | 'uploaded_document';

export type VerificationStatus = 
  | 'VERIFIED'
  | 'AI_INFERRED'
  | 'USER_ADDED'
  | 'USER_REJECTED'
  | 'NEEDS_REVIEW';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  headline?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  summary?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: SkillCategory;
  proficiency: Proficiency;
  years_of_experience: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  user_id: string;
  company: string;
  role: string;
  employment_type: EmploymentType;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  role?: string | null;
  technologies: string[];
  github_url?: string | null;
  deployment_url?: string | null;
  architecture_overview?: string | null;
  highlights: string[];
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  gpa?: string | null;
  coursework: string[];
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiration_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  skills_covered: string[];
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  organization?: string | null;
  date: string;
  ranking?: string | null;
  description: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SourceDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path?: string | null;
  sha256_hash: string;
  extracted_text?: string | null;
  parse_status: 'pending' | 'parsed' | 'failed';
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GitHubAccount {
  id: string;
  user_id: string;
  github_username: string;
  avatar_url?: string | null;
  profile_url?: string | null;
  connected_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: string;
  user_id: string;
  repo_name: string;
  repo_full_name: string;
  html_url: string;
  description?: string | null;
  primary_language?: string | null;
  detected_languages?: Record<string, number>;
  manifest_hash?: string | null;
  detected_skills: string[];
  demonstrated_features: string[];
  selected_for_analysis: boolean;
  last_analyzed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerEvidence {
  id: string;
  user_id: string;
  type: EvidenceType;
  title: string;
  claim: string;
  skills: string[];
  source_type: 'github' | 'linkedin' | 'document' | 'profile' | 'manual';
  source_id?: string | null;
  source_reference?: string | null;
  confidence: number;
  verification_status: VerificationStatus;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  company: string;
  role: string;
  job_url?: string | null;
  job_description: string;
  description_hash: string;
  status: 'Saved' | 'Analyzed' | 'Resume Generated' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  deadline?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobRequirement {
  id: string;
  job_id: string;
  user_id: string;
  requirement: string;
  category: 'REQUIRED' | 'PREFERRED' | 'RESPONSIBILITY' | 'CONTEXT';
  keywords: string[];
  weight: number;
  created_at: string;
}

export interface JobMatch {
  id: string;
  job_id: string;
  requirement_id: string;
  evidence_id?: string | null;
  match_strength: 'STRONG' | 'PARTIAL' | 'NONE';
  reason: string;
  created_at: string;
}

export interface ResumeData {
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    id?: string;
    company: string;
    role: string;
    location?: string;
    dates: string;
    bullets: {
      text: string;
      evidence_ids?: string[];
      has_warning?: boolean;
      warning_text?: string;
    }[];
  }[];
  projects: {
    id?: string;
    title: string;
    role?: string;
    technologies: string[];
    link?: string;
    bullets: {
      text: string;
      evidence_ids?: string[];
      has_warning?: boolean;
      warning_text?: string;
    }[];
  }[];
  education: {
    institution: string;
    degree: string;
    dates: string;
    gpa?: string;
    coursework?: string[];
  }[];
  achievements?: {
    title: string;
    date?: string;
    description: string;
    evidence_ids?: string[];
  }[];
  certificates?: {
    name: string;
    issuer: string;
    date: string;
  }[];
}

export interface ResumeVersion {
  id: string;
  user_id: string;
  job_id?: string | null;
  version_name: string;
  target_role: string;
  target_company?: string | null;
  template_id: 'minimal-professional' | 'modern-technical' | 'compact-engineering';
  page_count: number;
  resume_data: ResumeData;
  created_at: string;
  updated_at: string;
}

export interface ATSReport {
  id: string;
  resume_version_id: string;
  job_id: string;
  heuristic_score: number;
  matched_keywords: string[];
  missing_required_skills: string[];
  formatting_issues: string[];
  bullet_length_issues: string[];
  unsupported_claims: string[];
  analysis_details?: Record<string, unknown>;
  created_at: string;
}

export interface GenerationRun {
  id: string;
  user_id: string;
  operation: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  is_cached: boolean;
  prompt_version: string;
  created_at: string;
}
