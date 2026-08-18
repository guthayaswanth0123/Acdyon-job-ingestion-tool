import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Job Ingestion Platform API"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./jobs.db")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # Public APIs
    REMOTIVE_API_URL: str = os.getenv("REMOTIVE_API_URL", "https://remotive.com/api/remote-jobs")
    ARBEITNOW_API_URL: str = os.getenv("ARBEITNOW_API_URL", "https://www.arbeitnow.com/api/job-board-api")
    
    # Ingestion Defaults
    HTTP_TIMEOUT_SECONDS: float = 12.0
    MAX_RETRIES: int = 3

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
