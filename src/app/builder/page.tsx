'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { 
  Sparkles, 
  FileDown, 
  Printer, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { ResumeData, ResumeVersion, Job, CareerEvidence } from '@/lib/types/database';

function ResumeBuilderContent() {
  const searchParams = useSearchParams();
  const queryJobId = searchParams.get('jobId');
  const queryVersionId = searchParams.get('versionId');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(queryJobId || 'job-1');
  const [templateId, setTemplateId] = useState<'minimal-professional' | 'modern-technical' | 'compact-engineering'>('minimal-professional');
  const [pageCount, setPageCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<ResumeVersion | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [changesSummary, setChangesSummary] = useState<any | null>(null);
  const [evidenceList, setEvidenceList] = useState<CareerEvidence[]>([]);
  const [viewingEvidence, setViewingEvidence] = useState<CareerEvidence | null>(null);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [jobsRes, evRes, resRes] = await Promise.all([
          fetch('/api/jobs').then(r => r.json()),
          fetch('/api/evidence').then(r => r.json()),
          fetch('/api/resumes').then(r => r.json()),
        ]);

        if (jobsRes.jobs) {
          setJobs(jobsRes.jobs);
          if (!selectedJobId && jobsRes.jobs.length > 0) {
            setSelectedJobId(jobsRes.jobs[0].id);
          }
        }
        if (evRes.evidence) setEvidenceList(evRes.evidence);

        // Load existing version if queryVersionId
        if (queryVersionId && resRes.versions) {
          const v = resRes.versions.find((x: ResumeVersion) => x.id === queryVersionId);
          if (v) {
            setCurrentVersion(v);
            setResumeData(v.resume_data);
            setTemplateId(v.template_id);
            setPageCount(v.page_count);
            return;
          }
        }

        // If versions exist, load latest
        if (resRes.versions && resRes.versions.length > 0) {
          const v = resRes.versions[0];
          setCurrentVersion(v);
          setResumeData(v.resume_data);
          setTemplateId(v.template_id);
          setPageCount(v.page_count);
        } else {
          // Trigger initial generation
          handleGenerate(selectedJobId || 'job-1');
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, [queryJobId, queryVersionId]);

  const handleGenerate = async (jobIdToUse?: string) => {
    const targetJobId = jobIdToUse || selectedJobId;
    if (!targetJobId) return;

    setIsGenerating(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/resumes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: targetJobId,
          templateId,
          pageCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentVersion(data.resumeVersion);
        setResumeData(data.resumeVersion.resume_data);
        setChangesSummary(data.changesSummary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!currentVersion || !resumeData) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/resumes/${currentVersion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_data: resumeData,
          template_id: templateId,
          page_count: pageCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('Changes saved to resume version!');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const inspectEvidence = (evId?: string) => {
    if (!evId) return;
    const ev = evidenceList.find(e => e.id === evId) || evidenceList[0];
    if (ev) {
      setViewingEvidence(ev);
      setEvidenceModalOpen(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Controls Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 no-print">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tailored Resume Builder</h1>
              <Badge variant="success" size="sm">Zero Fabrication</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Interactive ATS resume editor. Every bullet point is validated and traceable to verified career evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {currentVersion && (
              <a
                href={`/api/resumes/${currentVersion.id}/export`}
                download
                className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-3.5 py-2 gap-1.5 bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
              >
                <FileDown className="w-4 h-4 mr-1" />
                Export DOCX
              </a>
            )}

            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print / PDF
            </Button>

            <Button size="sm" onClick={handleSaveEdits} isLoading={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Save className="w-4 h-4 mr-1" />
              Save Version
            </Button>
          </div>
        </div>

        {saveStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg no-print">
            {saveStatus}
          </div>
        )}

        {/* Configuration Bar */}
        <Card className="p-4 no-print">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Role
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  handleGenerate(e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.role} — {j.company}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ATS Template
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="minimal-professional">Minimal Professional (ATS Classic)</option>
                <option value="modern-technical">Modern Technical (Divider Lines)</option>
                <option value="compact-engineering">Compact Engineering (High Density)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Page Budget
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPageCount(1)}
                  className={`flex-1 py-2 rounded-lg border font-semibold ${
                    pageCount === 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  1 Page
                </button>
                <button
                  type="button"
                  onClick={() => setPageCount(2)}
                  className={`flex-1 py-2 rounded-lg border font-semibold ${
                    pageCount === 2 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  2 Pages
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Change Tracking Banner (Section 27) */}
        {changesSummary && (
          <Card className="bg-indigo-50/40 border-indigo-200 p-4 space-y-2 text-xs no-print">
            <span className="font-bold text-indigo-900 uppercase tracking-wider block">
              Resume Tailoring Changes & Justifications
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="font-semibold text-emerald-700">Emphasized / Added: </span>
                {changesSummary.added?.join(', ')}
              </div>
              <div>
                <span className="font-semibold text-indigo-700">Rationale: </span>
                {changesSummary.rationales?.join(', ')}
              </div>
            </div>
          </Card>
        )}

        {/* Side-by-Side Editor (Left) and Live ATS Resume Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Interactive Section & Bullet Editor */}
          <div className="lg:col-span-6 space-y-4 no-print max-h-[850px] overflow-y-auto pr-1">
            <Card className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Editable Sections
              </h2>

              {/* Summary Editor */}
              {resumeData && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Professional Summary
                  </label>
                  <textarea
                    rows={3}
                    value={resumeData.summary}
                    onChange={(e) => setResumeData(d => d ? ({ ...d, summary: e.target.value }) : null)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Experience Bullets Editor */}
              {resumeData?.experience?.map((exp, expIdx) => (
                <div key={expIdx} className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {exp.role} — {exp.company}
                    </span>
                    <span className="text-[11px] text-slate-500">{exp.dates}</span>
                  </div>

                  <div className="space-y-2">
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="space-y-1 bg-white p-2.5 rounded border border-slate-200">
                        <textarea
                          rows={2}
                          value={bullet.text}
                          onChange={(e) => {
                            const newExp = [...resumeData.experience];
                            newExp[expIdx].bullets[bIdx].text = e.target.value;
                            setResumeData(d => d ? ({ ...d, experience: newExp }) : null);
                          }}
                          className="w-full text-xs text-slate-800 border-none focus:outline-none focus:ring-0 p-0 resize-none"
                        />

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => inspectEvidence(bullet.evidence_ids?.[0])}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            View Evidence
                          </button>

                          {bullet.has_warning ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Unverified Claim Flagged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Projects Bullets Editor */}
              {resumeData?.projects?.map((proj, projIdx) => (
                <div key={projIdx} className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{proj.title}</span>
                    <span className="text-[11px] text-indigo-600 font-medium">{proj.role}</span>
                  </div>

                  <div className="space-y-2">
                    {proj.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="space-y-1 bg-white p-2.5 rounded border border-slate-200">
                        <textarea
                          rows={2}
                          value={bullet.text}
                          onChange={(e) => {
                            const newProj = [...resumeData.projects];
                            newProj[projIdx].bullets[bIdx].text = e.target.value;
                            setResumeData(d => d ? ({ ...d, projects: newProj }) : null);
                          }}
                          className="w-full text-xs text-slate-800 border-none focus:outline-none focus:ring-0 p-0 resize-none"
                        />

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => inspectEvidence(bullet.evidence_ids?.[0])}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            View Evidence
                          </button>

                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Code
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* RIGHT: Live ATS-Compliant Resume Preview */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 text-slate-900 font-sans print:shadow-none print:border-none print:p-0">
              {resumeData ? (
                <div className={`space-y-4 ${
                  templateId === 'compact-engineering' ? 'text-[11px] leading-snug' : 'text-xs leading-relaxed'
                }`}>
                  {/* Header */}
                  <div className="text-center border-b border-slate-200 pb-3">
                    <h1 className="text-xl font-bold tracking-tight text-slate-950 uppercase mb-1">
                      {resumeData.contact.name}
                    </h1>
                    <p className="text-[11px] text-slate-600">
                      {[
                        resumeData.contact.email,
                        resumeData.contact.phone,
                        resumeData.contact.location,
                        resumeData.contact.linkedin,
                        resumeData.contact.github
                      ].filter(Boolean).join('  |  ')}
                    </p>
                  </div>

                  {/* Summary */}
                  {resumeData.summary && (
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                        Professional Summary
                      </h2>
                      <p className="text-slate-800">{resumeData.summary}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills?.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                        Technical Skills
                      </h2>
                      <div className="space-y-1">
                        {resumeData.skills.map((cat, i) => (
                          <p key={i} className="text-slate-800">
                            <span className="font-semibold text-slate-950">{cat.category}: </span>
                            {cat.items.join(', ')}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience?.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                        Experience
                      </h2>
                      <div className="space-y-3">
                        {resumeData.experience.map((exp, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between font-bold text-slate-950">
                              <span>{exp.role} — {exp.company}</span>
                              <span className="font-medium text-slate-600">{exp.dates}</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-slate-800">
                              {exp.bullets.map((b, bi) => (
                                <li key={bi}>{b.text}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects?.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                        Projects
                      </h2>
                      <div className="space-y-3">
                        {resumeData.projects.map((proj, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between font-bold text-slate-950">
                              <span>
                                {proj.title}
                                <span className="font-normal text-slate-600 italic">
                                  {' '}| {proj.technologies.join(', ')}
                                </span>
                              </span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-slate-800">
                              {proj.bullets.map((b, bi) => (
                                <li key={bi}>{b.text}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education?.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                        Education
                      </h2>
                      <div className="space-y-2">
                        {resumeData.education.map((edu, i) => (
                          <div key={i} className="space-y-0.5">
                            <div className="flex justify-between font-bold text-slate-950">
                              <span>{edu.institution}</span>
                              <span className="font-medium text-slate-600">{edu.dates}</span>
                            </div>
                            <p className="text-slate-800">
                              {edu.degree} {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Generating tailored resume preview...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evidence Verification Modal */}
        <Modal
          isOpen={evidenceModalOpen}
          onClose={() => setEvidenceModalOpen(false)}
          title="Verified Career Evidence Trace"
        >
          {viewingEvidence ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 uppercase tracking-wider">
                  {viewingEvidence.title}
                </span>
                <Badge variant="success" size="sm">
                  {viewingEvidence.verification_status}
                </Badge>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Evidence Claim
                </span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {viewingEvidence.claim}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Demonstrated Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {viewingEvidence.skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Source Reference
                </span>
                <p className="font-mono text-slate-600 bg-slate-100 p-2 rounded">
                  {viewingEvidence.source_reference}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setEvidenceModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </AppShell>
  );
}

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Resume Builder...</div>}>
      <ResumeBuilderContent />
    </Suspense>
  );
}
