import React from 'react';
import { Search, Filter, X, MapPin, Globe } from 'lucide-react';
import { JobFilters } from '../types/job';

interface SearchFilterBarProps {
  filters: JobFilters;
  onFilterChange: (updated: Partial<JobFilters>) => void;
  onReset: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const isFiltered =
    filters.search ||
    filters.location !== 'all' ||
    filters.source !== 'all' ||
    filters.category !== 'all';

  return (
    <div className="glass-panel p-4 rounded-xl mb-6 border border-slate-800 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          placeholder="Search jobs by title, company, skill, or keyword..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ search: '', page: 1 })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Filters Container */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
        {/* Location Filter */}
        <div className="relative flex-1 sm:w-40">
          <select
            value={filters.location}
            onChange={(e) => onFilterChange({ location: e.target.value, page: 1 })}
            className="w-full pl-3 pr-8 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="all">All Locations</option>
            <option value="remote">Remote Only</option>
            <option value="US">United States</option>
            <option value="Europe">Europe</option>
            <option value="Worldwide">Worldwide</option>
          </select>
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Source Filter */}
        <div className="relative flex-1 sm:w-40">
          <select
            value={filters.source}
            onChange={(e) => onFilterChange({ source: e.target.value, page: 1 })}
            className="w-full pl-3 pr-8 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="remotive">Remotive API</option>
            <option value="arbeitnow">Arbeitnow API</option>
          </select>
          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
