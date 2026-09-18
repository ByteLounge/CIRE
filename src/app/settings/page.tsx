'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Shield, Cpu, RefreshCw, AlertTriangle, Check, Lock, Power } from 'lucide-react';
import { GenerationRun } from '@/lib/types/database';

export default function SettingsPage() {
  const [status, setStatus] = useState<any | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/settings/ai-status');
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggleAi = async () => {
    if (!status) return;
    setIsToggling(true);
    try {
      const res = await fetch('/api/settings/ai-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiEnabled: !status.isAiEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus((prev: any) => ({ ...prev, isAiEnabled: data.isAiEnabled }));
        setFeedback(data.isAiEnabled ? 'AI processing enabled' : 'AI kill switch activated: all outbound AI halted');
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings & AI Budget Controller</h1>
              <Badge variant="success" size="sm">Cost Control Enforced</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Control daily quotas, review generation costs, and manage spend safety kill switches.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={fetchStatus}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {feedback && (
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-indigo-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Global Kill Switch (Section 33) */}
        <Card className={`border-2 ${status?.isAiEnabled ? 'border-slate-200' : 'border-rose-300 bg-rose-50/20'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Power className={`w-5 h-5 ${status?.isAiEnabled ? 'text-emerald-600' : 'text-rose-600'}`} />
                <h3 className="text-base font-bold text-slate-900">Global AI Spend Safety Kill Switch</h3>
                <Badge variant={status?.isAiEnabled ? 'success' : 'danger'} size="sm">
                  {status?.isAiEnabled ? 'AI ACTIVE' : 'AI HALTED'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                When deactivated, the system halts all outbound LLM calls immediately and uses local deterministic algorithms.
              </p>
            </div>

            <Button
              onClick={handleToggleAi}
              isLoading={isToggling}
              variant={status?.isAiEnabled ? 'danger' : 'primary'}
              size="sm"
            >
              {status?.isAiEnabled ? 'Halt All AI Calls' : 'Activate AI Processing'}
            </Button>
          </div>
        </Card>

        {/* Daily Quota Meters (Section 24 & 25) */}
        <Card className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Daily AI Quotas & Usage Meters (24-Hour Window)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Overall Requests */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Total AI Requests</span>
                <span>{status?.usage?.dailyTotal || 0} / {status?.limits?.dailyRequests || 30}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, ((status?.usage?.dailyTotal || 0) / (status?.limits?.dailyRequests || 30)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Resume Generations */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Resume Generations</span>
                <span>{status?.usage?.resumeGenerations || 0} / {status?.limits?.maxResumeGenerations || 5}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, ((status?.usage?.resumeGenerations || 0) / (status?.limits?.maxResumeGenerations || 5)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Job Analyses */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Job Description Analyses</span>
                <span>{status?.usage?.jobAnalyses || 0} / {status?.limits?.maxJobAnalysis || 10}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, ((status?.usage?.jobAnalyses || 0) / (status?.limits?.maxJobAnalysis || 10)) * 100)}%` }}
                />
              </div>
            </div>

            {/* GitHub Analyses */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>GitHub Repo Analyses</span>
                <span>{status?.usage?.githubAnalyses || 0} / {status?.limits?.maxGitHubAnalysis || 10}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, ((status?.usage?.githubAnalyses || 0) / (status?.limits?.maxGitHubAnalysis || 10)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* AI Provider Configuration (Section 17 & 34) */}
        <Card className="space-y-3 text-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Configured AI Engine
          </h2>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="font-bold text-slate-800">Primary Provider: Google Gemini API</p>
                <p className="text-slate-500 font-mono text-[11px]">Model: gemini-1.5-flash</p>
              </div>
            </div>
            <Badge variant="success" size="sm">Available</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-slate-600" />
              <div>
                <p className="font-bold text-slate-800">Local Free Engine: Ollama Local</p>
                <p className="text-slate-500 font-mono text-[11px]">Endpoint: http://localhost:11434 (llama3)</p>
              </div>
            </div>
            <Badge variant="default" size="sm">Configurable</Badge>
          </div>
        </Card>

        {/* Audit Log Table (Section 38 & 55) */}
        <Card className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Recent AI Generation Runs (Audit Log)
          </h2>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-2 px-3">Operation</th>
                  <th className="py-2 px-3">Provider</th>
                  <th className="py-2 px-3">Latency</th>
                  <th className="py-2 px-3">Cached</th>
                  <th className="py-2 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {status?.recentRuns?.length ? (
                  status.recentRuns.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{r.operation}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{r.provider}</td>
                      <td className="py-2 px-3 text-slate-500">{r.latency_ms} ms</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.is_cached ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.is_cached ? 'HIT' : 'MISS'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(r.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No AI operations recorded yet today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
