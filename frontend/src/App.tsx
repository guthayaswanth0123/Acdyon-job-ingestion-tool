import React, { useState, useEffect, useCallback } from 'react';
import { Job, JobFilters, StatsResponse, IngestionResult } from './types/job';
import { fetchJobs, triggerIngestion, fetchStats } from './services/api';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { SearchFilterBar } from './components/SearchFilterBar';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { EasterEggModal } from './components/EasterEggModal';
import { AnalyticsView } from './components/AnalyticsView';
import { ShortlistDrawer } from './components/ShortlistDrawer';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const LOCAL_STORAGE_SAVED_KEY = 'acdyon_saved_jobs_v1';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'analytics' | 'shortlist'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved / Shortlisted Jobs State stored in localStorage
  const [savedJobs, setSavedJobs] = useState<Job[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SAVED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(savedJobs));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [savedJobs]);

  const toggleBookmark = (job: Job) => {
    setSavedJobs((prev) => {
      const exists = prev.some((j) => j.id === job.id);
      if (exists) {
        setToastMessage(`Removed "${job.title}" from shortlist.`);
        return prev.filter((j) => j.id !== job.id);
      } else {
        setToastMessage(`Saved "${job.title}" to shortlist.`);
        return [...prev, job];
      }
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const removeBookmark = (jobId: string) => {
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const clearAllBookmarks = () => {
    setSavedJobs([]);
    setToastMessage('Cleared all shortlisted jobs.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    location: 'all',
    source: 'all',
    category: 'all',
    page: 1,
    limit: 12,
  });

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJobs(filters);
      setJobs(data.items);
      setTotalJobs(data.total);
      setTotalPages(data.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to job ingestion API.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      console.warn('Stats fetch error:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'jobs') {
      loadJobs();
    }
  }, [activeTab, loadJobs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleIngest = async () => {
    setIsIngesting(true);
    try {
      const results: IngestionResult[] = await triggerIngestion('all');
      const totalInserted = results.reduce((acc, r) => acc + r.inserted, 0);
      const totalDuplicates = results.reduce((acc, r) => acc + r.duplicates, 0);

      setToastMessage(
        `Ingestion complete across 3 sources! Inserted ${totalInserted} new jobs (${totalDuplicates} duplicates ignored).`
      );

      await loadJobs();
      await loadStats();
    } catch (err: any) {
      setToastMessage(`Ingestion failed: ${err.message}`);
    } finally {
      setIsIngesting(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleFilterChange = (updated: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      location: 'all',
      source: 'all',
      category: 'all',
      page: 1,
      limit: 12,
    });
  };

  // Konami Code Easter Egg Listener
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          setIsEasterEggOpen(true);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel px-4 py-3 rounded-xl border border-indigo-500/40 text-white shadow-2xl flex items-center gap-3 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        onIngest={handleIngest}
        isIngesting={isIngesting}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        savedCount={savedJobs.length}
        onOpenEasterEgg={() => setIsEasterEggOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Tab 1: Jobs Board */}
        {activeTab === 'jobs' && (
          <>
            <StatsOverview stats={stats} />

            <SearchFilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />

            {error ? (
              <ErrorState message={error} onRetry={loadJobs} />
            ) : (
              <>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="glass-card p-5 rounded-2xl animate-pulse space-y-4">
                        <div className="flex justify-between">
                          <div className="w-20 h-4 bg-slate-800 rounded"></div>
                          <div className="w-16 h-4 bg-slate-800 rounded"></div>
                        </div>
                        <div className="w-3/4 h-6 bg-slate-800 rounded"></div>
                        <div className="w-1/2 h-4 bg-slate-800 rounded"></div>
                        <div className="space-y-2">
                          <div className="w-full h-3 bg-slate-800/60 rounded"></div>
                          <div className="w-5/6 h-3 bg-slate-800/60 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <EmptyState onReset={handleResetFilters} />
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4 text-xs text-slate-400 font-medium px-1">
                      <span>
                        Showing <strong className="text-white font-semibold">{jobs.length}</strong> of{' '}
                        <strong className="text-white font-semibold">{totalJobs}</strong> listings
                      </span>
                      <span>Page {filters.page} of {totalPages}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {jobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onSelect={(j) => setSelectedJob(j)}
                          isBookmarked={savedJobs.some((j) => j.id === job.id)}
                          onToggleBookmark={(j) => toggleBookmark(j)}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-10">
                        <button
                          onClick={() => handleFilterChange({ page: filters.page - 1 })}
                          disabled={filters.page <= 1}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <div className="text-xs font-medium text-slate-400 px-2">
                          {filters.page} / {totalPages}
                        </div>

                        <button
                          onClick={() => handleFilterChange({ page: filters.page + 1 })}
                          disabled={filters.page >= totalPages}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Tab 2: Analytics Suite */}
        {activeTab === 'analytics' && <AnalyticsView />}

        {/* Tab 3: Saved Shortlist */}
        {activeTab === 'shortlist' && (
          <ShortlistDrawer
            savedJobs={savedJobs}
            onRemoveBookmark={removeBookmark}
            onClearAll={clearAllBookmarks}
            onSelectJob={(j) => setSelectedJob(j)}
          />
        )}
      </main>

      {/* Job Detail Modal */}
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />

      {/* Bonus Round Easter Egg Modal */}
      <EasterEggModal isOpen={isEasterEggOpen} onClose={() => setIsEasterEggOpen(false)} />

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Built for <strong className="text-slate-200">Acdyon Technologies Engineering Challenge</strong> (Part 1 Scraper / Ingestion)
          </div>
          <div className="text-[11px] text-slate-400">
            Multi-Source Ingestion (Remotive API + Arbeitnow API + WeWorkRemotely RSS) • Zero ToS Violations
          </div>
        </div>
      </footer>
    </div>
  );
};
