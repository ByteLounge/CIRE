import { 
  Profile, 
  Skill, 
  Experience, 
  Project, 
  Education, 
  Certificate, 
  Achievement, 
  CareerEvidence,
  GitHubRepository,
  Job,
  JobRequirement,
  JobMatch,
  ResumeVersion,
  ATSReport,
  GenerationRun
} from '@/lib/types/database';
import {
  DEMO_USER_ID,
  INITIAL_DEMO_PROFILE,
  INITIAL_DEMO_SKILLS,
  INITIAL_DEMO_EXPERIENCE,
  INITIAL_DEMO_PROJECTS,
  INITIAL_DEMO_EDUCATION,
  INITIAL_DEMO_CERTIFICATES,
  INITIAL_DEMO_ACHIEVEMENTS,
  INITIAL_DEMO_EVIDENCE,
  INITIAL_DEMO_REPOS,
  INITIAL_DEMO_JOBS,
  INITIAL_DEMO_JOB_REQUIREMENTS
} from './seed-data';

// In-Memory Data Store with Global Persistence across HMR in Node.js
class MemoryStore {
  profiles: Map<string, Profile> = new Map();
  skills: Map<string, Skill[]> = new Map();
  experiences: Map<string, Experience[]> = new Map();
  projects: Map<string, Project[]> = new Map();
  education: Map<string, Education[]> = new Map();
  certificates: Map<string, Certificate[]> = new Map();
  achievements: Map<string, Achievement[]> = new Map();
  evidence: Map<string, CareerEvidence[]> = new Map();
  repos: Map<string, GitHubRepository[]> = new Map();
  jobs: Map<string, Job[]> = new Map();
  requirements: Map<string, JobRequirement[]> = new Map();
  matches: Map<string, JobMatch[]> = new Map();
  resumeVersions: Map<string, ResumeVersion[]> = new Map();
  atsReports: Map<string, ATSReport[]> = new Map();
  generationRuns: Map<string, GenerationRun[]> = new Map();

  constructor() {
    this.seedDemoUser();
  }

  seedDemoUser() {
    this.profiles.set(DEMO_USER_ID, { ...INITIAL_DEMO_PROFILE });
    this.skills.set(DEMO_USER_ID, [...INITIAL_DEMO_SKILLS]);
    this.experiences.set(DEMO_USER_ID, [...INITIAL_DEMO_EXPERIENCE]);
    this.projects.set(DEMO_USER_ID, [...INITIAL_DEMO_PROJECTS]);
    this.education.set(DEMO_USER_ID, [...INITIAL_DEMO_EDUCATION]);
    this.certificates.set(DEMO_USER_ID, [...INITIAL_DEMO_CERTIFICATES]);
    this.achievements.set(DEMO_USER_ID, [...INITIAL_DEMO_ACHIEVEMENTS]);
    this.evidence.set(DEMO_USER_ID, [...INITIAL_DEMO_EVIDENCE]);
    this.repos.set(DEMO_USER_ID, [...INITIAL_DEMO_REPOS]);
    this.jobs.set(DEMO_USER_ID, [...INITIAL_DEMO_JOBS]);
    this.requirements.set('job-1', [...INITIAL_DEMO_JOB_REQUIREMENTS]);
  }
}

// Preserve store across Next.js dev reloads
declare global {
  var __CIRE_MEMORY_STORE__: MemoryStore | undefined;
}

const memoryStore = globalThis.__CIRE_MEMORY_STORE__ ?? new MemoryStore();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__CIRE_MEMORY_STORE__ = memoryStore;
}

