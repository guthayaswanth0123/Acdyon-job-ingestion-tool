import React from 'react';
import { Job } from '../types/job';
import { Bookmark, Download, Trash2, ExternalLink, Building2, MapPin, X } from 'lucide-react';

interface ShortlistDrawerProps {
  savedJobs: Job[];
  onRemoveBookmark: (jobId: string) => void;
  onClearAll: () => void;
  onSelectJob: (job: Job) => void;
}

export const ShortlistDrawer: React.FC<ShortlistDrawerProps> = ({
  savedJobs,
  onRemoveBookmark,
  onClearAll,
  onSelectJob,
}) => {
  const exportToCSV = () => {
    if (savedJobs.length === 0) return;
    const headers = ['ID', 'Title', 'Company', 'Location', 'Source', 'URL', 'Published Date'];
    const rows = savedJobs.map((j) => [
      `"${j.id}"`,
      `"${j.title.replace(/"/g, '""')}"`,
      `"${j.company.replace(/"/g, '""')}"`,
      `"${j.location.replace(/"/g, '""')}"`,
      `"${j.source}"`,
      `"${j.url}"`,
      `"${j.published_at || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `acdyon_shortlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (savedJobs.length === 0) return;
    const jsonStr = JSON.stringify(savedJobs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `acdyon_shortlist_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 mb-10 animate-fade-in">
      {/* Drawer Header & Export Tools */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Bookmark className="w-4 h-4" /> Candidate Shortlist Suite
          </div>
          <h2 className="text-xl font-extrabold text-white">Saved Job Shortlist</h2>
          <p className="text-xs text-slate-400 mt-1">Export your bookmarked role listings for application tracking</p>
        </div>

        <div className="flex items-center gap-3">
          {savedJobs.length > 0 && (
            <>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={exportToJSON}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
              <button
                onClick={onClearAll}
                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                title="Clear All Shortlisted Jobs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Shortlist Items Grid */}
      {savedJobs.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center max-w-md mx-auto my-8">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Your shortlist is empty</h3>
          <p className="text-xs text-slate-400">
            Click the bookmark icon on any job card in the Jobs Board to save it to your personal shortlist.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <div key={job.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                    {job.source}
                  </span>
                  <button
                    onClick={() => onRemoveBookmark(job.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove from shortlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3
                  onClick={() => onSelectJob(job)}
                  className="text-sm font-bold text-white group-hover:text-amber-400 cursor-pointer transition-colors line-clamp-2 mb-2"
                >
                  {job.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {job.location}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onSelectJob(job)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  View Details
                </button>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
                >
                  <span>Apply</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
