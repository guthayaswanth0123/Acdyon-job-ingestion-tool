import logging
import html
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict, Any, Optional
import httpx
from app.config import settings
from app.ingestion.base import JobSource

logger = logging.getLogger(__name__)

class WeworkremotelySource(JobSource):
    """
    Adapter for WeWorkRemotely RSS XML Feed.
    URL: https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss
    Demonstrates XML/RSS feed parsing alongside JSON REST APIs.
    """

    @property
    def source_name(self) -> str:
        return "weworkremotely"

    @property
    def source_url(self) -> str:
        return "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss"

    async def fetch_raw_jobs(self) -> List[Dict[str, Any]]:
        """Overrides fetch_raw_jobs to parse RSS XML items."""
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AcdyonJobIngestionEngine/1.0",
            "Accept": "application/rss+xml, application/xml, text/xml, */*"
        }

        async with httpx.AsyncClient(timeout=settings.HTTP_TIMEOUT_SECONDS, follow_redirects=True, headers=headers) as client:
            try:
                response = await client.get(self.source_url)
                response.raise_for_status()
                xml_text = response.text

                # Parse XML
                root = ET.fromstring(xml_text)
                items = []
                channel = root.find("channel")
                if channel is not None:
                    for item_node in channel.findall("item"):
                        title = item_node.findtext("title") or ""
                        link = item_node.findtext("link") or item_node.findtext("guid") or ""
                        description = item_node.findtext("description") or ""
                        pub_date = item_node.findtext("pubDate") or ""
                        category = item_node.findtext("category") or "Full-Stack Programming"
                        region = item_node.findtext("region") or "Remote"

                        items.append({
                            "title": title,
                            "link": link,
                            "description": description,
                            "pub_date": pub_date,
                            "category": category,
                            "region": region
                        })
                return items
            except Exception as exc:
                logger.error(f"[{self.source_name}] Error fetching or parsing RSS feed: {exc}")
                return []

    def normalize_job(self, raw_item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            url = raw_item.get("link")
            raw_title = raw_item.get("title", "")
            
            if not url or not raw_title:
                return None

            # Split "Company: Job Title" if formatted as Company: Title
            company = "WeWorkRemotely Partner"
            title = raw_title
            if ":" in raw_title:
                parts = raw_title.split(":", 1)
                company = parts[0].strip()
                title = parts[1].strip()

            location = raw_item.get("region") or "Remote"
            raw_desc = raw_item.get("description") or "No description provided."
            description = html.unescape(raw_desc).strip()
            category = raw_item.get("category") or "Full-Stack Programming"

            published_at = datetime.utcnow()
            pub_date_str = raw_item.get("pub_date")
            if pub_date_str:
                try:
                    # e.g., Mon, 17 Aug 2026 19:21:19 +0000
                    published_at = datetime.strptime(pub_date_str[:25], "%a, %d %b %Y %H:%M:%S")
                except ValueError:
                    pass

            deterministic_id = self.generate_deterministic_id(url)

            return {
                "id": deterministic_id,
                "title": title,
                "company": company,
                "location": location,
                "description": description,
                "url": url.strip(),
                "source": self.source_name,
                "category": category,
                "job_type": "Full Time",
                "published_at": published_at
            }
        except Exception as exc:
            logger.error(f"[{self.source_name}] Error normalizing RSS record: {exc}")
            return None
