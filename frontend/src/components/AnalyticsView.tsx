import React, { useEffect, useState } from 'react';
import { AnalyticsResponse } from '../types/job';
import { fetchAnalytics } from '../services/api';
import { BarChart3, PieChart, Cpu, Building, MapPin, RefreshCw, Layers } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center my-12 animate-pulse">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading Job Intelligence Analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center my-12">
        <p className="text-xs text-rose-400 mb-4">{error || 'Unable to load analytics.'}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Retry Analytics
        </button>
      </div>
    );
  }

  const maxTechCount = Math.max(...Object.values(data.tech_stack_distribution), 1);
  const maxCompanyCount = Math.max(...Object.values(data.top_hiring_companies), 1);

  return (
    <div className="space-y-6 mb-10 animate-fade-in">
      {/* Top Banner Stats */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <BarChart3 className="w-4 h-4" /> Market Intelligence & Insights
          </div>
          <h2 className="text-xl font-extrabold text-white">Engineering Demand Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time keyword frequency and source distribution analysis</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-800">
          <Layers className="w-6 h-6 text-indigo-400" />
          <div>
            <div className="text-xs text-slate-400 font-medium">Dataset Pool</div>
            <div className="text-lg font-bold text-white">{data.total_jobs.toLocaleString()} jobs</div>
          </div>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tech Stack Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> Top Tech Stack Keywords Demand
            </h3>
            <span className="text-[11px] text-slate-400">Extracted Realtime</span>
          </div>
          <div className="space-y-3">
            {Object.entries(data.tech_stack_distribution).map(([tech, count]) => {
              const pct = Math.round((count / maxTechCount) * 100);
              return (
                <div key={tech} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200">{tech}</span>
                    <span className="text-slate-400">{count} listings</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source Breakdown & Top Companies */}
        <div className="space-y-6">
          {/* Sources Distribution */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-purple-400" /> Ingestion Sources Share
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(data.sources_distribution).map(([src, count]) => (
                <div key={src} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{src}</div>
                  <div className="text-lg font-bold text-indigo-400 mt-1">{count}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {Math.round((count / data.total_jobs) * 100)}% share
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Companies */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Building className="w-4 h-4 text-emerald-400" /> Top Hiring Organizations
            </h3>
            <div className="space-y-2">
              {Object.entries(data.top_hiring_companies).map(([comp, count]) => (
                <div key={comp} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="font-semibold text-slate-200 truncate max-w-[200px]">{comp}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {count} positions
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
