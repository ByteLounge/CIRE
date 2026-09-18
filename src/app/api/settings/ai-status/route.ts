import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';
import { CostTracker } from '@/lib/ai/cost-tracker';

export async function GET() {
  try {
    const limits = CostTracker.getLimits();
    const isAiEnabled = CostTracker.isAiEnabled();
    const runs = await db.getGenerationRuns(DEMO_USER_ID);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentRuns = runs.filter(r => r.created_at >= oneDayAgo);

    const usage = {
      dailyTotal: recentRuns.length,
      dailyLimit: limits.dailyRequests,
      resumeGenerations: recentRuns.filter(r => r.operation === 'resume_generation').length,
      maxResumeGenerations: limits.maxResumeGenerations,
      jobAnalyses: recentRuns.filter(r => r.operation === 'job_analysis').length,
      maxJobAnalyses: limits.maxJobAnalysis,
      githubAnalyses: recentRuns.filter(r => r.operation === 'github_analysis').length,
      maxGitHubAnalyses: limits.maxGitHubAnalysis,
      documentAnalyses: recentRuns.filter(r => r.operation === 'document_extraction').length,
      maxDocumentAnalyses: limits.maxDocumentAnalysis,
    };

    return NextResponse.json({
      success: true,
      isAiEnabled,
      limits,
      usage,
      recentRuns: recentRuns.slice(0, 15),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { aiEnabled } = body;
    if (typeof aiEnabled === 'boolean') {
      process.env.AI_ENABLED = aiEnabled ? 'true' : 'false';
    }
    return NextResponse.json({
      success: true,
      isAiEnabled: CostTracker.isAiEnabled(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
