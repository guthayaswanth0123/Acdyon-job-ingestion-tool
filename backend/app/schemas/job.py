from datetime import datetime
from typing import List, Optional, Dict
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
    tags: List[str] = Field(default_factory=list)

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
    sources_count: Dict[str, int]
    top_locations: Dict[str, int]
    categories_count: Dict[str, int]
    last_ingestion: Optional[dict] = None

class AnalyticsResponse(BaseModel):
    total_jobs: int
    tech_stack_distribution: Dict[str, int]
    sources_distribution: Dict[str, int]
    top_hiring_companies: Dict[str, int]
    locations_distribution: Dict[str, int]

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    database: str
    timestamp: datetime
