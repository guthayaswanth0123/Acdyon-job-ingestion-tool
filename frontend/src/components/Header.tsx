import React from 'react';
import { Database, RefreshCw, BarChart2, Zap, Terminal, Bookmark, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  onIngest: () => void;
  isIngesting: boolean;
  activeTab: 'jobs' | 'analytics' | 'shortlist';
  onTabChange: (tab: 'jobs' | 'analytics' | 'shortlist') => void;
  savedCount: number;
  onOpenEasterEgg: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onIngest,
  isIngesting,
  activeTab,
  onTabChange,
  savedCount,
  onOpenEasterEgg,
}) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenEasterEgg}
            title="Click for Easter Egg"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Acdyon Ingest
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Zap className="w-3 h-3" /> Intelligence Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Multi-Source Job Ingestion & Market Analytics Platform
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('jobs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'jobs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Jobs Board</span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Analytics Suite</span>
          </button>

          <button
            onClick={() => onTabChange('shortlist')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'shortlist'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({savedCount})</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onIngest}
            disabled={isIngesting}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isIngesting ? 'animate-spin' : ''}`} />
            <span>{isIngesting ? 'Ingesting Feeds...' : 'Trigger Ingestion'}</span>
          </button>

          <button
            onClick={onOpenEasterEgg}
            title="Open Scraper Matrix Mode"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-green-400 hover:border-green-500/30 transition-colors"
          >
            <Terminal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
