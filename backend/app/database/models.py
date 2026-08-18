from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, Index
from app.database.connection import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(255), primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=False, default="Remote", index=True)
    description = Column(Text, nullable=False)
    url = Column(String(1024), nullable=False)
    source = Column(String(100), nullable=False, index=True)
    category = Column(String(100), nullable=True, index=True)
    job_type = Column(String(100), nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_job_search", "title", "company", "location"),
    )

class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(100), nullable=False)
    fetched_count = Column(Integer, default=0)
    inserted_count = Column(Integer, default=0)
    updated_count = Column(Integer, default=0)
    duplicate_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    status = Column(String(50), nullable=False)  # success, partial_success, failed
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)
