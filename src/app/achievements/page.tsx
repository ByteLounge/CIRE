'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Trophy, Plus, Calendar, Trash2, CheckCircle2 } from 'lucide-react';
import { Achievement } from '@/lib/types/database';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newAch, setNewAch] = useState<Partial<Achievement>>({
    title: '',
    organization: '',
    date: '',
    ranking: '',
    description: '',
    verified: true,
  });

  const fetchAch = async () => {
    try {
      const res = await fetch('/api/achievements');
      const data = await res.json();
      if (data.achievements) setAchievements(data.achievements);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAch();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAch),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchAch();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/achievements?id=${id}`, { method: 'DELETE' });
      fetchAch();
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Honors & Achievements</h1>
              <Badge variant="success" size="sm">Evidence Traceable</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Verified hackathons, awards, rankings, and academic distinctions.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Achievement
          </Button>
        </div>

        <div className="space-y-4">
          {achievements.map(ach => (
            <Card key={ach.id} className="hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{ach.title}</h3>
                    {ach.ranking && (
                      <Badge variant="warning" size="sm">{ach.ranking}</Badge>
                    )}
                  </div>
                  {ach.organization && (
                    <p className="text-sm font-semibold text-indigo-600 mt-0.5">{ach.organization}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(ach.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{ach.date}</span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{ach.description}</p>
            </Card>
          ))}
        </div>

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Honor or Achievement">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. 1st Place Winner - CalHacks"
                value={newAch.title}
                onChange={(e) => setNewAch(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Event</label>
                <input
                  type="text"
                  placeholder="e.g. CalHacks"
                  value={newAch.organization || ''}
                  onChange={(e) => setNewAch(p => ({ ...p, organization: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={newAch.date}
                  onChange={(e) => setNewAch(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ranking / Result</label>
              <input
                type="text"
                placeholder="e.g. 1st Place (out of 280 teams)"
                value={newAch.ranking || ''}
                onChange={(e) => setNewAch(p => ({ ...p, ranking: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Details on what was built or achieved..."
                value={newAch.description}
                onChange={(e) => setNewAch(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white">Save Achievement</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
