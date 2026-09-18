'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Sparkles, CheckCircle2, AlertCircle, XCircle, ArrowRight, ExternalLink, Trash2 } from 'lucide-react';
import { Job, JobRequirement, JobMatch } from '@/lib/types/database';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [form, setForm] = useState({
    company: '',
    role: '',
    jobUrl: '',
    jobDescription: '',
  });

  const sampleJob = {
    company: 'Stripe',
    role: 'Software Engineer Intern — Core Infrastructure',
    jobUrl: 'https://stripe.com/jobs/swe-intern',
    jobDescription: `About the Role:
We are looking for a Software Engineer Intern to join our Core Infrastructure team. You will design, build, and scale reliable backend microservices and APIs handling millions of daily requests.

Requirements:
- Strong proficiency in Python, TypeScript, Go, or Java
- Solid understanding of REST APIs, relational databases (PostgreSQL or MySQL)
- Hands-on experience with containerization technologies like Docker
- Dedication to clean architecture, automated testing, and peer code reviews

Nice to have:
- Experience with Redis caching or distributed systems
- Experience with Kubernetes or AWS production deployments
- Familiarity with Next.js or React for internal developer tooling portals`,
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
        if (!selectedJob) {
          handleSelectJob(data.jobs[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSelectJob = async (job: Job) => {
    setSelectedJob(job);
    setIsMatching(true);
    try {
      // Run Match against Evidence Store
      const matchRes = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });
      const matchData = await matchRes.json();
      if (matchData.matches) {
        setMatches(matchData.matches);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  const handleAnalyzeNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setJobs(prev => [data.job, ...prev]);
        setSelectedJob(data.job);
        setRequirements(data.requirements);
        handleSelectJob(data.job);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' });
      const updated = jobs.filter(j => j.id !== id);
      setJobs(updated);
      if (selectedJob?.id === id) {
        setSelectedJob(updated[0] || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Description Analyzer & Evidence Matching</h1>
              <Badge variant="info" size="sm">Evidence Matrix</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Extract technical requirements and automatically map them to verified evidence in your career knowledge base.
            </p>
          </div>
        </div>

        {/* Input Form & Saved Jobs Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analyze New Job Form */}
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" />
                Analyze New Target Role
              </h2>
              <button
                type="button"
                onClick={() => setForm(sampleJob)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Load Sample Stripe Job
              </button>
            </div>

            <form onSubmit={handleAnalyzeNew} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Google, Datadog"
                    value={form.company}
                    onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer Intern"
                    value={form.role}
                    onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste the raw job description from LinkedIn, Greenhouse, or Lever..."
                  value={form.jobDescription}
                  onChange={(e) => setForm(f => ({ ...f, jobDescription: e.target.value }))}
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isAnalyzing} className="bg-indigo-600 text-white font-medium shadow-sm">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Analyze & Map Evidence
                </Button>
              </div>
            </form>
          </Card>

          {/* Saved Jobs List */}
          <Card className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
              Saved Target Roles ({jobs.length})
            </h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {jobs.map(j => (
                <div
                  key={j.id}
                  onClick={() => handleSelectJob(j)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                    selectedJob?.id === j.id
                      ? 'bg-indigo-50/60 border-indigo-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{j.role}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteJob(j.id); }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">{j.company}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Selected Job Evidence Mapping Matrix */}
        {selectedJob && (
          <Card className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedJob.role}</h2>
                  <Badge variant="default" size="sm">{selectedJob.company}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Evidence-to-Requirement alignment report. Missing requirements are flagged and never fabricated.
                </p>
              </div>

              <Link href={`/builder?jobId=${selectedJob.id}`}>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Generate Tailored Resume for this Job
                </Button>
              </Link>
            </div>

            {/* Evidence Match Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Requirement-to-Evidence Matrix
              </h3>

              {isMatching ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Aligning candidate knowledge base with job requirements...
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Click 'Analyze & Map Evidence' to generate the matching matrix.
                </div>
              ) : (
                matches.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      m.match_strength === 'STRONG'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : m.match_strength === 'PARTIAL'
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-rose-50/30 border-rose-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {m.match_strength === 'STRONG' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Supported by Evidence
                          </span>
                        )}
                        {m.match_strength === 'PARTIAL' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Partial / Inferred
                          </span>
                        )}
                        {m.match_strength === 'NONE' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-100 text-rose-800 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            No Evidence in Knowledge Base
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 font-semibold">{m.reason}</p>
                    </div>

                    {m.match_strength === 'NONE' && (
                      <span className="text-[11px] text-rose-700 italic shrink-0">
                        Will not be fabricated on resume
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
