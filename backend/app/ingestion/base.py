import abc
import hashlib
import logging
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class JobSource(abc.ABC):
    """
    Abstract Base Class for Job Ingestion Adapters.
    Encapsulates fetch, timeout, retry with backoff, and record normalization.
    """

    @property
    @abc.abstractmethod
    def source_name(self) -> str:
        """Unique identifier for the source adapter."""
        pass

    @property
    @abc.abstractmethod
    def source_url(self) -> str:
        """API or RSS feed URL."""
        pass

    @abc.abstractmethod
    def normalize_job(self, raw_item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Parses raw dict record from source into a standardized dictionary:
        {
          'id': str,
          'title': str,
          'company': str,
          'location': str,
          'description': str,
          'url': str,
          'source': str,
          'category': Optional[str],
          'job_type': Optional[str],
          'published_at': Optional[datetime]
        }
        Returns None if record is malformed/unusable.
        """
        pass

    def generate_deterministic_id(self, job_url: str) -> str:
        """
        Generates a stable, deterministic ID based on source_name + job_url.
        Prevents duplicate insertion across multiple runs.
        """
        raw_key = f"{self.source_name}:{job_url.strip().lower()}"
        hashed = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()[:16]
        return f"{self.source_name}_{hashed}"

    async def fetch_raw_jobs(self) -> List[Dict[str, Any]]:
        """
        Fetches raw job records with timeout, custom User-Agent, and exponential backoff retry.
        Handles temporary HTTP errors (429, 500, 502, 503, 504).
        """
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AcdyonJobIngestionEngine/1.0",
            "Accept": "application/json, text/plain, */*"
        }

        timeout = httpx.Timeout(settings.HTTP_TIMEOUT_SECONDS)
        max_retries = settings.MAX_RETRIES

        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=headers) as client:
            for attempt in range(1, max_retries + 1):
                try:
                    logger.info(f"[{self.source_name}] Attempt {attempt}/{max_retries} fetching from {self.source_url}")
                    response = await client.get(self.source_url)

                    # Check for rate limits or server errors
                    if response.status_code in (429, 500, 502, 503, 504):
                        logger.warning(f"[{self.source_name}] HTTP {response.status_code} on attempt {attempt}")
                        if attempt < max_retries:
                            backoff_seconds = 1.5 ** attempt
                            logger.info(f"[{self.source_name}] Sleeping {backoff_seconds:.1f}s before retry...")
                            await asyncio.sleep(backoff_seconds)
                            continue
                        else:
                            response.raise_for_status()

                    response.raise_for_status()
                    data = response.json()
                    return self._extract_job_list(data)

                except (httpx.HTTPStatusError, httpx.RequestError, ValueError) as exc:
                    logger.error(f"[{self.source_name}] Attempt {attempt} failed: {exc}")
                    if attempt < max_retries:
                        await asyncio.sleep(1.5 ** attempt)
                    else:
                        raise exc

        return []

    def _extract_job_list(self, raw_data: Any) -> List[Dict[str, Any]]:
        """Helper to extract list of jobs from arbitrary JSON response structure."""
        if isinstance(raw_data, list):
            return raw_data
        elif isinstance(raw_data, dict):
            if "jobs" in raw_data and isinstance(raw_data["jobs"], list):
                return raw_data["jobs"]
            elif "data" in raw_data and isinstance(raw_data["data"], list):
                return raw_data["data"]
            elif "items" in raw_data and isinstance(raw_data["items"], list):
                return raw_data["items"]
        return []
