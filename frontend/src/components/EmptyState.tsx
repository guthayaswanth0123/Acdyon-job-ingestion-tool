import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onReset }) => {
  return (
    <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center max-w-md mx-auto my-12">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-indigo-400">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">No matching job listings</h3>
      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        We couldn't find any job listings matching your active search or filters. Try adjusting your search query or clearing location/source filters.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reset Filters</span>
      </button>
    </div>
  );
};
