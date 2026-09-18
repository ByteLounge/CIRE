import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';
import { getAIProvider } from '@/lib/ai';
import { CostTracker } from '@/lib/ai/cost-tracker';
import { JobRequirement } from '@/lib/types/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, role, jobDescription, jobUrl } = body;

    if (!company || !role || !jobDescription) {
      return NextResponse.json({ success: false, error: 'Company, role, and job description are required.' }, { status: 400 });
    }

    const descriptionHash = CostTracker.generateHash(jobDescription);

    // Check if duplicate job analysis exists in cache
    const cachedAnalysis = CostTracker.getCached<{ job: any; requirements: JobRequirement[] }>(descriptionHash);
    if (cachedAnalysis) {
      return NextResponse.json({
        success: true,
        isCached: true,
        job: cachedAnalysis.job,
        requirements: cachedAnalysis.requirements,
      });
    }

    // Check Quotas
    const quota = await CostTracker.verifyQuota(DEMO_USER_ID, 'job_analysis');
    if (!quota.allowed) {
      return NextResponse.json({ success: false, error: quota.reason }, { status: 429 });
    }

    const startTime = Date.now();
    const ai = getAIProvider();
    const analysis = await ai.analyzeJob(jobDescription, company, role);
    const latency = Date.now() - startTime;

    // Save Job record
    const job = await db.saveJob(DEMO_USER_ID, {
      company,
      role,
      job_url: jobUrl || null,
      job_description: jobDescription,
      description_hash: descriptionHash,
      status: 'Analyzed',
      deadline: null,
    });

    // Create Structured Requirements
    const requirements: JobRequirement[] = [];

    analysis.required_skills.forEach((skill, i) => {
      requirements.push({
        id: `req-req-${Date.now()}-${i}`,
        job_id: job.id,
        user_id: DEMO_USER_ID,
        requirement: `Required Skill: ${skill}`,
        category: 'REQUIRED',
        keywords: [skill],
        weight: 1.0,
        created_at: new Date().toISOString(),
      });
    });

    analysis.preferred_skills.forEach((skill, i) => {
      requirements.push({
        id: `req-pref-${Date.now()}-${i}`,
        job_id: job.id,
        user_id: DEMO_USER_ID,
        requirement: `Preferred Skill: ${skill}`,
        category: 'PREFERRED',
        keywords: [skill],
        weight: 0.7,
        created_at: new Date().toISOString(),
      });
    });

    analysis.responsibilities.forEach((resp, i) => {
      requirements.push({
        id: `req-resp-${Date.now()}-${i}`,
        job_id: job.id,
        user_id: DEMO_USER_ID,
        requirement: resp,
        category: 'RESPONSIBILITY',
        keywords: [],
        weight: 0.8,
        created_at: new Date().toISOString(),
      });
    });

    await db.saveJobRequirements(job.id, requirements);

    // Record Generation Run
    await CostTracker.recordRun({
      userId: DEMO_USER_ID,
      operation: 'job_analysis',
      provider: ai.name,
      model: 'default',
      latencyMs: latency,
    });

    // Cache the result
    CostTracker.setCached(descriptionHash, { job, requirements }, 86400);

    return NextResponse.json({
      success: true,
      job,
      requirements,
      analysis,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
