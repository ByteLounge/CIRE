'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Check, X, Search, Filter, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CareerEvidence, VerificationStatus } from '@/lib/types/database';

export default function EvidenceExplorerPage() {
  const [evidence, setEvidence] = useState<CareerEvidence[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvidence = async () => {
    try {
      const res = await fetch('/api/evidence');
      const data = await res.json();
      if (data.evidence) setEvidence(data.evidence);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const handleUpdateStatus = async (id: string, status: VerificationStatus) => {
    try {
      await fetch('/api/evidence', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verification_status: status }),
      });
      fetchEvidence();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/evidence?id=${id}`, { method: 'DELETE' });
      fetchEvidence();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = evidence.filter(item => {
    const matchesStatus = filterStatus === 'ALL' || item.verification_status === filterStatus;
    const matchesSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Evidence Explorer</h1>
              <Badge variant="success" size="sm">Canonical Evidence Store</Badge>
            </div>
            <p className="text-sm text-slate-500">
              The atomic units of verified career truth. Only verified evidence is eligible for strong resume claims.
            </p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search claims, skills, repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'VERIFIED', 'AI_INFERRED', 'NEEDS_REVIEW', 'USER_REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence Items Grid */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="text-center py-12">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching evidence found</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your filters or ingest new sources.</p>
            </Card>
          ) : (
            filtered.map((item) => (
              <Card key={item.id} className="hover:border-slate-300 transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {item.source_type}
                      </span>

                      {item.verification_status === 'VERIFIED' && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      )}
                      {item.verification_status === 'AI_INFERRED' && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> AI Inferred
                        </span>
                      )}
                      {item.verification_status === 'NEEDS_REVIEW' && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Needs Review
                        </span>
                      )}
                      {item.verification_status === 'USER_REJECTED' && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Rejected
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      {item.claim}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.skills.map((s, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                          {s}
                        </span>
                      ))}
                    </div>

                    {item.source_reference && (
                      <p className="text-[11px] text-slate-400 font-mono pt-1">
                        Source: {item.source_reference}
                      </p>
                    )}
                  </div>

                  {/* Verification Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {item.verification_status !== 'VERIFIED' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'VERIFIED')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1"
                        title="Mark as Verified Evidence"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Verify
                      </button>
                    )}

                    {item.verification_status !== 'USER_REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'USER_REJECTED')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 flex items-center gap-1"
                        title="Reject Claim"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
