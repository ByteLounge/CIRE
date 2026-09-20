'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Shield, Sparkles, User, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons';

export const Header: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm tracking-tight hidden sm:inline">
            CIRE
          </span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Root Resume Template Active</span>
          </div>
        </div>
      </div>

      {/* Center: Quick Indicators */}
      <div className="hidden md:flex items-center gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
          <GithubIcon className="w-3.5 h-3.5 text-slate-700" />
          <span className="font-medium">ByteLounge</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-1 rounded">50 Repos</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
          <LinkedinIcon className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium">yashsanikop</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Link href="/profile">
          <Button variant="outline" size="sm" className="text-xs font-medium border-slate-200">
            <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Profile & Sources
          </Button>
        </Link>
        <Link href="/">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Tailor Resume
          </Button>
        </Link>
      </div>
    </header>
  );
};
