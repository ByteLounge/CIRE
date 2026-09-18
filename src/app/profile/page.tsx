'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, Phone, MapPin, Globe, Check, AlertCircle } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons';
import { Profile } from '@/lib/types/database';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setFormData(data.profile);
        }
      } catch (err) {
        setFeedback({ type: 'error', message: 'Failed to load master profile' });
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (field: keyof Profile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
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

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Master Career Profile</h1>
              <Badge variant="success" size="sm">Canonical Source of Truth</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Your verified personal information. Job-specific resume tailored versions never overwrite this profile.
            </p>
          </div>
        </div>

        {feedback && (
          <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <Card className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Personal & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.full_name || ''}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack & Distributed Systems Software Engineer"
                  value={formData.headline || ''}
                  onChange={(e) => handleChange('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location (City, State / Country)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pt-4 pb-3">
              Professional Links & Portfolios
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <LinkedinIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={formData.linkedin_url || ''}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  GitHub URL
                </label>
                <div className="relative">
                  <GithubIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={formData.github_url || ''}
                    onChange={(e) => handleChange('github_url', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Portfolio / Website
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={formData.portfolio_url || ''}
                    onChange={(e) => handleChange('portfolio_url', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pt-4 pb-3">
              Canonical Summary Statement
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Executive Professional Summary
              </label>
              <textarea
                rows={4}
                value={formData.summary || ''}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="High-level factual career summary supported by verified achievements and experience..."
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button type="submit" isLoading={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Master Profile
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </AppShell>
  );
}
