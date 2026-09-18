'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, Shield, Plus, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export const Header: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample quick search results based on career evidence
  const searchResults = [
    { title: 'TaskFlow', type: 'Project', link: '/projects', snippet: 'TypeScript, Next.js, React' },
    { title: 'Inventory API', type: 'Project', link: '/projects', snippet: 'Python, FastAPI, Docker, PostgreSQL' },
    { title: 'Apex Cloud Solutions', type: 'Experience', link: '/experience', snippet: 'Software Engineering Intern' },
    { title: 'AWS Cloud Practitioner', type: 'Certificate', link: '/certificates', snippet: 'AWS S3, Security' },
    { title: 'Docker Containerization', type: 'Evidence', link: '/evidence', snippet: 'Multi-stage Dockerfile verified' },
    { title: 'Python', type: 'Skill', link: '/skills', snippet: 'Advanced proficiency, 3 years' },
  ].filter(item => 
    searchQuery.trim() === '' || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Mobile Toggle & Page Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Canonical Career Knowledge Base Active
          </div>
        </div>

        {/* Center: Quick Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100/80 hover:bg-slate-100 hover:text-slate-600 rounded-lg border border-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search career evidence, skills, projects...</span>
            </div>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white rounded border border-slate-300">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action Buttons & AI Safety Status */}
        <div className="flex items-center gap-2.5">
          <Link href="/settings" className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Cost Safety: On</span>
          </Link>

          <Link href="/builder">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Tailor Resume
            </Button>
          </Link>
        </div>
      </header>

      {/* Global Search Modal */}
      <Modal isOpen={searchOpen} onClose={() => setSearchOpen(false)} title="Global Career Search" maxWidth="lg">
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search across skills, repositories, projects, and evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              autoFocus
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No matching career evidence found.</p>
            ) : (
              searchResults.map((res, i) => (
                <Link
                  key={i}
                  href={res.link}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-lg transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                        {res.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {res.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{res.snippet}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
