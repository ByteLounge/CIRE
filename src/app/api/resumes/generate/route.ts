import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';
import { getAIProvider } from '@/lib/ai';
import { CostTracker } from '@/lib/ai/cost-tracker';
import { ResumeData, ResumeVersion, ATSReport } from '@/lib/types/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, templateId = 'minimal-professional', pageCount = 1 } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    // Verify Quota
    const quota = await CostTracker.verifyQuota(DEMO_USER_ID, 'resume_generation');
    if (!quota.allowed) {
      return NextResponse.json({ success: false, error: quota.reason }, { status: 429 });
    }

    const job = await db.getJobById(jobId, DEMO_USER_ID);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    const profile = await db.getProfile(DEMO_USER_ID);
    const requirements = await db.getJobRequirements(jobId);
    const evidence = await db.getEvidence(DEMO_USER_ID);
    const education = await db.getEducation(DEMO_USER_ID);
    const certificates = await db.getCertificates(DEMO_USER_ID);

    const startTime = Date.now();
    const ai = getAIProvider();

    // 1. One Structured Generation Request (Section 30: Cost Control)
    const generated = await ai.generateResume(
      job.job_description,
      requirements,
      profile,
      evidence,
      pageCount
    );

    // 2. Fact Check / Validate Bullets Against Evidence
    const validatedExperience = await Promise.all(
      generated.tailored_experience.map(async (exp) => {
        const validatedBullets = await Promise.all(
          exp.bullets.map(async (b) => {
            const validation = await ai.validateBullet(b.text, evidence);
            return {
              text: b.text,
              evidence_ids: b.evidence_ids || validation.claim_evidence_ids,
              has_warning: !validation.is_supported,
              warning_text: validation.warning_message,
            };
          })
        );
        return { ...exp, bullets: validatedBullets };
      })
    );

    const validatedProjects = await Promise.all(
      generated.tailored_projects.map(async (proj) => {
        const validatedBullets = await Promise.all(
          proj.bullets.map(async (b) => {
            const validation = await ai.validateBullet(b.text, evidence);
            return {
              text: b.text,
              evidence_ids: b.evidence_ids || validation.claim_evidence_ids,
              has_warning: !validation.is_supported,
              warning_text: validation.warning_message,
            };
          })
        );
        return { ...proj, bullets: validatedBullets };
      })
    );

    const resumeData: ResumeData = {
      contact: {
        name: profile.full_name,
        email: profile.email || 'alex.morgan.dev@example.com',
        phone: profile.phone || '+1 (555) 019-2834',
        location: profile.location || 'San Francisco, CA',
        linkedin: profile.linkedin_url || undefined,
        github: profile.github_url || undefined,
        portfolio: profile.portfolio_url || undefined,
      },
      summary: generated.summary,
      skills: generated.selected_skills,
      experience: validatedExperience,
      projects: validatedProjects,
      education: education.map(e => ({
        institution: e.institution,
        degree: `${e.degree} in ${e.field_of_study}`,
        dates: `${e.start_date.slice(0, 4)} – ${e.end_date ? e.end_date.slice(0, 4) : 'Present'}`,
        gpa: e.gpa || undefined,
        coursework: e.coursework,
      })),
      certificates: certificates.map(c => ({
        name: c.name,
        issuer: c.issuer,
        date: c.issue_date.slice(0, 7),
      })),
    };

    // 3. ATS Analysis (Deterministic first + qualitative)
    const atsResult = await ai.analyzeATS(job.job_description, resumeData);

    // 4. Save Version
    const savedVersion = await db.saveResumeVersion(DEMO_USER_ID, {
      job_id: job.id,
      version_name: `${job.role} — ${job.company}`,
      target_role: job.role,
      target_company: job.company,
      template_id: templateId,
      page_count: pageCount,
      resume_data: resumeData,
    });

    // 5. Save ATS Report
    const atsReport: ATSReport = {
      id: `ats-${Date.now()}`,
      resume_version_id: savedVersion.id,
      job_id: job.id,
      heuristic_score: atsResult.heuristic_score,
      matched_keywords: atsResult.matched_keywords,
      missing_required_skills: atsResult.missing_required_skills,
      formatting_issues: atsResult.formatting_issues,
      bullet_length_issues: atsResult.bullet_length_issues,
      unsupported_claims: atsResult.unsupported_claims,
      analysis_details: {},
      created_at: new Date().toISOString(),
    };
    await db.saveATSReport(atsReport);

    const latency = Date.now() - startTime;
    await CostTracker.recordRun({
      userId: DEMO_USER_ID,
      operation: 'resume_generation',
      provider: ai.name,
      model: 'default',
      latencyMs: latency,
    });

    return NextResponse.json({
      success: true,
      resumeVersion: savedVersion,
      changesSummary: generated.changes_summary,
      atsReport,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
