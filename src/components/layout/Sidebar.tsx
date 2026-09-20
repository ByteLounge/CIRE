'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  User, 
  Settings,
  X,
  FileText,
  ExternalLink
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons';

const navItems = [
  { label: 'Tailor Resume', href: '/', icon: Sparkles, badge: 'Active' },
  { label: 'My Profile & Sources', href: '/profile', icon: User },
  { label: 'AI Settings & Budget', href: '/settings', icon: Settings },
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
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-white tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              C
            </div>
            <div>
              <span className="text-sm font-bold block leading-tight">CIRE</span>
              <span className="text-[10px] text-indigo-400 font-medium tracking-wide uppercase">Personal Tailor</span>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors
                  ${isActive 
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-indigo-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Connected Sources
          </div>
          <div className="space-y-1 px-1">
            <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 rounded-md bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[130px]" title="Yash_Sanikop_Resume.pdf">Base Resume</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Detected in Root" />
            </div>

            <a 
              href="https://github.com/ByteLounge" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white rounded-md hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>ByteLounge</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            <a 
              href="https://linkedin.com/in/yashsanikop" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white rounded-md hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <LinkedinIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>yashsanikop</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-bold text-xs">
              YS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Yash Satish Sanikop</p>
              <p className="text-[10px] text-slate-400 truncate">Goa, India</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
