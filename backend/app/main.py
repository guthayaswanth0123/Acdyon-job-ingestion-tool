import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.connection import init_db, SessionLocal
from app.api.routes import router as api_router
from app.ingestion.remotive import RemotiveSource
from app.ingestion.arbeitnow import ArbeitnowSource
from app.ingestion.pipeline import IngestionPipeline
from app.database.models import Job

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("job_ingestion")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Database...")
    init_db()
    
    # Auto-seed database on first startup if empty
    db = SessionLocal()
    try:
        count = db.query(Job).count()
        if count == 0:
            logger.info("Database is empty. Triggering initial ingestion from Remotive API...")
            pipeline = IngestionPipeline(db, RemotiveSource())
            await pipeline.run()
    except Exception as exc:
        logger.error(f"Error during startup auto-ingestion: {exc}")
    finally:
        db.close()

    yield
    logger.info("Shutting down application...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Resilient Job Listing Ingestion Platform API (Acdyon Part 1 Challenge)",
    lifespan=lifespan
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router
app.include_router(api_router)

@app.get("/")
def root_redirect():
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
