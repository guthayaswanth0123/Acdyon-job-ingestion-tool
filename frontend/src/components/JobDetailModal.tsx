import React, { useEffect } from 'react';
import { Job } from '../types/job';
import { X, Building2, MapPin, ExternalLink, Calendar, ShieldCheck, Tag, Globe } from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!job) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel w-full max-w-3xl max-h-[85vh] rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/60">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                {job.source}
              </span>
              {job.category && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {job.category}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{job.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                {job.company}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-4 h-4" />
                {formatDate(job.published_at)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Metadata banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Deduplicated Record ID: <code className="text-indigo-300 font-mono">{job.id}</code></span>
            </div>
            <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">Source: {job.source}</span>
          </div>

          {/* HTML Description Body */}
          <div 
            className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Ingested: {new Date(job.created_at).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Apply on Original Listing</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
