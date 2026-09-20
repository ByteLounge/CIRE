'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Check, 
  AlertCircle, 
  FileText, 
  RefreshCw, 
  FolderGit2, 
  Sparkles,
  ExternalLink,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons';
import { Profile, GitHubRepository } from '@/lib/types/database';

export default function ProfileAndSourcesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [rootResume, setRootResume] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingRepos, setIsSyncingRepos] = useState(false);
  const [isScanningResume, setIsScanningResume] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [linkedInContent, setLinkedInContent] = useState('');
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'github' | 'linkedin'>('resume');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profRes, repoRes, resumeRes] = await Promise.all([
        fetch('/api/profile').then(r => r.json()),
        fetch('/api/github/repos').then(r => r.json()),
        fetch('/api/root-resume').then(r => r.json()),
      ]);

      if (profRes.profile) {
        setProfile(profRes.profile);
        setFormData(profRes.profile);
      }
      if (repoRes.repositories) {
        setRepos(repoRes.repositories);
      }
      if (resumeRes.found) {
        setRootResume(resumeRes);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load profile data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setFeedback({ type: 'success', message: 'Master Career Profile saved successfully!' });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save changes.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error while saving profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncGitHub = async () => {
    setIsSyncingRepos(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/github/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      const data = await res.json();
      if (data.success) {
        setRepos(data.repositories);
        setFeedback({ type: 'success', message: `Synced ${data.count} repositories from GitHub!` });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({ type: 'error', message: data.error || 'GitHub sync failed.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to sync with GitHub API.' });
    } finally {
      setIsSyncingRepos(false);
    }
  };

  const handleScanRootResume = async () => {
    setIsScanningResume(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/root-resume');
      const data = await res.json();
      if (data.found) {
        setRootResume(data);
        setFeedback({ type: 'success', message: `Detected ${data.fileName} in project root!` });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setRootResume(null);
        setFeedback({ type: 'error', message: 'No resume file found in root directory.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error scanning root directory.' });
    } finally {
      setIsScanningResume(false);
    }
  };

  const handleImportLinkedIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedInContent.trim()) return;
    setIsImportingLinkedIn(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/linkedin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent: linkedInContent, importType: 'post_text' }),
      });
      const data = await res.json();
      if (data.success) {
        setLinkedInContent('');
        setFeedback({ type: 'success', message: 'LinkedIn text parsed and evidence insights registered!' });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to import LinkedIn text.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to import LinkedIn text.' });
    } finally {
      setIsImportingLinkedIn(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My Profile & Career Sources
            </h1>
            <p className="text-sm text-slate-500">
              Personal knowledge base for <span className="font-semibold text-slate-800">{profile?.full_name || 'Yash Satish Sanikop'}</span>. Single source of verified evidence.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleScanRootResume}
              disabled={isScanningResume}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isScanningResume ? 'animate-spin' : ''}`} />
              Re-scan Root
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-sm flex items-center gap-2.5 transition-all ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center gap-2 py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'resume'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Root Resume Template
            {rootResume && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'github'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GithubIcon className="w-4 h-4" />
            GitHub ({repos.length} Repos)
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`flex items-center gap-2 py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'linkedin'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkedinIcon className="w-4 h-4" />
            LinkedIn Ingestion
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            Personal Details
          </button>
        </div>

        {/* TAB 1: ROOT RESUME TEMPLATE */}
        {activeTab === 'resume' && (
          <div className="space-y-6">
            <Card className="p-6 border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {rootResume?.fileName || 'Yash_Sanikop_Resume.pdf'}
                      </h3>
                      <Badge variant="success" size="sm">Template Active</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Located in project root. CIRE automatically extracts section order, contact layout, and typography to format tailored resumes.
                    </p>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleScanRootResume}
                  disabled={isScanningResume}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isScanningResume ? 'animate-spin' : ''}`} />
                  Re-scan
                </Button>
              </div>

              {rootResume?.template && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate & Contact Line</p>
                    <p className="text-sm font-bold text-slate-900">{rootResume.template.candidateName}</p>
                    <p className="text-xs text-slate-600 font-mono break-all">{rootResume.template.contactLine}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detected Template Sections</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rootResume.template.detectedSections?.map((sec: string) => (
                        <span key={sec} className="text-[11px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {rootResume?.rawText && (
                <div className="mt-6">
                  <details className="text-xs text-slate-600">
                    <summary className="font-semibold text-slate-700 cursor-pointer hover:text-indigo-600">
                      View Parsed Base Resume Text
                    </summary>
                    <div className="mt-2 p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] max-h-64 overflow-y-auto whitespace-pre-wrap">
                      {rootResume.rawText}
                    </div>
                  </details>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2: GITHUB */}
        {activeTab === 'github' && (
          <div className="space-y-6">
            <Card className="p-6 border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                    <GithubIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">GitHub Account: ByteLounge</h3>
                    <p className="text-xs text-slate-500">Live integration active via GITHUB_PERSONAL_ACCESS_TOKEN</p>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium" 
                  onClick={handleSyncGitHub}
                  disabled={isSyncingRepos}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncingRepos ? 'animate-spin' : ''}`} />
                  {isSyncingRepos ? 'Syncing...' : 'Sync All Repos'}
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {repos.map((r) => (
                  <div 
                    key={r.id} 
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{r.repo_name}</span>
                        {r.primary_language && (
                          <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                            {r.primary_language}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {r.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <a 
                        href={r.html_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        github.com/ByteLounge/{r.repo_name}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: LINKEDIN */}
        {activeTab === 'linkedin' && (
          <div className="space-y-6">
            <Card className="p-6 border-slate-200 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <LinkedinIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">LinkedIn Evidence Extraction</h3>
                  <a 
                    href={profile?.linkedin_url || 'https://linkedin.com/in/yashsanikop'} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    {profile?.linkedin_url || 'https://linkedin.com/in/yashsanikop'}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <form onSubmit={handleImportLinkedIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Paste LinkedIn Post, Project Announcement, or About Text
                  </label>
                  <textarea
                    rows={4}
                    value={linkedInContent}
                    onChange={(e) => setLinkedInContent(e.target.value)}
                    placeholder="e.g. Excited to share that I just completed my AI internship at Lenovo India, where I engineered conversational chatbots in Botpress..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={isImportingLinkedIn || !linkedInContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    {isImportingLinkedIn ? 'Extracting Evidence...' : 'Extract Career Insights'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* TAB 4: PERSONAL DETAILS */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Card className="p-6 border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                Master Candidate Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={formData.github_url || ''}
                    onChange={(e) => setFormData(p => ({ ...p, github_url: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={formData.linkedin_url || ''}
                    onChange={(e) => setFormData(p => ({ ...p, linkedin_url: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={formData.headline || ''}
                    onChange={(e) => setFormData(p => ({ ...p, headline: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Master Summary</label>
                  <textarea
                    rows={3}
                    value={formData.summary || ''}
                    onChange={(e) => setFormData(p => ({ ...p, summary: e.target.value }))}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </AppShell>
  );
}
