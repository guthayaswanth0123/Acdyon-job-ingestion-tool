import time
import logging
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.database.models import Job, IngestionRun
from app.ingestion.base import JobSource
from app.schemas.job import IngestionResult

logger = logging.getLogger(__name__)

class IngestionPipeline:
    """
    Executes end-to-end ingestion workflow for a given JobSource adapter.
    Handles validation, normalization, deduplication, non-destructive updates,
    and telemetry recording into IngestionRun.
    """

    def __init__(self, db: Session, source: JobSource):
        self.db = db
        self.source = source

    async def run(self) -> IngestionResult:
        start_time = time.time()
        source_name = self.source.source_name
        logger.info(f"=== Starting Ingestion Pipeline for source '{source_name}' ===")

        fetched_count = 0
        inserted_count = 0
        updated_count = 0
        duplicate_count = 0
        failed_count = 0
        status = "success"
        error_message = None

        run_entry = IngestionRun(
            source=source_name,
            started_at=datetime.utcnow(),
            status="running"
        )
        self.db.add(run_entry)
        self.db.commit()
        self.db.refresh(run_entry)

        try:
            # Step 1: Fetch raw records from source with retry/timeout safety
            raw_jobs = await self.source.fetch_raw_jobs()
            fetched_count = len(raw_jobs)
            logger.info(f"[{source_name}] Fetched {fetched_count} raw records.")

            if fetched_count == 0:
                logger.warning(f"[{source_name}] Source returned 0 jobs. Preserving existing DB entries.")
                status = "partial_success"
                error_message = "Source returned 0 jobs (empty feed anomaly)."

            # Step 2: Normalize and process records
            for raw_item in raw_jobs:
                try:
                    normalized = self.source.normalize_job(raw_item)
                    if not normalized:
                        failed_count += 1
                        continue

                    job_id = normalized["id"]

                    # Check for existing record by ID
                    existing_job = self.db.query(Job).filter(Job.id == job_id).first()

                    if existing_job:
                        # Check if any content changed
                        has_changed = (
                            existing_job.title != normalized["title"] or
                            existing_job.company != normalized["company"] or
                            existing_job.location != normalized["location"] or
                            existing_job.description != normalized["description"]
                        )
                        if has_changed:
                            existing_job.title = normalized["title"]
                            existing_job.company = normalized["company"]
                            existing_job.location = normalized["location"]
                            existing_job.description = normalized["description"]
                            existing_job.category = normalized["category"]
                            existing_job.job_type = normalized["job_type"]
                            existing_job.updated_at = datetime.utcnow()
                            updated_count += 1
                        else:
                            duplicate_count += 1
                    else:
                        # New record insertion
                        new_job = Job(
                            id=normalized["id"],
                            title=normalized["title"],
                            company=normalized["company"],
                            location=normalized["location"],
                            description=normalized["description"],
                            url=normalized["url"],
                            source=normalized["source"],
                            category=normalized["category"],
                            job_type=normalized["job_type"],
                            published_at=normalized["published_at"],
                            created_at=datetime.utcnow(),
                            updated_at=datetime.utcnow()
                        )
                        self.db.add(new_job)
                        inserted_count += 1

                except Exception as record_exc:
                    logger.error(f"[{source_name}] Record processing error: {record_exc}")
                    failed_count += 1

            self.db.commit()

        except Exception as source_exc:
            self.db.rollback()
            logger.error(f"[{source_name}] Ingestion pipeline failure: {source_exc}", exc_info=True)
            status = "failed"
            error_message = str(source_exc)

        duration_seconds = round(time.time() - start_time, 2)

        # Update telemetry entry
        run_entry.fetched_count = fetched_count
        run_entry.inserted_count = inserted_count
        run_entry.updated_count = updated_count
        run_entry.duplicate_count = duplicate_count
        run_entry.failed_count = failed_count
        run_entry.status = status
        run_entry.error_message = error_message
        run_entry.completed_at = datetime.utcnow()

        self.db.commit()

        logger.info(
            f"=== Ingestion Finished [{source_name}] === Status: {status} | "
            f"Fetched: {fetched_count} | Inserted: {inserted_count} | Updated: {updated_count} | "
            f"Duplicates: {duplicate_count} | Failed: {failed_count} | Duration: {duration_seconds}s"
        )

        return IngestionResult(
            source=source_name,
            fetched=fetched_count,
            inserted=inserted_count,
            updated=updated_count,
            duplicates=duplicate_count,
            failed=failed_count,
            status=status,
            error_message=error_message,
            duration_seconds=duration_seconds
        )