export const db = {
  // Profiles
  async getProfile(userId: string = DEMO_USER_ID): Promise<Profile> {
    const profile = memoryStore.profiles.get(userId);
    if (!profile) {
      const newProfile: Profile = {
        id: `prof-${Date.now()}`,
        user_id: userId,
        full_name: 'New Candidate',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memoryStore.profiles.set(userId, newProfile);
      return newProfile;
    }
    return profile;
  },

  async updateProfile(userId: string = DEMO_USER_ID, updates: Partial<Profile>): Promise<Profile> {
    const current = await this.getProfile(userId);
    const updated: Profile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    memoryStore.profiles.set(userId, updated);
    return updated;
  },

  // Skills
  async getSkills(userId: string = DEMO_USER_ID): Promise<Skill[]> {
    return memoryStore.skills.get(userId) || [];
  },

  async addSkill(userId: string = DEMO_USER_ID, skill: Omit<Skill, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Skill> {
    const skills = await this.getSkills(userId);
    const newSkill: Skill = {
      ...skill,
      id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    skills.push(newSkill);
    memoryStore.skills.set(userId, skills);
    return newSkill;
  },

  async deleteSkill(userId: string = DEMO_USER_ID, skillId: string): Promise<boolean> {
    const skills = await this.getSkills(userId);
    const filtered = skills.filter(s => s.id !== skillId);
    memoryStore.skills.set(userId, filtered);
    return true;
  },

  // Experiences
  async getExperiences(userId: string = DEMO_USER_ID): Promise<Experience[]> {
    return memoryStore.experiences.get(userId) || [];
  },

  async addExperience(userId: string = DEMO_USER_ID, exp: Omit<Experience, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Experience> {
    const list = await this.getExperiences(userId);
    const newExp: Experience = {
      ...exp,
      id: `exp-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(newExp);
    memoryStore.experiences.set(userId, list);

    // Automatically create evidence entry
    await this.addEvidence(userId, {
      type: 'professional_experience',
      title: `${newExp.role} at ${newExp.company}`,
      claim: newExp.responsibilities.join('; ') || `Worked as ${newExp.role}`,
      skills: newExp.technologies,
      source_type: 'profile',
      source_id: newExp.id,
      source_reference: `Employment: ${newExp.company}`,
      confidence: 1.0,
      verification_status: 'USER_ADDED',
    });

    return newExp;
  },

  async updateExperience(userId: string = DEMO_USER_ID, id: string, updates: Partial<Experience>): Promise<Experience | null> {
    const list = await this.getExperiences(userId);
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    memoryStore.experiences.set(userId, list);
    return list[idx];
  },

  async deleteExperience(userId: string = DEMO_USER_ID, id: string): Promise<boolean> {
    const list = await this.getExperiences(userId);
    memoryStore.experiences.set(userId, list.filter(e => e.id !== id));
    return true;
  },

  // Projects
  async getProjects(userId: string = DEMO_USER_ID): Promise<Project[]> {
    return memoryStore.projects.get(userId) || [];
  },

  async addProject(userId: string = DEMO_USER_ID, proj: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const list = await this.getProjects(userId);
    const newProj: Project = {
      ...proj,
      id: `proj-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(newProj);
    memoryStore.projects.set(userId, list);

    // Auto-create evidence
    await this.addEvidence(userId, {
      type: 'project',
      title: newProj.title,
      claim: newProj.description,
      skills: newProj.technologies,
      source_type: 'profile',
      source_id: newProj.id,
      source_reference: newProj.github_url || `Project: ${newProj.title}`,
      confidence: 1.0,
      verification_status: 'USER_ADDED',
    });

    return newProj;
  },

  async updateProject(userId: string = DEMO_USER_ID, id: string, updates: Partial<Project>): Promise<Project | null> {
    const list = await this.getProjects(userId);
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    memoryStore.projects.set(userId, list);
    return list[idx];
  },

  async deleteProject(userId: string = DEMO_USER_ID, id: string): Promise<boolean> {
    const list = await this.getProjects(userId);
    memoryStore.projects.set(userId, list.filter(p => p.id !== id));
    return true;
  },

  // Education
  async getEducation(userId: string = DEMO_USER_ID): Promise<Education[]> {
    return memoryStore.education.get(userId) || [];
  },

  async addEducation(userId: string = DEMO_USER_ID, edu: Omit<Education, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Education> {
    const list = await this.getEducation(userId);
    const newEdu: Education = {
      ...edu,
      id: `edu-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(newEdu);
    memoryStore.education.set(userId, list);
    return newEdu;
  },

  async deleteEducation(userId: string = DEMO_USER_ID, id: string): Promise<boolean> {
    const list = await this.getEducation(userId);
    memoryStore.education.set(userId, list.filter(e => e.id !== id));
    return true;
  },

  // Certificates
  async getCertificates(userId: string = DEMO_USER_ID): Promise<Certificate[]> {
    return memoryStore.certificates.get(userId) || [];
  },

  async addCertificate(userId: string = DEMO_USER_ID, cert: Omit<Certificate, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Certificate> {
    const list = await this.getCertificates(userId);
    const newCert: Certificate = {
      ...cert,
      id: `cert-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(newCert);
    memoryStore.certificates.set(userId, list);

    // Auto-create evidence
    await this.addEvidence(userId, {
      type: 'certificate',
      title: newCert.name,
      claim: `Certified by ${newCert.issuer} covering ${newCert.skills_covered.join(', ')}`,
      skills: newCert.skills_covered,
      source_type: 'document',
      source_id: newCert.id,
      source_reference: newCert.credential_url || newCert.credential_id || newCert.issuer,
      confidence: 1.0,
      verification_status: 'USER_ADDED',
    });

    return newCert;
  },

  async deleteCertificate(userId: string = DEMO_USER_ID, id: string): Promise<boolean> {
    const list = await this.getCertificates(userId);
    memoryStore.certificates.set(userId, list.filter(c => c.id !== id));
    return true;
  },

  // Achievements
  async getAchievements(userId: string = DEMO_USER_ID): Promise<Achievement[]> {
    return memoryStore.achievements.get(userId) || [];
  },

  async addAchievement(userId: string = DEMO_USER_ID, ach: Omit<Achievement, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Achievement> {
    const list = await this.getAchievements(userId);
    const newAch: Achievement = {
      ...ach,
      id: `ach-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(newAch);
    memoryStore.achievements.set(userId, list);

    // Auto-create evidence
    await this.addEvidence(userId, {
      type: 'achievement',
      title: newAch.title,
      claim: newAch.description,
      skills: [],
      source_type: 'profile',
      source_id: newAch.id,
      source_reference: newAch.organization || 'Achievement Entry',
      confidence: 1.0,
      verification_status: 'USER_ADDED',
    });

    return newAch;
  },

  async deleteAchievement(userId: string = DEMO_USER_ID, id: string): Promise<boolean> {
    const list = await this.getAchievements(userId);
    memoryStore.achievements.set(userId, list.filter(a => a.id !== id));
    return true;
  },

  // Career Evidence
  async getEvidence(userId: string = DEMO_USER_ID): Promise<CareerEvidence[]> {
    return memoryStore.evidence.get(userId) || [];
  },

  async addEvidence(userId: string = DEMO_USER_ID, ev: Omit<CareerEvidence, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CareerEvidence> {
    const list = await this.getEvidence(userId);
    const newEv: CareerEvidence = {
      ...ev,
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(newEv);
    memoryStore.evidence.set(userId, list);
    return newEv;
  },

  async updateEvidence(userId: string = DEMO_USER_ID, id: string, updates: Partial<CareerEvidence>): Promise<CareerEvidence | null> {
    const list = await this.getEvidence(userId);
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    memoryStore.evidence.set(userId, list);
    return list[idx];
  },

  async deleteEvidence(userId: string = DEMO_USER_ID, id: string): Promise<boolean> {
    const list = await this.getEvidence(userId);
    memoryStore.evidence.set(userId, list.filter(e => e.id !== id));
    return true;
  },

  // GitHub Repositories
  async getRepositories(userId: string = DEMO_USER_ID): Promise<GitHubRepository[]> {
    return memoryStore.repos.get(userId) || [];
  },

  async saveRepositories(userId: string = DEMO_USER_ID, repos: GitHubRepository[]): Promise<void> {
    memoryStore.repos.set(userId, repos);
  },

  async updateRepository(userId: string = DEMO_USER_ID, repoId: string, updates: Partial<GitHubRepository>): Promise<GitHubRepository | null> {
    const list = await this.getRepositories(userId);
    const idx = list.findIndex(r => r.id === repoId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    memoryStore.repos.set(userId, list);
    return list[idx];
  },

  // Jobs
  async getJobs(userId: string = DEMO_USER_ID): Promise<Job[]> {
    return memoryStore.jobs.get(userId) || [];
  },

  async getJobById(jobId: string, userId: string = DEMO_USER_ID): Promise<Job | null> {
    const jobs = await this.getJobs(userId);
    return jobs.find(j => j.id === jobId) || null;
  },

  async saveJob(userId: string = DEMO_USER_ID, jobData: Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Job> {
    const list = await this.getJobs(userId);
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newJob);
    memoryStore.jobs.set(userId, list);
    return newJob;
  },

  async deleteJob(userId: string = DEMO_USER_ID, jobId: string): Promise<boolean> {
    const list = await this.getJobs(userId);
    memoryStore.jobs.set(userId, list.filter(j => j.id !== jobId));
    return true;
  },

  // Job Requirements
  async getJobRequirements(jobId: string): Promise<JobRequirement[]> {
    return memoryStore.requirements.get(jobId) || [];
  },

  async saveJobRequirements(jobId: string, requirements: JobRequirement[]): Promise<void> {
    memoryStore.requirements.set(jobId, requirements);
  },

  // Job Matches
  async getJobMatches(jobId: string): Promise<JobMatch[]> {
    return memoryStore.matches.get(jobId) || [];
  },

  async saveJobMatches(jobId: string, matches: JobMatch[]): Promise<void> {
    memoryStore.matches.set(jobId, matches);
  },

  // Resume Versions
  async getResumeVersions(userId: string = DEMO_USER_ID): Promise<ResumeVersion[]> {
    return memoryStore.resumeVersions.get(userId) || [];
  },

  async getResumeVersionById(id: string, userId: string = DEMO_USER_ID): Promise<ResumeVersion | null> {
    const versions = await this.getResumeVersions(userId);
    return versions.find(v => v.id === id) || null;
  },

  async saveResumeVersion(userId: string = DEMO_USER_ID, version: Omit<ResumeVersion, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ResumeVersion> {
    const list = await this.getResumeVersions(userId);
    const newVersion: ResumeVersion = {
      ...version,
      id: `res-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newVersion);
    memoryStore.resumeVersions.set(userId, list);
    return newVersion;
  },

  async updateResumeVersion(userId: string = DEMO_USER_ID, id: string, updates: Partial<ResumeVersion>): Promise<ResumeVersion | null> {
    const list = await this.getResumeVersions(userId);
    const idx = list.findIndex(v => v.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    memoryStore.resumeVersions.set(userId, list);
    return list[idx];
  },

  async deleteResumeVersion(userId: string = DEMO_USER_ID, id: string): Promise<boolean> {
    const list = await this.getResumeVersions(userId);
    memoryStore.resumeVersions.set(userId, list.filter(v => v.id !== id));
    return true;
  },

  // ATS Reports
  async getATSReport(resumeVersionId: string): Promise<ATSReport | null> {
    for (const reports of memoryStore.atsReports.values()) {
      const match = reports.find(r => r.resume_version_id === resumeVersionId);
      if (match) return match;
    }
    return null;
  },

  async saveATSReport(report: ATSReport): Promise<void> {
    const existing = memoryStore.atsReports.get(report.job_id) || [];
    const filtered = existing.filter(r => r.resume_version_id !== report.resume_version_id);
    filtered.push(report);
    memoryStore.atsReports.set(report.job_id, filtered);
  },

  // Generation Runs (AI Cost Tracking)
  async getGenerationRuns(userId: string = DEMO_USER_ID): Promise<GenerationRun[]> {
    return memoryStore.generationRuns.get(userId) || [];
  },

  async logGenerationRun(run: Omit<GenerationRun, 'id' | 'created_at'>): Promise<GenerationRun> {
    const list = memoryStore.generationRuns.get(run.user_id) || [];
    const newRun: GenerationRun = {
      ...run,
      id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    list.unshift(newRun);
    memoryStore.generationRuns.set(run.user_id, list);
    return newRun;
  }
};
