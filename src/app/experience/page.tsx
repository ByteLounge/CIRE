'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Briefcase, Plus, Calendar, MapPin, Trash2, Edit3, CheckCircle2 } from 'lucide-react';
import { Experience, EmploymentType } from '@/lib/types/database';

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentExp, setCurrentExp] = useState<Partial<Experience>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/experience');
      const data = await res.json();
      if (data.experiences) setExperiences(data.experiences);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleOpenAdd = () => {
    setCurrentExp({
      company: '',
      role: '',
      employment_type: 'internship',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      responsibilities: [''],
      achievements: [''],
      technologies: [],
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = currentExp.id ? 'PUT' : 'POST';
      const res = await fetch('/api/experience', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentExp),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchExperiences();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience entry?')) return;
    try {
      await fetch(`/api/experience?id=${id}`, { method: 'DELETE' });
      fetchExperiences();
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Work Experience</h1>
              <Badge variant="success" size="sm">Evidence Traceable</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Verified employment and internships. Real roles and accomplishments only; no fabricated metrics.
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Experience
          </Button>
        </div>

        <div className="space-y-4">
          {experiences.map((exp) => (
            <Card key={exp.id} className="hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                    <Badge variant="default" size="sm" className="capitalize">{exp.employment_type.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-indigo-600 mt-0.5">{exp.company}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setCurrentExp(exp); setModalOpen(true); }}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exp.start_date} – {exp.is_current ? 'Present' : exp.end_date || 'Present'}</span>
                </div>
                {exp.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exp.location}</span>
                  </div>
                )}
              </div>

              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <div className="mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Responsibilities & System Work
                  </span>
                  <ul className="space-y-1">
                    {exp.responsibilities.map((r, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exp.achievements && exp.achievements.length > 0 && (
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Verified Outcomes
                  </span>
                  <ul className="space-y-1">
                    {exp.achievements.map((a, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                {exp.technologies.map((tech, idx) => (
                  <span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {tech}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={currentExp.id ? 'Edit Experience' : 'Add Work Experience'}
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                <input
                  type="text"
                  required
                  value={currentExp.company || ''}
                  onChange={(e) => setCurrentExp(p => ({ ...p, company: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                <input
                  type="text"
                  required
                  value={currentExp.role || ''}
                  onChange={(e) => setCurrentExp(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={currentExp.employment_type || 'internship'}
                  onChange={(e) => setCurrentExp(p => ({ ...p, employment_type: e.target.value as EmploymentType }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="internship">Internship</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={currentExp.start_date || ''}
                  onChange={(e) => setCurrentExp(p => ({ ...p, start_date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  disabled={currentExp.is_current}
                  value={currentExp.end_date || ''}
                  onChange={(e) => setCurrentExp(p => ({ ...p, end_date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA (or Remote)"
                value={currentExp.location || ''}
                onChange={(e) => setCurrentExp(p => ({ ...p, location: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Responsibilities (one per line)</label>
              <textarea
                rows={3}
                placeholder="Engineered microservices using Python and FastAPI&#10;Containerized development environments with Docker"
                value={currentExp.responsibilities?.join('\n') || ''}
                onChange={(e) => setCurrentExp(p => ({ ...p, responsibilities: e.target.value.split('\n').filter(Boolean) }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Verified Achievements / Outcomes (one per line)</label>
              <textarea
                rows={2}
                placeholder="Engineered caching layer with Redis that lowered repeat query latency"
                value={currentExp.achievements?.join('\n') || ''}
                onChange={(e) => setCurrentExp(p => ({ ...p, achievements: e.target.value.split('\n').filter(Boolean) }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies Used (comma separated)</label>
              <input
                type="text"
                placeholder="Python, FastAPI, PostgreSQL, Docker, Redis"
                value={currentExp.technologies?.join(', ') || ''}
                onChange={(e) => setCurrentExp(p => ({ 
                  ...p, 
                  technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={isSaving} className="bg-indigo-600 text-white">
                Save Experience
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
