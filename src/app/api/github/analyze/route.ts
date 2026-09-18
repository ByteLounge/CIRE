import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';
import { getAIProvider } from '@/lib/ai';
import { CostTracker } from '@/lib/ai/cost-tracker';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoId } = body;

    // Check Quota
    const quota = await CostTracker.verifyQuota(DEMO_USER_ID, 'github_analysis');
    if (!quota.allowed) {
      return NextResponse.json({ success: false, error: quota.reason }, { status: 429 });
    }

    const repos = await db.getRepositories(DEMO_USER_ID);
    const repo = repos.find(r => r.id === repoId);
    if (!repo) {
      return NextResponse.json({ success: false, error: 'Repository not found' }, { status: 404 });
    }

    const startTime = Date.now();
    const ai = getAIProvider();

    // Mock manifests / README representation for analysis
    const sampleManifest = repo.primary_language === 'Python' 
      ? 'fastapi==0.110.0\npsycopg2-binary==2.9.9\npydantic==2.6.4\nuvicorn==0.28.0\nalembic==1.13.1'
      : '{"dependencies": {"react": "^19.0.0", "next": "^15.0.0", "tailwindcss": "^4.0.0"}}';
    
    const sampleReadme = `# ${repo.repo_name}\n${repo.description || 'Production system'}\n\n## Features\n- REST API design with PostgreSQL persistence\n- Dockerized orchestration and CI testing`;

    const result = await ai.analyzeGitHubRepo(repo.repo_name, sampleReadme, sampleManifest);
    const latency = Date.now() - startTime;

    // Log Run
    await CostTracker.recordRun({
      userId: DEMO_USER_ID,
      operation: 'github_analysis',
      provider: ai.name,
      model: 'default',
      latencyMs: latency,
    });

    // Update Repository
    await db.updateRepository(DEMO_USER_ID, repo.id, {
      detected_skills: result.detected_skills,
      demonstrated_features: result.demonstrated_features,
      last_analyzed_at: new Date().toISOString(),
    });

    // Create Explicit Evidence
    for (const explicitClaim of result.explicit_claims) {
      await db.addEvidence(DEMO_USER_ID, {
        type: 'github_code',
        title: `${repo.repo_name} [Explicit Dependency]`,
        claim: explicitClaim,
        skills: result.detected_skills,
        source_type: 'github',
        source_id: repo.id,
        source_reference: `${repo.repo_full_name} (Manifest)`,
        confidence: 1.0,
        verification_status: 'VERIFIED',
      });
    }

    // Create Inferred Evidence (Needs Verification)
    for (const inferredClaim of result.inferred_claims) {
      await db.addEvidence(DEMO_USER_ID, {
        type: 'github_readme',
        title: `${repo.repo_name} [Inferred Feature]`,
        claim: inferredClaim,
        skills: result.detected_skills,
        source_type: 'github',
        source_id: repo.id,
        source_reference: `${repo.repo_full_name} (Inferred from codebase layout)`,
        confidence: 0.85,
        verification_status: 'AI_INFERRED',
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
