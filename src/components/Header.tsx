import React from 'react';
import Link from 'next/link';
import { Layers, BookOpen, Compass, CheckCircle } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition">
                LLD Studio
              </span>
              <span className="block text-xs text-slate-400 -mt-1 font-mono">
                Low-Level Design Practice
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center space-x-6 text-sm">
          <Link
            href="/"
            className="text-slate-300 hover:text-white flex items-center space-x-1.5 transition"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Problem Catalog</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Evaluation Engine: Hybrid (Rule + Design Heuristics)</span>
          </div>
        </nav>
      </div>
    </header>
  );
};
