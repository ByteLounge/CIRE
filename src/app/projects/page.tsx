'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FolderGit2, Plus, ExternalLink, Trash2, Edit3, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from '@/components/ui/Icons';
import { Project } from '@/lib/types/database';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenAdd = () => {
    setCurrentProject({
      title: '',
      description: '',
      role: '',
      technologies: [],
      github_url: '',
      deployment_url: '',
      architecture_overview: '',
      highlights: [],
      verified: true,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = currentProject.id ? 'PUT' : 'POST';
      const res = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProject),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      fetchProjects();
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Technical Projects</h1>
              <Badge variant="success" size="sm">Evidence Traceable</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Verified software projects. Each project is automatically cataloged in the Career Evidence repository.
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <Card key={proj.id} className="flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      {proj.title}
                      {proj.verified && (
                        <span title="Verified Evidence"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></span>
                      )}
                    </h3>
                    {proj.role && <p className="text-xs font-semibold text-indigo-600 mt-0.5">{proj.role}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setCurrentProject(proj); setModalOpen(true); }}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{proj.description}</p>

                {proj.architecture_overview && (
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-100 mb-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Architecture: </span>
                    {proj.architecture_overview}
                  </div>
                )}

                {proj.highlights && proj.highlights.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Key Highlights
                    </span>
                    <ul className="space-y-1">
                      {proj.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {proj.technologies.map((tech, idx) => (
                    <span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
                {proj.github_url && (
                  <a
                    href={proj.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    Repository
                  </a>
                )}
                {proj.deployment_url && (
                  <a
                    href={proj.deployment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Live Demo
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={currentProject.id ? 'Edit Project' : 'Add Verified Project'}
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={currentProject.title || ''}
                onChange={(e) => setCurrentProject(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Responsibility</label>
              <input
                type="text"
                placeholder="e.g. Lead Backend Architect"
                value={currentProject.role || ''}
                onChange={(e) => setCurrentProject(p => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={currentProject.description || ''}
                onChange={(e) => setCurrentProject(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies (comma separated)</label>
              <input
                type="text"
                placeholder="Python, FastAPI, PostgreSQL, Docker"
                value={currentProject.technologies?.join(', ') || ''}
                onChange={(e) => setCurrentProject(p => ({ 
                  ...p, 
                  technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={currentProject.github_url || ''}
                  onChange={(e) => setCurrentProject(p => ({ ...p, github_url: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deployment URL</label>
                <input
                  type="url"
                  value={currentProject.deployment_url || ''}
                  onChange={(e) => setCurrentProject(p => ({ ...p, deployment_url: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Architecture Overview</label>
              <input
                type="text"
                placeholder="e.g. Clean architecture separating domain entities and REST controller endpoints"
                value={currentProject.architecture_overview || ''}
                onChange={(e) => setCurrentProject(p => ({ ...p, architecture_overview: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={isSaving} className="bg-indigo-600 text-white">
                Save Project & Register Evidence
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
