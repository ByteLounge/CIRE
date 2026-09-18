'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, FileDown, Edit3, Trash2, Calendar, Sparkles } from 'lucide-react';
import { ResumeVersion } from '@/lib/types/database';

export default function ResumeVersionsPage() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVersions = async () => {
    try {
      const res = await fetch('/api/resumes');
      const data = await res.json();
      if (data.versions) setVersions(data.versions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume version?')) return;
    try {
      await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      fetchVersions();
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saved Resume Versions</h1>
              <Badge variant="success" size="sm">Immutable Snapshots</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Each opportunity has its own targeted resume snapshot. Your master profile is preserved.
            </p>
          </div>
          <Link href="/builder">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Tailor New Resume
            </Button>
          </Link>
        </div>

        {versions.length === 0 ? (
          <Card className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No saved resume versions yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Analyze a target job and generate a tailored ATS resume to save your first snapshot.
            </p>
            <Link href="/builder">
              <Button size="sm" className="bg-indigo-600 text-white">
                Go to Resume Builder
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {versions.map((v) => (
              <Card key={v.id} className="flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{v.version_name}</h3>
                      {v.target_company && (
                        <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                          Target: {v.target_company}
                        </p>
                      )}
                    </div>
                    <Badge variant="info" size="sm" className="capitalize">
                      {v.template_id.replace('-', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(v.created_at).toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span>{v.page_count} Page{v.page_count > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">ATS Ready</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {v.resume_data?.summary || 'Tailored resume summary'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/resumes/${v.id}/export`}
                      download
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-indigo-50 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      DOCX
                    </a>
                    <Link
                      href={`/builder?versionId=${v.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2.5 py-1.5 rounded hover:bg-indigo-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  </div>

                  <button
                    onClick={() => handleDelete(v.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50"
                    title="Delete version"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
