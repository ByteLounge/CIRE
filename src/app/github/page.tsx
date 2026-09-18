'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Play, CheckCircle2, AlertCircle, RefreshCw, Code, ShieldCheck, Check, ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/ui/Icons';
import { GitHubRepository } from '@/lib/types/database';

export default function GitHubEvidencePage() {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisOutput, setAnalysisOutput] = useState<Record<string, unknown> | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRepos = async () => {
    try {
      const res = await fetch('/api/github/repos');
      const data = await res.json();
      if (data.repositories) setRepos(data.repositories);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleToggleSelect = async (repo: GitHubRepository) => {
    try {
      await fetch('/api/github/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId: repo.id, selected: !repo.selected_for_analysis }),
      });
      fetchRepos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async (repo: GitHubRepository) => {
    setAnalyzingId(repo.id);
    setFeedback(null);
    setAnalysisOutput(null);
    try {
      const res = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId: repo.id }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisOutput(data.result);
        setFeedback(`Analysis completed for ${repo.repo_name}! Evidence items registered.`);
        fetchRepos();
      } else {
        setFeedback(`Error: ${data.error}`);
      }
    } catch (err) {
      setFeedback('Failed to analyze repository.');
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">GitHub Repository Evidence</h1>
              <Badge variant="info" size="sm">Manifest & AST Analysis</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Intelligent codebase analysis prioritizing README, package.json, Dockerfile, and dependency manifests.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              Connected: <span className="font-semibold text-slate-800">alexmorgan-dev</span>
            </span>
            <Button size="sm" variant="outline" onClick={fetchRepos}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>

        {feedback && (
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm flex items-center gap-2">
            <Check className="w-4 h-4 text-indigo-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Repositories List */}
        <div className="space-y-4">
          {repos.map(repo => {
            const isAnalyzing = analyzingId === repo.id;

            return (
              <Card key={repo.id} className="hover:border-slate-300 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <input
                        type="checkbox"
                        checked={repo.selected_for_analysis}
                        onChange={() => handleToggleSelect(repo)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        title="Select for analysis"
                      />
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <GithubIcon className="w-4 h-4 text-slate-700" />
                        {repo.repo_name}
                      </h3>
                      {repo.primary_language && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {repo.primary_language}
                        </span>
                      )}
                      {repo.last_analyzed_at && (
                        <Badge variant="success" size="sm">Analyzed</Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mb-3">{repo.description || 'No description provided'}</p>

                    {/* Detected Skills */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                        Detected:
                      </span>
                      {repo.detected_skills.map((skill, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Demonstrated Features */}
                    {repo.demonstrated_features && repo.demonstrated_features.length > 0 && (
                      <div className="text-xs text-slate-500 space-y-0.5">
                        {repo.demonstrated_features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Code
                    </a>
                    <Button
                      size="sm"
                      isLoading={isAnalyzing}
                      onClick={() => handleAnalyze(repo)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-medium"
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      {repo.last_analyzed_at ? 'Re-analyze' : 'Analyze Repo'}
                    </Button>
                  </div>
                </div>

                {/* Analysis Detail Drawer/Banner if just analyzed */}
                {analysisOutput && (analysisOutput as any).repo_name === repo.repo_name && (
                  <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/80 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Evidence Extraction Breakdown
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Career Knowledge Base
                      </span>
                    </div>

                    {/* Explicit vs Inferred Comparison (Section 10) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded border border-emerald-200">
                        <span className="font-bold text-emerald-800 block mb-1">
                          EXPLICIT FACTS (Manifest & Dependencies)
                        </span>
                        <ul className="space-y-1 text-slate-600">
                          {((analysisOutput as any).explicit_claims || []).map((claim: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>{claim}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-white rounded border border-amber-200">
                        <span className="font-bold text-amber-800 block mb-1">
                          AI INFERRED (Code Structure & Layout)
                        </span>
                        <ul className="space-y-1 text-slate-600">
                          {((analysisOutput as any).inferred_claims || []).map((claim: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-500 font-bold">~</span>
                              <span>{claim} (Requires verification before resume insertion)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
