from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.connection import get_db
from app.config import settings
from app.schemas.job import (
    HealthResponse,
    JobListResponse,
    JobSchema,
    IngestionResult,
    StatsResponse,
    AnalyticsResponse
)
from app.services.job_service import JobService
from app.ingestion.remotive import RemotiveSource
from app.ingestion.arbeitnow import ArbeitnowSource
from app.ingestion.weworkremotely import WeworkremotelySource
from app.ingestion.pipeline import IngestionPipeline

router = APIRouter(prefix="/api")

@router.get("/health", response_model=HealthResponse)
def get_health(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "unhealthy",
        app_name=settings.APP_NAME,
        version=settings.VERSION,
        database=db_status,
        timestamp=datetime.utcnow()
    )

@router.get("/jobs", response_model=JobListResponse)
def list_jobs(
    search: Optional[str] = Query(None, description="Search term for title, company, location, category"),
    location: Optional[str] = Query(None, description="Filter by location (e.g. Remote)"),
    source: Optional[str] = Query(None, description="Filter by source (remotive, arbeitnow, weworkremotely)"),
    category: Optional[str] = Query(None, description="Filter by job category"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    return JobService.get_jobs(
        db=db,
        search=search,
        location=location,
        source=source,
        category=category,
        page=page,
        limit=limit
    )

@router.get("/jobs/{job_id}", response_model=JobSchema)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = JobService.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found.")
    return job

@router.post("/ingest", response_model=List[IngestionResult])
async def trigger_ingestion(
    source: str = Query("all", description="Source to ingest: 'remotive', 'arbeitnow', 'weworkremotely', or 'all'"),
    db: Session = Depends(get_db)
):
    sources_to_run = []
    src_clean = source.lower().strip()
    
    if src_clean in ("remotive", "all"):
        sources_to_run.append(RemotiveSource())
    if src_clean in ("arbeitnow", "all"):
        sources_to_run.append(ArbeitnowSource())
    if src_clean in ("weworkremotely", "all"):
        sources_to_run.append(WeworkremotelySource())
        
    if not sources_to_run:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid source '{source}'. Valid options: 'remotive', 'arbeitnow', 'weworkremotely', 'all'."
        )

    results = []
    for src_adapter in sources_to_run:
        pipeline = IngestionPipeline(db, src_adapter)
        res = await pipeline.run()
        results.append(res)

    return results

@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    return JobService.get_platform_stats(db)

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    return JobService.get_analytics_data(db)
