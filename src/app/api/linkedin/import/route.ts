import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';
import { getAIProvider } from '@/lib/ai';
import { CostTracker } from '@/lib/ai/cost-tracker';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawContent, importType } = body;

    if (!rawContent || rawContent.trim() === '') {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    const quota = await CostTracker.verifyQuota(DEMO_USER_ID, 'document_extraction');
    if (!quota.allowed) {
      return NextResponse.json({ success: false, error: quota.reason }, { status: 429 });
    }

    const startTime = Date.now();
    const ai = getAIProvider();
    const extraction = await ai.extractLinkedInData(rawContent);
    const latency = Date.now() - startTime;

    await CostTracker.recordRun({
      userId: DEMO_USER_ID,
      operation: 'linkedin_extraction',
      provider: ai.name,
      model: 'default',
      latencyMs: latency,
    });

    // Save evidence extracted from post
    const addedEvidence = [];
    for (const insight of extraction.post_insights) {
      const item = await db.addEvidence(DEMO_USER_ID, {
        type: 'linkedin_post',
        title: 'LinkedIn Post Activity',
        claim: insight.claim,
        skills: insight.skills,
        source_type: 'linkedin',
        source_id: `li-${Date.now()}`,
        source_reference: `User LinkedIn Post: "${insight.post_snippet.slice(0, 75)}..."`,
        confidence: 0.9,
        verification_status: 'NEEDS_REVIEW',
      });
      addedEvidence.push(item);
    }

    return NextResponse.json({
      success: true,
      extraction,
      createdEvidence: addedEvidence,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
