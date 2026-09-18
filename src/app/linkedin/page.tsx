'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { LinkedinIcon } from '@/components/ui/Icons';

export default function LinkedInEvidencePage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samplePost = `Excited to share that I just integrated vector embeddings and semantic similarity search into my RAG Assistant project! Building on Python and FastAPI, I structured deterministic chunking pipelines for technical whitepapers and benchmarked query retrieval latency. Great learning experience with vector databases and grounding validation!`;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/linkedin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent: content, importType: 'post_text' }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to parse LinkedIn content');
      }
    } catch {
      setError('Network error during LinkedIn extraction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">LinkedIn Evidence Ingestion</h1>
              <Badge variant="info" size="sm">Authorized Workflow</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Analyze user-exported data and technical posts. LinkedIn posts are treated as evidence insights rather than authoritative employment records.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleImport}>
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Paste LinkedIn Post or Profile Export
              </label>
              <button
                type="button"
                onClick={() => setContent(samplePost)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Load Sample Technical Post
              </button>
            </div>

            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste text of your LinkedIn post describing a project, hackathon, or technical milestone..."
              className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Safe import: Claims will be marked as <span className="font-semibold text-slate-700">NEEDS_REVIEW</span> until user approved.
              </span>
              <Button type="submit" isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Extract Post Evidence
              </Button>
            </div>
          </Card>
        </form>

        {result && (
          <Card className="space-y-4 border-emerald-200 bg-emerald-50/20">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Extracted LinkedIn Evidence
              </h2>
              <Badge variant="success" size="sm">Pending Verification</Badge>
            </div>

            <div className="space-y-3">
              {result.createdEvidence?.map((ev: any) => (
                <div key={ev.id} className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{ev.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                      {ev.verification_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{ev.claim}</p>
                  <div className="flex flex-wrap gap-1">
                    {ev.skills?.map((s: string, i: number) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{ev.source_reference}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <a href="/evidence" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Go to Evidence Explorer to Verify <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
