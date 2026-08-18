from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class JobBase(BaseModel):
    title: str
    company: str
    location: str = "Remote"
    description: str
    url: str
    source: str
    category: Optional[str] = None
    job_type: Optional[str] = None
    published_at: Optional[datetime] = None

class JobSchema(JobBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JobListResponse(BaseModel):
    items: List[JobSchema]
    total: int
    page: int
    limit: int
    pages: int

class IngestionResult(BaseModel):
    source: str
    fetched: int
    inserted: int
    updated: int
    duplicates: int
    failed: int
    status: str
    error_message: Optional[str] = None
    duration_seconds: float

class StatsResponse(BaseModel):
    total_jobs: int
    sources_count: dict
    top_locations: dict
    categories_count: dict
    last_ingestion: Optional[dict] = None

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    database: str
    timestamp: datetime
