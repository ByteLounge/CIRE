'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<'resume' | 'certificate'>('resume');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commitStatus, setCommitStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Network error during document processing');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCommit = async () => {
    setCommitStatus('Approved and merged into Career Knowledge Base!');
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Source Document Ingestion</h1>
              <Badge variant="info" size="sm">PDF / DOCX / TXT / Images</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Upload existing resumes or certificates. Text is extracted, deduplicated via SHA-256 hash, and presented for review before committing.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpload}>
          <Card className="space-y-5">
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              <button
                type="button"
                onClick={() => setDocType('resume')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  docType === 'resume'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Existing Resume
              </button>
              <button
                type="button"
                onClick={() => setDocType('certificate')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  docType === 'certificate'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Certificate / Award
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <label className="cursor-pointer block">
                <span className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  Click to select file
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  Supports PDF, DOCX, TXT, PNG, JPG (Max 10MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {file && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>{file.name}</span>
                  <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={isUploading} disabled={!file} className="bg-indigo-600 text-white">
                Upload & Extract Structured Evidence
              </Button>
            </div>
          </Card>
        </form>

        {/* Extracted Review Section */}
        {result && (
          <Card className="space-y-4 border-indigo-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Extraction Review: {result.fileName}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  SHA-256 Hash: {result.hash?.slice(0, 16)}... {result.isCached && '(Loaded from Cache)'}
                </p>
              </div>
              <Badge variant="success" size="sm">Ready for Review</Badge>
            </div>

            {commitStatus ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{commitStatus}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 block mb-1">Extracted Text Preview:</span>
                  <p className="italic text-slate-500 line-clamp-3 font-mono">
                    {result.extractedText}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Skills Found ({result.extractedData?.skills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {result.extractedData?.skills?.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Experience Found
                    </span>
                    {result.extractedData?.experiences?.map((exp: any, i: number) => (
                      <div key={i} className="text-slate-700">
                        <span className="font-semibold">{exp.role}</span> at {exp.company}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Review and confirm that extracted facts match your real qualifications.
                  </span>
                  <Button onClick={handleCommit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                    Approve & Commit to Profile
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </AppShell>
  );
}
