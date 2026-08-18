import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database.connection import get_db, Base
from app.database.models import Job

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    db.add(Job(
        id="job_1",
        title="Fullstack React Developer",
        company="Stripe",
        location="Remote US",
        description="Build payment interfaces",
        url="https://stripe.com/jobs/1",
        source="remotive",
        category="Software Development"
    ))
    db.add(Job(
        id="job_2",
        title="DevOps Lead",
        company="Vercel",
        location="Berlin",
        description="Deploy infrastructure",
        url="https://vercel.com/jobs/2",
        source="arbeitnow",
        category="DevOps"
    ))
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

def test_list_jobs_default():
    response = client.get("/api/jobs")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2

def test_list_jobs_search_filter():
    response = client.get("/api/jobs?search=React")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["company"] == "Stripe"

def test_get_job_by_id():
    response = client.get("/api/jobs/job_1")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Fullstack React Developer"

def test_get_job_not_found():
    response = client.get("/api/jobs/non_existent_id")
    assert response.status_code == 404
