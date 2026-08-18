import math
import re
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from app.database.models import Job, IngestionRun
from app.schemas.job import JobListResponse, JobSchema, StatsResponse, AnalyticsResponse

TECH_KEYWORDS = [
    "Python", "React", "TypeScript", "JavaScript", "AWS", "Docker",
    "FastAPI", "Node.js", "Ruby", "Go", "Kubernetes", "SQL",
    "PostgreSQL", "AI/ML", "GraphQL", "Java", "Spring Boot", "Rust"
]

def extract_tech_tags(title: str, description: str) -> List[str]:
    combined = f"{title} {description}"
    found_tags = []
    for kw in TECH_KEYWORDS:
        pattern = r'\b' + re.escape(kw) + r'\b'
        if re.search(pattern, combined, re.IGNORECASE):
            found_tags.append(kw)
    return found_tags[:6]  # Top 6 matching tags

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

        if location and location.strip() and location.lower() != "all":
            if location.lower() == "remote":
                query = query.filter(Job.location.ilike("%remote%"))
            else:
                query = query.filter(Job.location.ilike(f"%{location.strip()}%"))

        if source and source.strip() and source.lower() != "all":
            query = query.filter(Job.source == source.strip().lower())

        if category and category.strip() and category.lower() != "all":
            query = query.filter(Job.category.ilike(f"%{category.strip()}%"))

        query = query.order_by(desc(Job.published_at), desc(Job.created_at))

        total = query.count()
        pages = math.ceil(total / limit) if total > 0 else 1
        offset = (page - 1) * limit

        items = query.offset(offset).limit(limit).all()

        job_schemas = []
        for item in items:
            schema = JobSchema.model_validate(item)
            schema.tags = extract_tech_tags(item.title, item.description)
            job_schemas.append(schema)

        return JobListResponse(
            items=job_schemas,
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
        schema = JobSchema.model_validate(job)
        schema.tags = extract_tech_tags(job.title, job.description)
        return schema

    @staticmethod
    def get_platform_stats(db: Session) -> StatsResponse:
        total_jobs = db.query(func.count(Job.id)).scalar() or 0

        sources_raw = db.query(Job.source, func.count(Job.id)).group_by(Job.source).all()
        sources_count = {s: count for s, count in sources_raw}

        locs_raw = db.query(Job.location, func.count(Job.id)).group_by(Job.location).order_by(desc(func.count(Job.id))).limit(5).all()
        top_locations = {loc: count for loc, count in locs_raw}

        cats_raw = db.query(Job.category, func.count(Job.id)).filter(Job.category.isnot(None)).group_by(Job.category).order_by(desc(func.count(Job.id))).limit(6).all()
        categories_count = {cat: count for cat, count in cats_raw}

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

    @staticmethod
    def get_analytics_data(db: Session) -> AnalyticsResponse:
        jobs = db.query(Job.title, Job.company, Job.location, Job.source, Job.description).all()
        total_jobs = len(jobs)

        # Tech stack frequencies
        tech_counts = {kw: 0 for kw in TECH_KEYWORDS}
        company_counts = {}
        source_counts = {}
        location_counts = {}

        for job in jobs:
            source_counts[job.source] = source_counts.get(job.source, 0) + 1
            company_counts[job.company] = company_counts.get(job.company, 0) + 1
            location_counts[job.location] = location_counts.get(job.location, 0) + 1

            tags = extract_tech_tags(job.title, job.description)
            for t in tags:
                tech_counts[t] += 1

        # Sort top hiring companies
        sorted_companies = dict(sorted(company_counts.items(), key=lambda x: x[1], reverse=True)[:6])
        sorted_locations = dict(sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:6])
        sorted_tech = dict(sorted(tech_counts.items(), key=lambda x: x[1], reverse=True)[:8])

        return AnalyticsResponse(
            total_jobs=total_jobs,
            tech_stack_distribution=sorted_tech,
            sources_distribution=source_counts,
            top_hiring_companies=sorted_companies,
            locations_distribution=sorted_locations
        )
