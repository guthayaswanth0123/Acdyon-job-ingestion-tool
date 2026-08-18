import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database.connection import Base
from app.database.models import Job, IngestionRun
from app.ingestion.remotive import RemotiveSource
from app.ingestion.arbeitnow import ArbeitnowSource
from app.ingestion.weworkremotely import WeworkremotelySource
from app.ingestion.pipeline import IngestionPipeline

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_remotive_normalization():
    source = RemotiveSource()
    raw = {
        "title": "Senior Python Developer",
        "company_name": "Acme Tech",
        "candidate_required_location": "US Remote",
        "description": "<p>Build scalable microservices</p>",
        "url": "https://remotive.com/jobs/senior-python-developer-12345",
        "category": "Software Development",
        "publication_date": "2026-08-18T10:00:00"
    }
    normalized = source.normalize_job(raw)
    assert normalized is not None
    assert normalized["title"] == "Senior Python Developer"
    assert normalized["company"] == "Acme Tech"
    assert normalized["location"] == "US Remote"
    assert normalized["source"] == "remotive"
    assert normalized["id"].startswith("remotive_")

def test_weworkremotely_rss_normalization():
    source = WeworkremotelySource()
    raw = {
        "title": "Stripe: Senior React Engineer",
        "link": "https://weworkremotely.com/jobs/stripe-senior-react-engineer",
        "description": "Build high throughput web dashboards",
        "region": "Worldwide",
        "category": "Full-Stack Programming",
        "pub_date": "Mon, 17 Aug 2026 19:21:19 +0000"
    }
    normalized = source.normalize_job(raw)
    assert normalized is not None
    assert normalized["company"] == "Stripe"
    assert normalized["title"] == "Senior React Engineer"
    assert normalized["source"] == "weworkremotely"
    assert normalized["id"].startswith("weworkremotely_")

def test_deterministic_id_consistency():
    source = RemotiveSource()
    url = "https://example.com/jobs/123"
    id1 = source.generate_deterministic_id(url)
    id2 = source.generate_deterministic_id(url)
    assert id1 == id2

class MockEmptySource(RemotiveSource):
    async def fetch_raw_jobs(self):
        return []

class MockSingleJobSource(RemotiveSource):
    async def fetch_raw_jobs(self):
        return [{
            "title": "Backend Engineer",
            "company_name": "Global Corp",
            "candidate_required_location": "Worldwide",
            "description": "Awesome role",
            "url": "https://example.com/job-1",
            "publication_date": "2026-08-18T10:00:00"
        }]

@pytest.mark.asyncio
async def test_pipeline_deduplication_and_metrics():
    db = TestingSessionLocal()
    mock_source = MockSingleJobSource()
    pipeline = IngestionPipeline(db, mock_source)

    res1 = await pipeline.run()
    assert res1.inserted == 1
    assert res1.duplicates == 0
    assert db.query(Job).count() == 1

    res2 = await pipeline.run()
    assert res2.inserted == 0
    assert res2.duplicates == 1
    assert db.query(Job).count() == 1
    db.close()

@pytest.mark.asyncio
async def test_pipeline_empty_feed_resilience():
    db = TestingSessionLocal()
    db.add(Job(
        id="test_123",
        title="Existing Engineer",
        company="Existing Co",
        location="Remote",
        description="Desc",
        url="https://example.com/existing",
        source="test"
    ))
    db.commit()

    empty_source = MockEmptySource()
    pipeline = IngestionPipeline(db, empty_source)
    res = await pipeline.run()

    assert res.fetched == 0
    assert res.status == "partial_success"
    assert db.query(Job).count() == 1
    db.close()
