// CIRE Automated Verification Test Suite
// Career Intelligence & Resume Engine

import { db } from '../src/lib/store/db-adapter';
import { getAIProvider } from '../src/lib/ai/index';
import { CostTracker } from '../src/lib/ai/cost-tracker';
import { DEMO_USER_ID } from '../src/lib/store/seed-data';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n=============================================================');
  console.log('  RUNNING CAREER INTELLIGENCE & RESUME ENGINE TEST SUITE');
  console.log('=============================================================\n');

  // Test 1: Profile CRUD
  console.log('[Test Suite 1: Master Profile CRUD]');
  const initialProfile = await db.getProfile(DEMO_USER_ID);
  assert(initialProfile.full_name === 'Alex Morgan', 'Master profile loads with default candidate Alex Morgan');
  const updatedProfile = await db.updateProfile(DEMO_USER_ID, { headline: 'Staff Systems Engineer' });
  assert(updatedProfile.headline === 'Staff Systems Engineer', 'Master profile updates headline successfully');

  // Test 2: Projects & Auto-Evidence Creation
  console.log('\n[Test Suite 2: Projects & Traceable Evidence Registration]');
  const projectsBefore = await db.getProjects(DEMO_USER_ID);
  assert(projectsBefore.length >= 3, 'Initial demo projects are present (TaskFlow, Inventory API, RAG Assistant)');
  const newProj = await db.addProject(DEMO_USER_ID, {
    title: 'Distributed Cache Service',
    description: 'High performance memory cache built in Go',
    role: 'Systems Architect',
    technologies: ['Go', 'Redis'],
    highlights: ['Sub-millisecond read latency'],
    verified: true,
  });
  assert(newProj.title === 'Distributed Cache Service', 'Project added successfully');
  const evidence = await db.getEvidence(DEMO_USER_ID);
  const autoEvidence = evidence.find(e => e.source_id === newProj.id);
  assert(autoEvidence !== undefined, 'Project addition automatically registered traceable Career Evidence item');

  // Test 3: AI Provider & Cost Safety Kill Switch
  console.log('\n[Test Suite 3: Cost Safety & AI Guardrails]');
  const ai = getAIProvider();
  assert(ai !== null, 'AI provider initialized');
  assert(CostTracker.isAiEnabled() === true, 'AI enabled by default');
  const quotaCheck = await CostTracker.verifyQuota(DEMO_USER_ID, 'job_analysis');
  assert(quotaCheck.allowed === true, 'User is within daily quota limit');

  // Test 4: Job Description Analysis & Classification
  console.log('\n[Test Suite 4: Job Description Analysis & Requirements Classification]');
  const sampleJobText = `We are looking for a Backend Engineer.
Requirements:
- Strong proficiency in Python and PostgreSQL
- Experience building REST APIs with Docker containerization
Nice to have:
- Experience with Redis and Kubernetes`;

  const jobAnalysis = await ai.analyzeJob(sampleJobText, 'TestCorp', 'Backend Engineer');
  assert(jobAnalysis.required_skills.length > 0, 'Extracted required skills from job description');
  assert(jobAnalysis.required_skills.includes('Python') || jobAnalysis.required_skills.includes('PostgreSQL'), 'Detected core requirement skills (Python/PostgreSQL)');

  // Test 5: Evidence Matching Engine (Supported vs Missing)
  console.log('\n[Test Suite 5: Requirement-to-Evidence Matching Engine]');
  const matchPython = await ai.matchEvidence('Python', evidence);
  assert(matchPython.match_strength === 'STRONG', 'Found strong verified evidence for required skill Python');
  
  const matchK8s = await ai.matchEvidence('Kubernetes', evidence);
  assert(matchK8s.match_strength === 'NONE', 'Correctly reported NO EVIDENCE for Kubernetes (does not fabricate)');

  // Test 6: NON-NEGOTIABLE FACT CHECK & CLAIM VALIDATION
  console.log('\n[Test Suite 6: Claim Validation Engine — Anti-Fabrication Guarantees]');
  
  // Case A: Unverified metric (40% improvement)
  const metricClaim = 'Engineered payment retry mechanism that reduced failed API calls by 40%.';
  const valMetric = await ai.validateBullet(metricClaim, evidence);
  assert(valMetric.is_supported === false, 'Blocked bullet with unsupported metric ("40%")');
  assert(valMetric.unsupported_metrics.includes('40%'), 'Identified specific unsupported metric: 40%');

  // Case B: Unverified technology (Kubernetes and AWS)
  const techClaim = 'Deployed microservices across AWS and Kubernetes production clusters.';
  const valTech = await ai.validateBullet(techClaim, evidence);
  assert(valTech.is_supported === false, 'Blocked bullet with unverified technologies');
  assert(valTech.unsupported_technologies.includes('Kubernetes') || valTech.unsupported_technologies.includes('AWS'), 'Flagged unverified tech (Kubernetes/AWS)');

  // Case C: Valid, fully verified claim
  const validClaim = 'Engineered scalable microservices using Python and FastAPI with PostgreSQL relational schemas.';
  const valValid = await ai.validateBullet(validClaim, evidence);
  assert(valValid.is_supported === true, 'Approved truthful claim backed by verified evidence');

  // Test 7: Deterministic ATS Analysis
  console.log('\n[Test Suite 7: Deterministic ATS Heuristic Analysis]');
  const sampleResumeData = {
    contact: {
      name: 'Alex Morgan',
      email: 'alex.morgan.dev@example.com',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
    },
    summary: 'Software Engineer with Python, PostgreSQL, and Docker experience.',
    skills: [{ category: 'Languages', items: ['Python', 'TypeScript', 'SQL'] }],
    experience: [
      {
        company: 'Apex Cloud Solutions',
        role: 'Software Engineering Intern',
        dates: 'June 2025 – September 2025',
        bullets: [
          {
            text: 'Engineered microservices using Python and FastAPI with PostgreSQL schemas.',
            evidence_ids: ['ev-1'],
          }
        ]
      }
    ],
    projects: [],
    education: [],
  };

  const atsReport = await ai.analyzeATS(sampleJobText, sampleResumeData);
  assert(atsReport.heuristic_score > 50, `Calculated heuristic ATS score: ${atsReport.heuristic_score}/100`);
  assert(atsReport.matched_keywords.length > 0, 'Identified matched keywords in resume');

  // Test 8: Resume Version Snapshot Isolation (Section 32)
  console.log('\n[Test Suite 8: Resume Versioning & Master Profile Isolation]');
  const newVersion = await db.saveResumeVersion(DEMO_USER_ID, {
    version_name: 'Backend Engineer — TestCorp',
    target_role: 'Backend Engineer',
    target_company: 'TestCorp',
    template_id: 'minimal-professional',
    page_count: 1,
    resume_data: sampleResumeData,
  });
  assert(newVersion.id !== undefined, 'Created separate resume version snapshot');
  const masterProfileAfter = await db.getProfile(DEMO_USER_ID);
  assert(masterProfileAfter.full_name === 'Alex Morgan', 'Master profile remains untouched and canonical');

  console.log('\n=============================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
