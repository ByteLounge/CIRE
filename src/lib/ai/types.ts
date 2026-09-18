import { Profile, CareerEvidence, ResumeData, JobRequirement } from '@/lib/types/database';

export interface JobAnalysisOutput {
  role: string;
  seniority: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  keywords: string[];
  important_terminology: string[];
}

export interface DocumentExtractionOutput {
  personal_info: {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  skills: string[];
  experiences: Array<{
    company: string;
    role: string;
    start_date: string;
    end_date?: string;
    responsibilities: string[];
    technologies: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date?: string;
  }>;
  certificates: Array<{
    name: string;
    issuer: string;
    issue_date: string;
    skills_covered: string[];
  }>;
}

export interface RepoAnalysisOutput {
  repo_name: string;
  description: string;
  detected_skills: string[];
  demonstrated_features: string[];
  explicit_claims: string[];
  inferred_claims: string[];
}

export interface LinkedInExtractionOutput {
  experience_claims: string[];
  skills: string[];
  post_insights: Array<{
    post_snippet: string;
    claim: string;
    skills: string[];
  }>;
}

export interface EvidenceMatchOutput {
  requirement: string;
  matched_evidence_id?: string;
  matched_title?: string;
  match_strength: 'STRONG' | 'PARTIAL' | 'NONE';
  reason: string;
}

export interface ResumeGenerationOutput {
  summary: string;
  selected_skills: { category: string; items: string[] }[];
  tailored_experience: Array<{
    company: string;
    role: string;
    location?: string;
    dates: string;
    bullets: Array<{
      text: string;
      evidence_ids: string[];
      has_warning: boolean;
      warning_text?: string;
    }>;
  }>;
  tailored_projects: Array<{
    title: string;
    role?: string;
    technologies: string[];
    bullets: Array<{
      text: string;
      evidence_ids: string[];
      has_warning: boolean;
      warning_text?: string;
    }>;
  }>;
  changes_summary: {
    added: string[];
    removed: string[];
    reordered: string[];
    rationales: string[];
  };
}

export interface BulletValidationOutput {
  is_supported: boolean;
  unsupported_metrics: string[];
  unsupported_technologies: string[];
  warning_message?: string;
  claim_evidence_ids: string[];
}

export interface ATSAnalysisOutput {
  heuristic_score: number;
  matched_keywords: string[];
  missing_required_skills: string[];
  formatting_issues: string[];
  bullet_length_issues: string[];
  unsupported_claims: string[];
}

export interface AIProvider {
  name: string;
  analyzeJob(description: string, company?: string, role?: string): Promise<JobAnalysisOutput>;
  analyzeGitHubRepo(repoName: string, readme: string, manifestContent: string): Promise<RepoAnalysisOutput>;
  extractDocument(text: string, fileType: string): Promise<DocumentExtractionOutput>;
  extractLinkedInData(rawContent: string): Promise<LinkedInExtractionOutput>;
  matchEvidence(requirement: string, evidenceItems: CareerEvidence[]): Promise<EvidenceMatchOutput>;
  generateResume(
    jobDescription: string,
    requirements: JobRequirement[],
    profile: Profile,
    evidence: CareerEvidence[],
    pageCount: number
  ): Promise<ResumeGenerationOutput>;
  validateBullet(bulletText: string, evidenceItems: CareerEvidence[]): Promise<BulletValidationOutput>;
  analyzeATS(jobDescription: string, resumeData: ResumeData): Promise<ATSAnalysisOutput>;
}
