'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Award, Plus, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { Certificate } from '@/lib/types/database';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCert, setNewCert] = useState<Partial<Certificate>>({
    name: '',
    issuer: '',
    issue_date: '',
    credential_id: '',
    credential_url: '',
    skills_covered: [],
  });

  const fetchCerts = async () => {
    try {
      const res = await fetch('/api/certificates');
      const data = await res.json();
      if (data.certificates) setCerts(data.certificates);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCert),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchCerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/certificates?id=${id}`, { method: 'DELETE' });
      fetchCerts();
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Certificates & Credentials</h1>
              <Badge variant="success" size="sm">Grounding Rule Enforced</Badge>
            </div>
            <p className="text-sm text-slate-500">
              Verified certifications. Note: Certificate knowledge is not automatically treated as professional employment experience.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Certificate
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map(cert => (
            <Card key={cert.id} className="flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{cert.name}</h3>
                    <p className="text-sm font-semibold text-indigo-600 mt-0.5">{cert.issuer}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Issued {cert.issue_date}</span>
                  </div>
                  {cert.credential_id && (
                    <span className="font-mono text-slate-600">ID: {cert.credential_id}</span>
                  )}
                </div>

                {cert.skills_covered && cert.skills_covered.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Topics & Skills Covered
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cert.skills_covered.map((skill, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {cert.credential_url && (
                <div className="pt-3 border-t border-slate-100">
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Verify Credential Online
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Certificate">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Certified Cloud Practitioner"
                value={newCert.name}
                onChange={(e) => setNewCert(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issuer *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert(p => ({ ...p, issuer: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date *</label>
                <input
                  type="date"
                  required
                  value={newCert.issue_date}
                  onChange={(e) => setNewCert(p => ({ ...p, issue_date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Credential ID</label>
                <input
                  type="text"
                  placeholder="e.g. AWS-CCP-9821381"
                  value={newCert.credential_id || ''}
                  onChange={(e) => setNewCert(p => ({ ...p, credential_id: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Credential URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newCert.credential_url || ''}
                  onChange={(e) => setNewCert(p => ({ ...p, credential_url: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Skills Covered (comma separated)</label>
              <input
                type="text"
                placeholder="Cloud Architecture, AWS S3, IAM Security"
                value={newCert.skills_covered?.join(', ') || ''}
                onChange={(e) => setNewCert(p => ({ 
                  ...p, 
                  skills_covered: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white">Save Certificate</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
