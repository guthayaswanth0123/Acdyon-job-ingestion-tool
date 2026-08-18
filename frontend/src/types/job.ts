export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  category?: string | null;
  job_type?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface JobListResponse {
  items: Job[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface IngestionResult {
  source: string;
  fetched: number;
  inserted: number;
  updated: number;
  duplicates: number;
  failed: number;
  status: 'success' | 'partial_success' | 'failed';
  error_message?: string | null;
  duration_seconds: number;
}

export interface StatsResponse {
  total_jobs: number;
  sources_count: Record<string, number>;
  top_locations: Record<string, number>;
  categories_count: Record<string, number>;
  last_ingestion?: {
    source: string;
    status: string;
    fetched: number;
    inserted: number;
    updated: number;
    duplicates: number;
    completed_at?: string;
  } | null;
}

export interface AnalyticsResponse {
  total_jobs: number;
  tech_stack_distribution: Record<string, number>;
  sources_distribution: Record<string, number>;
  top_hiring_companies: Record<string, number>;
  locations_distribution: Record<string, number>;
}

export interface JobFilters {
  search: string;
  location: string;
  source: string;
  category: string;
  page: number;
  limit: number;
}
