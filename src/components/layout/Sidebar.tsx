'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  FolderGit2, 
  Briefcase, 
  Sparkles, 
  GraduationCap, 
  Award, 
  Trophy, 
  FileText, 
  ShieldCheck, 
  Search, 
  FileEdit, 
  History, 
  BarChart3, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Master Profile', href: '/profile', icon: User },
    ],
  },
  {
    title: 'Career Knowledge Base',
    items: [
      { label: 'Projects', href: '/projects', icon: FolderGit2 },
      { label: 'Experience', href: '/experience', icon: Briefcase },
      { label: 'Skills', href: '/skills', icon: Sparkles },
      { label: 'Education', href: '/education', icon: GraduationCap },
      { label: 'Certificates', href: '/certificates', icon: Award },
      { label: 'Achievements', href: '/achievements', icon: Trophy },
    ],
  },
  {
    title: 'Evidence & Ingestion',
    items: [
      { label: 'GitHub Evidence', href: '/github', icon: GithubIcon, badge: 'Active' },
      { label: 'LinkedIn Evidence', href: '/linkedin', icon: LinkedinIcon },
      { label: 'Source Documents', href: '/documents', icon: FileText },
      { label: 'Evidence Explorer', href: '/evidence', icon: ShieldCheck },
    ],
  },
  {
    title: 'Targeting & Resumes',
    items: [
      { label: 'Job Analyzer', href: '/jobs', icon: Search },
      { label: 'Resume Builder', href: '/builder', icon: FileEdit, badge: 'AI' },
      { label: 'Resume Versions', href: '/resumes', icon: History },
      { label: 'ATS & Fact Checker', href: '/ats', icon: BarChart3 },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings & AI Budget', href: '/settings', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-white tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-base leading-tight">CIRE</span>
              <span className="text-[10px] text-indigo-400 font-medium tracking-wide uppercase">Evidence Engine</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-sm">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all group
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-indigo-400 border border-indigo-900/50'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-center text-xs border border-indigo-500/30 shrink-0">
                AM
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">Alex Morgan</p>
                <p className="text-[11px] text-slate-400 truncate">Verified Master</p>
              </div>
            </div>
            <Link href="/profile" className="text-slate-400 hover:text-white p-1">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
