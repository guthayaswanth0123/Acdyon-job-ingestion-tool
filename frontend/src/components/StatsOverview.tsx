import React from 'react';
import { StatsResponse } from '../types/job';
import { Layers, MapPin, CheckCircle, Clock, Copy, ArrowUpRight } from 'lucide-react';

interface StatsOverviewProps {
  stats: StatsResponse | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Jobs */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Active Jobs</span>
          <Layers className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-white">{stats.total_jobs.toLocaleString()}</div>
        <p className="text-[11px] text-slate-400 mt-1">Deduplicated across all public sources</p>
      </div>

      {/* Source Breakdown */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Sources</span>
          <ArrowUpRight className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="space-y-1">
          {Object.entries(stats.sources_count).map(([src, count]) => (
            <div key={src} className="flex justify-between items-center text-xs">
              <span className="capitalize font-medium text-slate-300">{src}</span>
              <span className="font-semibold text-cyan-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Locations */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Top Locations</span>
          <MapPin className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="space-y-1">
          {Object.entries(stats.top_locations).slice(0, 3).map(([loc, count]) => (
            <div key={loc} className="flex justify-between items-center text-xs">
              <span className="truncate max-w-[120px] text-slate-300 font-medium">{loc}</span>
              <span className="font-semibold text-emerald-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Last Run */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Last Ingestion Run</span>
          <CheckCircle className="w-4 h-4 text-purple-400" />
        </div>
        {stats.last_ingestion ? (
          <div className="text-xs space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold text-green-400 capitalize">{stats.last_ingestion.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Fetched / Inserted:</span>
              <span className="font-semibold text-white">
                {stats.last_ingestion.fetched} / {stats.last_ingestion.inserted}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Duplicates Ignored:</span>
              <span>{stats.last_ingestion.duplicates}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No telemetry recorded yet.</p>
        )}
      </div>
    </div>
  );
};
