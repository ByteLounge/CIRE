import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';
import { getAIProvider } from '@/lib/ai';
import { JobMatch } from '@/lib/types/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    const requirements = await db.getJobRequirements(jobId);
    const evidenceItems = await db.getEvidence(DEMO_USER_ID);

    const ai = getAIProvider();
    const matches: JobMatch[] = [];

    for (const req of requirements) {
      const matchRes = await ai.matchEvidence(req.requirement, evidenceItems);
      matches.push({
        id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        job_id: jobId,
        requirement_id: req.id,
        evidence_id: matchRes.matched_evidence_id || null,
        match_strength: matchRes.match_strength,
        reason: matchRes.reason,
        created_at: new Date().toISOString(),
      });
    }

    await db.saveJobMatches(jobId, matches);

    return NextResponse.json({
      success: true,
      matches,
      totalRequirements: requirements.length,
      strongMatches: matches.filter(m => m.match_strength === 'STRONG').length,
      partialMatches: matches.filter(m => m.match_strength === 'PARTIAL').length,
      missingEvidence: matches.filter(m => m.match_strength === 'NONE').length,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
