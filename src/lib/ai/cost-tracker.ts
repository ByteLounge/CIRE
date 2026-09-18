import { db } from '@/lib/store/db-adapter';
import crypto from 'crypto';

interface QuotaLimits {
  dailyRequests: number;
  maxResumeGenerations: number;
  maxJobAnalysis: number;
  maxBulletRewrites: number;
  maxGitHubAnalysis: number;
  maxDocumentAnalysis: number;
  maxATSAnalysis: number;
}

export class CostTracker {
  private static cache: Map<string, { data: unknown; expiresAt: number }> = new Map();

  static getLimits(): QuotaLimits {
    return {
      dailyRequests: parseInt(process.env.AI_DAILY_REQUEST_LIMIT || '30', 10),
      maxResumeGenerations: parseInt(process.env.MAX_RESUME_GENERATIONS_PER_DAY || '5', 10),
      maxJobAnalysis: parseInt(process.env.MAX_JOB_ANALYSIS_PER_DAY || '10', 10),
      maxBulletRewrites: parseInt(process.env.MAX_BULLET_REWRITES_PER_DAY || '20', 10),
      maxGitHubAnalysis: parseInt(process.env.MAX_GITHUB_ANALYSES_PER_DAY || '10', 10),
      maxDocumentAnalysis: parseInt(process.env.MAX_DOCUMENT_ANALYSES_PER_DAY || '10', 10),
      maxATSAnalysis: parseInt(process.env.MAX_ATS_ANALYSES_PER_DAY || '10', 10),
    };
  }

  static isAiEnabled(): boolean {
    const flag = process.env.AI_ENABLED;
    if (flag === 'false' || flag === '0') return false;
    return true;
  }

  static generateHash(content: string): string {
    return crypto.createHash('sha256').update(content.trim()).digest('hex');
  }

  static getCached<T>(hash: string): T | null {
    const entry = this.cache.get(hash);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(hash);
      return null;
    }
    return entry.data as T;
  }

  static setCached<T>(hash: string, data: T, ttlSeconds: number = 3600): void {
    this.cache.set(hash, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  static async verifyQuota(userId: string, operation: string): Promise<{ allowed: boolean; reason?: string }> {
    if (!this.isAiEnabled()) {
      return { allowed: false, reason: 'AI processing is currently disabled by administrator kill switch.' };
    }

    const limits = this.getLimits();
    const runs = await db.getGenerationRuns(userId);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentRuns = runs.filter(r => r.created_at >= oneDayAgo && !r.is_cached);

    if (recentRuns.length >= limits.dailyRequests) {
      return {
        allowed: false,
        reason: `Daily AI request limit reached (${recentRuns.length}/${limits.dailyRequests}). Try again tomorrow or use local Ollama.`,
      };
    }

    const opCount = recentRuns.filter(r => r.operation === operation).length;
    let maxAllowed = limits.dailyRequests;

    if (operation === 'resume_generation') maxAllowed = limits.maxResumeGenerations;
    else if (operation === 'job_analysis') maxAllowed = limits.maxJobAnalysis;
    else if (operation === 'bullet_rewrite') maxAllowed = limits.maxBulletRewrites;
    else if (operation === 'github_analysis') maxAllowed = limits.maxGitHubAnalysis;
    else if (operation === 'document_extraction') maxAllowed = limits.maxDocumentAnalysis;
    else if (operation === 'ats_analysis') maxAllowed = limits.maxATSAnalysis;

    if (opCount >= maxAllowed) {
      return {
        allowed: false,
        reason: `Daily limit reached for ${operation} (${opCount}/${maxAllowed}).`,
      };
    }

    return { allowed: true };
  }

  static async recordRun(params: {
    userId: string;
    operation: string;
    provider: string;
    model: string;
    inputTokens?: number;
    outputTokens?: number;
    latencyMs: number;
    isCached?: boolean;
    promptVersion?: string;
  }): Promise<void> {
    await db.logGenerationRun({
      user_id: params.userId,
      operation: params.operation,
      provider: params.provider,
      model: params.model,
      input_tokens: params.inputTokens || 0,
      output_tokens: params.outputTokens || 0,
      latency_ms: params.latencyMs,
      is_cached: params.isCached || false,
      prompt_version: params.promptVersion || 'v1',
    });
  }
}
