import React from 'react';
import { Job } from '../types/job';
import { Building2, MapPin, ExternalLink, Calendar, Bookmark, ArrowRight } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelect,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const cleanExcerpt = (htmlStr: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = htmlStr;
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > 130 ? text.slice(0, 130) + '...' : text;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'remotive':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'arbeitnow':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'weworkremotely':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group relative">
      <div>
        {/* Top Badges, Date & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getSourceBadgeColor(job.source)} uppercase tracking-wider`}>
            {job.source}
          </span>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Calendar className="w-3 h-3" />
              {formatDate(job.published_at)}
            </span>
            {onToggleBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(job);
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  isBookmarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Save to Shortlist'}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(job)}
          className="text-base font-bold text-white group-hover:text-indigo-400 cursor-pointer transition-colors line-clamp-2 mb-2"
        >
          {job.title}
        </h3>

        {/* Company & Location */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 mb-3 font-medium">
          <span className="flex items-center gap-1 text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            {job.company}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            {job.location}
          </span>
        </div>

        {/* Tech Stack Keyword Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/90 text-indigo-300 border border-indigo-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Excerpt */}
        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
          {cleanExcerpt(job.description)}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(job)}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
        >
          <span>Apply</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
