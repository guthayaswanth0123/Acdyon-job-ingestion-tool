import math
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from app.database.models import Job, IngestionRun
from app.schemas.job import JobListResponse, JobSchema, StatsResponse

class JobService:

    @staticmethod
    def get_jobs(
        db: Session,
        search: Optional[str] = None,
        location: Optional[str] = None,
        source: Optional[str] = None,
        category: Optional[str] = None,
        page: int = 1,
        limit: int = 12
    ) -> JobListResponse:
        query = db.query(Job)

        # Apply search filter (title, company, description)
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Job.title.ilike(term),
                    Job.company.ilike(term),
                    Job.location.ilike(term),
                    Job.category.ilike(term)
                )
            )

        # Apply location filter
        if location and location.strip() and location.lower() != "all":
            if location.lower() == "remote":
                query = query.filter(Job.location.ilike("%remote%"))
            else:
                query = query.filter(Job.location.ilike(f"%{location.strip()}%"))

        # Apply source filter
        if source and source.strip() and source.lower() != "all":
            query = query.filter(Job.source == source.strip().lower())

        # Apply category filter
        if category and category.strip() and category.lower() != "all":
            query = query.filter(Job.category.ilike(f"%{category.strip()}%"))

        # Order by newest published date
        query = query.order_by(desc(Job.published_at), desc(Job.created_at))

        total = query.count()
        pages = math.ceil(total / limit) if total > 0 else 1
        offset = (page - 1) * limit

        items = query.offset(offset).limit(limit).all()

        return JobListResponse(
            items=[JobSchema.model_validate(item) for item in items],
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )

    @staticmethod
    def get_job_by_id(db: Session, job_id: str) -> Optional[JobSchema]:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None
        return JobSchema.model_validate(job)

    @staticmethod
    def get_platform_stats(db: Session) -> StatsResponse:
        total_jobs = db.query(func.count(Job.id)).scalar() or 0

        # Sources breakdown
        sources_raw = db.query(Job.source, func.count(Job.id)).group_by(Job.source).all()
        sources_count = {s: count for s, count in sources_raw}

        # Top locations breakdown
        locs_raw = db.query(Job.location, func.count(Job.id)).group_by(Job.location).order_by(desc(func.count(Job.id))).limit(5).all()
        top_locations = {loc: count for loc, count in locs_raw}

        # Categories breakdown
        cats_raw = db.query(Job.category, func.count(Job.id)).filter(Job.category.isnot(None)).group_by(Job.category).order_by(desc(func.count(Job.id))).limit(6).all()
        categories_count = {cat: count for cat, count in cats_raw}

        # Last Ingestion Run telemetry
        last_run = db.query(IngestionRun).order_by(desc(IngestionRun.started_at)).first()
        last_run_dict = None
        if last_run:
            last_run_dict = {
                "source": last_run.source,
                "status": last_run.status,
                "fetched": last_run.fetched_count,
                "inserted": last_run.inserted_count,
                "updated": last_run.updated_count,
                "duplicates": last_run.duplicate_count,
                "completed_at": last_run.completed_at.isoformat() if last_run.completed_at else None
            }

        return StatsResponse(
            total_jobs=total_jobs,
            sources_count=sources_count,
            top_locations=top_locations,
            categories_count=categories_count,
            last_ingestion=last_run_dict
        )
