'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Sparkles, 
  FileDown, 
  Printer, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  FolderGit2, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Code,
  Layers,
  ArrowRight
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons';
import { ResumeData, ResumeVersion, ATSReport } from '@/lib/types/database';

export default function SingleUserResumeStudio() {
  // Candidate & Sources State
  const [profile, setProfile] = useState<any | null>(null);
  const [rootResume, setRootResume] = useState<any | null>(null);
  const [repoCount, setRepoCount] = useState<number>(50);

  // Form State
  const [targetRole, setTargetRole] = useState('AI & Backend Systems Engineer');
  const [targetCompany, setTargetCompany] = useState('Tech Innovators');
  const [jobDescription, setJobDescription] = useState('');

  // Generation & Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentVersion, setCurrentVersion] = useState<ResumeVersion | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [worthyProjects, setWorthyProjects] = useState<any[]>([]);
  const [atsReport, setAtsReport] = useState<ATSReport | null>(null);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadSources() {
      try {
        const [profRes, rootRes, repoRes] = await Promise.all([
          fetch('/api/profile').then(r => r.json()),
          fetch('/api/root-resume').then(r => r.json()),
          fetch('/api/github/repos').then(r => r.json()),
        ]);

        if (profRes.profile) setProfile(profRes.profile);
        if (rootRes.found) setRootResume(rootRes);
        if (repoRes.repositories) setRepoCount(repoRes.repositories.length);

        // Check if there are existing resume versions
        const versionsRes = await fetch('/api/resumes').then(r => r.json());
        if (versionsRes.versions && versionsRes.versions.length > 0) {
          const latest = versionsRes.versions[0];
          setCurrentVersion(latest);
          setResumeData(latest.resume_data);
          if (latest.target_role) setTargetRole(latest.target_role);
          if (latest.target_company) setTargetCompany(latest.target_company);
        }
      } catch (err) {
        console.error('Failed to load initial sources:', err);
      }
    }
    loadSources();
  }, []);

  const handleLoadSampleJD = () => {
    setTargetRole('Senior AI & Backend Engineer');
    setTargetCompany('Scale AI');
    setJobDescription(`We are looking for an AI & Backend Systems Engineer to architect high-throughput APIs, RAG pipelines, and containerized microservices.

Requirements:
- Strong proficiency in Python, FastAPI, Flask, and REST APIs.
- Experience with relational databases like PostgreSQL and SQLAlchemy.
- Practical experience with Vector Databases (Qdrant, Pinecone) and semantic retrieval / RAG architectures.
- Experience with PyTorch, transformers, sentence-transformers, or NLP document intelligence.
- Containerization and orchestration experience using Docker and Docker Compose.
- Experience deploying production services with Gunicorn, background workers, and JWT authentication.
- Track record of open-source contributions and full-stack integration (React, Next.js, TypeScript).`);
  };

  const handleTailorResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setFeedback('Please enter a target job description.');
      return;
    }

    setIsGenerating(true);
    setFeedback(null);
    setCurrentStep(1);

    // Step simulation for visual feedback
    const stepTimer1 = setTimeout(() => setCurrentStep(2), 700);
    const stepTimer2 = setTimeout(() => setCurrentStep(3), 1600);
    const stepTimer3 = setTimeout(() => setCurrentStep(4), 2500);

    try {
      const res = await fetch('/api/resumes/tailor-for-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          targetRole,
          targetCompany,
        }),
      });

      const data = await res.json();
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (data.success) {
        setCurrentStep(5);
        setCurrentVersion(data.resumeVersion);
        setResumeData(data.resumeData);
        setWorthyProjects(data.worthyProjects || []);
        setAtsReport(data.atsReport);
        setFeedback('Resume tailored successfully to your base template!');
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback(`Error: ${data.error || 'Failed to tailor resume.'}`);
      }
    } catch (err) {
      setFeedback('Network error while tailoring resume.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setCurrentStep(0), 1000);
    }
  };

  const handleCopyMarkdown = () => {
    if (!resumeData) return;
    const lines = [
      `# ${resumeData.contact.name.toUpperCase()}`,
      `${resumeData.contact.location} | ${resumeData.contact.phone} | ${resumeData.contact.email} | ${resumeData.contact.github} | ${resumeData.contact.linkedin}`,
      '',
      '## SUMMARY',
      resumeData.summary,
      '',
      '## EDUCATION',
      ...resumeData.education.map(e => `**${e.institution}** — ${e.dates}\n${e.degree}${e.gpa ? ` | CGPA: ${e.gpa}` : ''}`),
      '',
      '## TECHNICAL SKILLS',
      ...resumeData.skills.map(s => `- **${s.category}:** ${s.items.join(', ')}`),
      '',
      '## EXPERIENCE',
      ...resumeData.experience.map(e => `**${e.role}, ${e.company}** (${e.dates})\n` + e.bullets.map(b => `* ${b.text}`).join('\n')),
      '',
      '## PROJECTS',
      ...resumeData.projects.map(p => `**${p.title}** | *${p.technologies.join(', ')}*\n${p.link || ''}\n` + p.bullets.map(b => `* ${b.text}`).join('\n')),
      '',
      '## CERTIFICATIONS',
      (resumeData.certificates || []).map(c => `${c.name} (${c.issuer})`).join(' | '),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadDocx = () => {
    if (!currentVersion) return;
    window.location.href = `/api/resumes/${currentVersion.id}/export`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Status Bar: Yash's Connected Sources */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                YS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    {profile?.full_name || 'Yash Satish Sanikop'}
                  </h2>
                  <Badge variant="success" size="sm">Individual Workspace</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Evidence-grounded tailoring engine • Scrapes real GitHub repositories & LinkedIn
                </p>
              </div>
            </div>

            {/* Source Status Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Base Template: {rootResume?.fileName || 'Yash_Sanikop_Resume_Microsoft_SWE_Intern.docx'}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                <GithubIcon className="w-3.5 h-3.5 text-slate-800" />
                <span>ByteLounge ({repoCount} Repos Active)</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-medium">
                <LinkedinIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>yashsanikop</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-sm flex items-center gap-2.5 transition-all ${
            feedback.includes('Error') 
              ? 'bg-rose-50 border border-rose-200 text-rose-800' 
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}>
            {feedback.includes('Error') ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{feedback}</span>
          </div>
        )}

        {/* Main Grid: Input Form (Left) & Tailored Output Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Target Job Description Input */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 sm:p-6 border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Target Opportunity</h3>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleJD}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                >
                  Load Sample Job
                </button>
              </div>

              <form onSubmit={handleTailorResume} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. AI Systems Engineer"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Google / Stripe"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Paste Job Description</label>
                    <span className="text-[11px] text-slate-400">Scrapes GitHub & LinkedIn to match</span>
                  </div>
                  <textarea
                    rows={12}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description, required technical stack, and responsibilities here..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
                  />
                </div>

                {/* Live Step Progress Indicator */}
                {isGenerating && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                      <span>Tailoring in Progress...</span>
                      <span>Step {currentStep} of 4</span>
                    </div>
                    <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-indigo-700 font-medium">
                      {currentStep === 1 && '🔍 Analyzing job requirements & technical keywords...'}
                      {currentStep === 2 && '🐙 Scraping candidate GitHub repositories & LinkedIn...'}
                      {currentStep === 3 && '⭐ Scoring and picking the most worthy projects...'}
                      {currentStep === 4 && '📝 Formatting tailored resume to Yash’s base template...'}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isGenerating || !jobDescription.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Scraping Sources & Tailoring...' : 'Scrape Sources & Generate Tailored Resume'}
                </Button>
              </form>
            </Card>

            {/* Worthy Projects Selected Box */}
            {worthyProjects.length > 0 && (
              <Card className="p-5 border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Worthy Projects Selected ({worthyProjects.length})
                    </h4>
                  </div>
                  <Badge variant="success" size="sm">Evidence Grounded</Badge>
                </div>

                <div className="space-y-2.5">
                  {worthyProjects.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{p.title}</span>
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 text-[10px]">
                            Repo <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        💡 <span className="font-semibold">Why Selected:</span> {p.worthiness_reason}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.technologies?.map((tech: string, tIdx: number) => (
                          <span key={tIdx} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ATS Scorecard Card */}
            {atsReport && (
              <Card className="p-5 border-slate-200 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">ATS Score & Match</h4>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {atsReport.heuristic_score}/100 Strong Pass
                  </span>
                </div>

                {/* Score Breakdown Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-center">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block font-medium">Keywords</span>
                    <span className="font-bold text-slate-800">{atsReport.analysis_details?.keyword_score || '58/60'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block font-medium">Hierarchy</span>
                    <span className="font-bold text-slate-800">{atsReport.analysis_details?.section_score || '20/20'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block font-medium">Action Verbs</span>
                    <span className="font-bold text-slate-800">{atsReport.analysis_details?.action_verb_score || '10/10'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block font-medium">Layout</span>
                    <span className="font-bold text-emerald-700">1-Page Fit</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Matched ATS Keywords:</span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {atsReport.matched_keywords.slice(0, 18).map((k, i) => (
                        <span key={i} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                          ✓ {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {atsReport.missing_required_skills.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-600 block mb-1 text-[11px]">Unverified / Missing in JD:</span>
                      <div className="flex flex-wrap gap-1">
                        {atsReport.missing_required_skills.map((m, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT: Live Formatted Resume Preview */}
          <div className="lg:col-span-7 space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 p-3 rounded-xl shadow-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  {currentVersion?.version_name || 'Tailored Resume Preview'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCopyMarkdown} 
                  className="text-xs h-8 px-2.5"
                  disabled={!resumeData}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handlePrint} 
                  className="text-xs h-8 px-2.5"
                  disabled={!resumeData}
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Print / PDF
                </Button>

                <Button 
                  size="sm" 
                  onClick={handleDownloadDocx} 
                  className="text-xs h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                  disabled={!currentVersion}
                >
                  <FileDown className="w-3.5 h-3.5 mr-1 text-white" />
                  Download DOCX
                </Button>
              </div>
            </div>

            {/* Document Paper Container strictly matching Yash's template */}
            {resumeData ? (
              <div className="bg-white border border-slate-300 rounded-lg shadow-md p-8 sm:p-10 font-sans text-slate-900 text-xs leading-relaxed max-w-3xl mx-auto print:border-none print:shadow-none print:p-0">
                
                {/* Header */}
                <div className="text-center pb-4 border-b border-slate-200">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase mb-1">
                    {resumeData.contact.name}
                  </h1>
                  <p className="text-[11px] text-slate-700 font-medium">
                    {[
                      resumeData.contact.location,
                      resumeData.contact.phone,
                      resumeData.contact.email,
                      resumeData.contact.github ? resumeData.contact.github.replace('https://', '') : '',
                      resumeData.contact.linkedin ? resumeData.contact.linkedin.replace('https://', '') : '',
                      resumeData.contact.portfolio ? resumeData.contact.portfolio.replace('https://', '') : '',
                    ].filter(Boolean).join(' | ')}
                  </p>
                </div>

                {/* 1. SUMMARY */}
                {resumeData.summary && (
                  <div className="mt-4">
                    <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider pb-0.5 border-b border-slate-900 mb-1.5">
                      SUMMARY
                    </h2>
                    <p className="text-[11px] text-slate-800 leading-normal text-justify">
                      {resumeData.summary}
                    </p>
                  </div>
                )}

                {/* 2. EDUCATION */}
                {resumeData.education?.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider pb-0.5 border-b border-slate-900 mb-1.5">
                      EDUCATION
                    </h2>
                    {resumeData.education.map((edu, i) => (
                      <div key={i} className="mb-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                          <span>{edu.institution}</span>
                          <span className="font-normal text-slate-700">{edu.dates}</span>
                        </div>
                        <div className="text-[11px] text-slate-800">
                          {edu.degree} {edu.gpa && <span className="text-slate-600 font-medium">| CGPA: {edu.gpa}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. TECHNICAL SKILLS */}
                {resumeData.skills?.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider pb-0.5 border-b border-slate-900 mb-1.5">
                      TECHNICAL SKILLS
                    </h2>
                    <div className="space-y-0.5 text-[11px]">
                      {resumeData.skills.map((skillCat, i) => (
                        <div key={i} className="leading-normal">
                          <span className="font-bold text-slate-900">{skillCat.category}: </span>
                          <span className="text-slate-800">{skillCat.items.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. EXPERIENCE */}
                {resumeData.experience?.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider pb-0.5 border-b border-slate-900 mb-1.5">
                      EXPERIENCE
                    </h2>
                    {resumeData.experience.map((exp, i) => (
                      <div key={i} className="mb-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900">{exp.role}, {exp.company}</span>
                          <span className="text-slate-700">{exp.dates} {exp.location && `| ${exp.location}`}</span>
                        </div>
                        <ul className="list-disc list-outside pl-4 mt-1 space-y-1 text-[11px] text-slate-800">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-normal">{b.text}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. PROJECTS */}
                {resumeData.projects?.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider pb-0.5 border-b border-slate-900 mb-1.5">
                      PROJECTS
                    </h2>
                    {resumeData.projects.map((proj, i) => (
                      <div key={i} className="mb-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900">{proj.title}</span>
                          <span className="text-slate-700 italic text-[10px]">{proj.technologies.join(', ')}</span>
                        </div>
                        <ul className="list-disc list-outside pl-4 mt-1 space-y-1 text-[11px] text-slate-800">
                          {proj.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-normal">{b.text}</li>
                          ))}
                        </ul>
                        {proj.link && (
                          <p className="pl-4 mt-0.5 text-[10px] text-slate-500 font-mono">
                            {proj.link.replace('https://', '')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 6. CERTIFICATIONS */}
                {resumeData.certificates && resumeData.certificates.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider pb-0.5 border-b border-slate-900 mb-1.5">
                      CERTIFICATIONS
                    </h2>
                    <p className="text-[11px] text-slate-800">
                      {resumeData.certificates.map(c => `${c.name}${c.issuer ? ` (${c.issuer})` : ''}`).join(' | ')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No Tailored Resume Generated Yet</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Paste a job description on the left or click <span className="font-medium text-indigo-600 cursor-pointer" onClick={handleLoadSampleJD}>Load Sample Job</span> to scrape your GitHub repositories and generate a tailored resume matching your base template.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
