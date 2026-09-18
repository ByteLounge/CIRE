import { GeminiProvider } from './gemini-provider';
import { 
  AIProvider, 
  JobAnalysisOutput, 
  RepoAnalysisOutput, 
  DocumentExtractionOutput, 
  LinkedInExtractionOutput, 
  EvidenceMatchOutput, 
  ResumeGenerationOutput, 
  BulletValidationOutput, 
  ATSAnalysisOutput 
} from './types';
import { Profile, CareerEvidence, ResumeData, JobRequirement } from '@/lib/types/database';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private baseUrl: string;
  private model: string;
  private fallback: GeminiProvider;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3';
    this.fallback = new GeminiProvider();
  }

  private async generate(prompt: string): Promise<string | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: 'json',
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.response;
    } catch {
      return null;
    }
  }

  async analyzeJob(description: string, company?: string, role?: string): Promise<JobAnalysisOutput> {
    const prompt = `Analyze this job description and return JSON with keys: role, seniority, required_skills, preferred_skills, responsibilities, keywords, important_terminology.\n\n${description}`;
    const text = await this.generate(prompt);
    if (text) {
      try {
        return JSON.parse(text);
      } catch {}
    }
    return this.fallback.analyzeJob(description, company, role);
  }

  async analyzeGitHubRepo(repoName: string, readme: string, manifestContent: string): Promise<RepoAnalysisOutput> {
    return this.fallback.analyzeGitHubRepo(repoName, readme, manifestContent);
  }

  async extractDocument(text: string, fileType: string): Promise<DocumentExtractionOutput> {
    return this.fallback.extractDocument(text, fileType);
  }

  async extractLinkedInData(rawContent: string): Promise<LinkedInExtractionOutput> {
    return this.fallback.extractLinkedInData(rawContent);
  }

  async matchEvidence(requirement: string, evidenceItems: CareerEvidence[]): Promise<EvidenceMatchOutput> {
    return this.fallback.matchEvidence(requirement, evidenceItems);
  }

  async generateResume(
    jobDescription: string,
    requirements: JobRequirement[],
    profile: Profile,
    evidence: CareerEvidence[],
    pageCount: number
  ): Promise<ResumeGenerationOutput> {
    return this.fallback.generateResume(jobDescription, requirements, profile, evidence, pageCount);
  }

  async validateBullet(bulletText: string, evidenceItems: CareerEvidence[]): Promise<BulletValidationOutput> {
    return this.fallback.validateBullet(bulletText, evidenceItems);
  }

  async analyzeATS(jobDescription: string, resumeData: ResumeData): Promise<ATSAnalysisOutput> {
    return this.fallback.analyzeATS(jobDescription, resumeData);
  }
}
