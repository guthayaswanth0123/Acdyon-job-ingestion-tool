import logging
from datetime import datetime
from typing import Dict, Any, Optional
from app.config import settings
from app.ingestion.base import JobSource

logger = logging.getLogger(__name__)

class RemotiveSource(JobSource):
    """
    Adapter for Remotive Public Jobs API.
    URL: https://remotive.com/api/remote-jobs
    """

    @property
    def source_name(self) -> str:
        return "remotive"

    @property
    def source_url(self) -> str:
        return settings.REMOTIVE_API_URL

    def normalize_job(self, raw_item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            url = raw_item.get("url") or raw_item.get("url_link")
            title = raw_item.get("title")
            company = raw_item.get("company_name") or raw_item.get("company")
            
            if not url or not title or not company:
                logger.warning(f"[{self.source_name}] Skipping record missing critical fields: title={title}, company={company}")
                return None

            location = raw_item.get("candidate_required_location") or "Remote"
            description = raw_item.get("description") or "No description provided."
            category = raw_item.get("category")
            job_type = raw_item.get("job_type")

            # Parse published date
            published_at = None
            pub_date_str = raw_item.get("publication_date")
            if pub_date_str:
                try:
                    published_at = datetime.fromisoformat(pub_date_str.replace("Z", "+00:00"))
                except ValueError:
                    published_at = datetime.utcnow()
            else:
                published_at = datetime.utcnow()

            deterministic_id = self.generate_deterministic_id(url)

            return {
                "id": deterministic_id,
                "title": title.strip(),
                "company": company.strip(),
                "location": location.strip(),
                "description": description.strip(),
                "url": url.strip(),
                "source": self.source_name,
                "category": category.strip() if category else None,
                "job_type": job_type.strip() if job_type else None,
                "published_at": published_at
            }
        except Exception as exc:
            logger.error(f"[{self.source_name}] Error normalizing job record: {exc}")
            return None
