'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { GraduationCap, Plus, Calendar, Trash2 } from 'lucide-react';
import { Education } from '@/lib/types/database';

export default function EducationPage() {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEdu, setNewEdu] = useState<Partial<Education>>({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
    gpa: '',
    coursework: [],
  });

  const fetchEdu = async () => {
    try {
      const res = await fetch('/api/education');
      const data = await res.json();
      if (data.education) setEducationList(data.education);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEdu();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEdu),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchEdu();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/education?id=${id}`, { method: 'DELETE' });
      fetchEdu();
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Education</h1>
              <Badge variant="success" size="sm">Verified Academic</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Degrees, institutions, GPA, and relevant computer science coursework.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Education
          </Button>
        </div>

        <div className="space-y-4">
          {educationList.map(edu => (
            <Card key={edu.id} className="hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{edu.institution}</h3>
                  <p className="text-sm font-semibold text-indigo-600 mt-0.5">
                    {edu.degree} in {edu.field_of_study}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(edu.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{edu.start_date.slice(0, 7)} – {edu.is_current ? 'Present' : edu.end_date?.slice(0, 7) || 'Present'}</span>
                </div>
                {edu.gpa && (
                  <span className="font-semibold text-slate-700">GPA: {edu.gpa}</span>
                )}
              </div>

              {edu.coursework && edu.coursework.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Relevant Coursework
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {edu.coursework.map((course, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Education">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution *</label>
              <input
                type="text"
                required
                placeholder="e.g. University of California, Berkeley"
                value={newEdu.institution}
                onChange={(e) => setNewEdu(p => ({ ...p, institution: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Science"
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu(p => ({ ...p, degree: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Field of Study *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={newEdu.field_of_study}
                  onChange={(e) => setNewEdu(p => ({ ...p, field_of_study: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={newEdu.start_date}
                  onChange={(e) => setNewEdu(p => ({ ...p, start_date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newEdu.end_date || ''}
                  onChange={(e) => setNewEdu(p => ({ ...p, end_date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GPA / CGPA</label>
                <input
                  type="text"
                  placeholder="e.g. 3.82"
                  value={newEdu.gpa || ''}
                  onChange={(e) => setNewEdu(p => ({ ...p, gpa: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Coursework (comma separated)</label>
              <input
                type="text"
                placeholder="Data Structures, Operating Systems, Database Systems"
                value={newEdu.coursework?.join(', ') || ''}
                onChange={(e) => setNewEdu(p => ({ 
                  ...p, 
                  coursework: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white">Save Education</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
