import { Job, JobListResponse, IngestionResult, StatsResponse, JobFilters, AnalyticsResponse } from '../types/job';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchJobs(filters: JobFilters): Promise<JobListResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.location && filters.location !== 'all') params.append('location', filters.location);
  if (filters.source && filters.source !== 'all') params.append('source', filters.source);
  if (filters.category && filters.category !== 'all') params.append('category', filters.category);
  params.append('page', filters.page.toString());
  params.append('limit', filters.limit.toString());

  const response = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchJobById(id: string): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch job details: ${response.status}`);
  }
  return response.json();
}

export async function triggerIngestion(source: string = 'all'): Promise<IngestionResult[]> {
  const response = await fetch(`${API_BASE_URL}/ingest?source=${source}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Ingestion trigger failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch platform metrics: ${response.status}`);
  }
  return response.json();
}

export async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const response = await fetch(`${API_BASE_URL}/analytics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analytics data: ${response.status}`);
  }
  return response.json();
}
