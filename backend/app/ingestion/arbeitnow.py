import logging
from datetime import datetime
from typing import Dict, Any, Optional
from app.config import settings
from app.ingestion.base import JobSource

logger = logging.getLogger(__name__)

class ArbeitnowSource(JobSource):
    """
    Adapter for Arbeitnow Public Job Board API.
    URL: https://www.arbeitnow.com/api/job-board-api
    """

    @property
    def source_name(self) -> str:
        return "arbeitnow"

    @property
    def source_url(self) -> str:
        return settings.ARBEITNOW_API_URL

    def normalize_job(self, raw_item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            url = raw_item.get("url")
            title = raw_item.get("title")
            company = raw_item.get("company_name") or raw_item.get("company")
            
            if not url or not title or not company:
                logger.warning(f"[{self.source_name}] Skipping record missing critical fields: title={title}, company={company}")
                return None

            is_remote = raw_item.get("remote", False)
            raw_location = raw_item.get("location") or ""
            location = "Remote" if is_remote else (raw_location if raw_location else "Remote")
            
            description = raw_item.get("description") or "No description provided."
            
            tags = raw_item.get("tags", [])
            category = tags[0] if tags and isinstance(tags, list) else "General Tech"
            job_type = "Full Time"
            if raw_item.get("job_types") and isinstance(raw_item["job_types"], list) and raw_item["job_types"]:
                job_type = raw_item["job_types"][0]

            # Parse created_at / published_at
            published_at = datetime.utcnow()
            created_at_val = raw_item.get("created_at")
            if isinstance(created_at_val, (int, float)):
                published_at = datetime.utcfromtimestamp(created_at_val)
            elif isinstance(created_at_val, str):
                try:
                    published_at = datetime.fromisoformat(created_at_val.replace("Z", "+00:00"))
                except ValueError:
                    pass

            deterministic_id = self.generate_deterministic_id(url)

            return {
                "id": deterministic_id,
                "title": title.strip(),
                "company": company.strip(),
                "location": location.strip(),
                "description": description.strip(),
                "url": url.strip(),
                "source": self.source_name,
                "category": category,
                "job_type": job_type,
                "published_at": published_at
            }
        except Exception as exc:
            logger.error(f"[{self.source_name}] Error normalizing job record: {exc}")
            return None
