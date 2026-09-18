'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Sparkles, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { Skill, SkillCategory, Proficiency } from '@/lib/types/database';

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState<{
    name: string;
    category: SkillCategory;
    proficiency: Proficiency;
    years_of_experience: number;
    verified: boolean;
  }>({
    name: '',
    category: 'language',
    proficiency: 'intermediate',
    years_of_experience: 2,
    verified: true,
  });

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.skills) setSkills(data.skills);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchSkills();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
      fetchSkills();
    } catch (err) {
      console.error(err);
    }
  };

  const categories: { label: string; cat: SkillCategory }[] = [
    { label: 'Languages', cat: 'language' },
    { label: 'Frameworks & Libraries', cat: 'framework' },
    { label: 'Databases & Storage', cat: 'database' },
    { label: 'Tools & DevOps', cat: 'tool' },
    { label: 'Cloud & Infrastructure', cat: 'cloud' },
    { label: 'AI & Machine Learning', cat: 'ai_ml' },
    { label: 'Core / Soft Skills', cat: 'soft' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Technical Skills</h1>
              <Badge variant="success" size="sm">Evidence Grounded</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Only verified skills supported by repository analysis, project code, or employment history are included.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Skill
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map(({ label, cat }) => {
            const catSkills = skills.filter(s => s.category === cat);
            if (catSkills.length === 0) return null;

            return (
              <Card key={cat}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="text-sm font-bold text-slate-900">{label}</h3>
                  <span className="text-xs text-slate-400">{catSkills.length} skills</span>
                </div>

                <div className="space-y-2">
                  {catSkills.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                        {s.verified && (
                          <span title="Verified Evidence"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /></span>
                        )}
                        <span className="text-[10px] text-slate-500 capitalize bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {s.proficiency}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{s.years_of_experience} yrs</span>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Technical Skill">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Docker, PostgreSQL, React"
                value={newSkill.name}
                onChange={(e) => setNewSkill(s => ({ ...s, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill(s => ({ ...s, category: e.target.value as SkillCategory }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="language">Language</option>
                  <option value="framework">Framework / Library</option>
                  <option value="database">Database</option>
                  <option value="tool">Tool / DevOps</option>
                  <option value="cloud">Cloud Platform</option>
                  <option value="ai_ml">AI / Machine Learning</option>
                  <option value="soft">Soft / Core Skill</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proficiency</label>
                <select
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill(s => ({ ...s, proficiency: e.target.value as Proficiency }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                value={newSkill.years_of_experience}
                onChange={(e) => setNewSkill(s => ({ ...s, years_of_experience: parseFloat(e.target.value) || 1 }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white">Save Skill</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
