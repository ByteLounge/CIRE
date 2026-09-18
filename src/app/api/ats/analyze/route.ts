import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';
import { getAIProvider } from '@/lib/ai';
import { CostTracker } from '@/lib/ai/cost-tracker';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobDescription, resumeData } = body;

    if (!jobDescription || !resumeData) {
      return NextResponse.json({ success: false, error: 'Job description and resume data are required' }, { status: 400 });
    }

    const ai = getAIProvider();
    const evidence = await db.getEvidence(DEMO_USER_ID);

    // 1. Run ATS Analysis
    const atsResult = await ai.analyzeATS(jobDescription, resumeData);

    // 2. Fact Check all bullets in experience & projects against evidence
    const bulletWarnings: { bullet: string; warning: string }[] = [];

    for (const exp of resumeData.experience || []) {
      for (const b of exp.bullets || []) {
        const val = await ai.validateBullet(b.text, evidence);
        if (!val.is_supported && val.warning_message) {
          bulletWarnings.push({ bullet: b.text, warning: val.warning_message });
        }
      }
    }

    for (const proj of resumeData.projects || []) {
      for (const b of proj.bullets || []) {
        const val = await ai.validateBullet(b.text, evidence);
        if (!val.is_supported && val.warning_message) {
          bulletWarnings.push({ bullet: b.text, warning: val.warning_message });
        }
      }
    }

    return NextResponse.json({
      success: true,
      atsReport: {
        ...atsResult,
        unsupported_claims: bulletWarnings.map(w => w.warning),
      },
      bulletWarnings,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
