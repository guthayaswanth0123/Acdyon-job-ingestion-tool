# Interview Preparation & Defense Guide (INTERVIEW_GUIDE.md)

**Candidate Guide**: Comprehensive breakdown of the Job Listing Ingestion Platform & Intelligence Suite for technical interview presentation and line-by-line code defense.

---

## 1. Executive Summary & Core Philosophy

**Question**: *"Can you walk me through your project and your overall architecture?"*

**Answer**:
> "I built an end-to-end, resilient Job Listing Ingestion & Intelligence Suite. The core goal was to demonstrate engineering judgment by building an ingestion engine that pulls real job data across multiple heterogeneous sources (REST JSON APIs and XML/RSS feeds) without violating ToS or risking IP/account bans.
> 
> My architecture consists of three decoupled layers:
> 1. **Ingestion Layer (Python/FastAPI)**: Uses an abstract adapter pattern (`JobSource`) to pull from 3 public job sources (Remotive API, Arbeitnow API, and WeWorkRemotely RSS feed). It normalizes raw records, extracts tech stack tags (`Python`, `React`, `AWS`, `FastAPI`, `AI/ML`), enforces HTTP timeouts and retries, generates deterministic SHA256 IDs, and deduplicates entries before writing to SQLite.
> 2. **Database & Storage Layer (SQLAlchemy ORM + SQLite)**: Stores normalized jobs and records telemetry metrics for every ingestion execution (`IngestionRun`).
> 3. **Presentation & Intelligence Layer (React + Vite + TypeScript + Tailwind CSS)**: Provides a dark-themed intelligence dashboard with tabbed navigation:
>    - **Jobs Board**: Search, filter by location/source, pagination, tech stack tag pills, and job details drawer.
>    - **Analytics Suite**: Visual charts for tech stack demand, top hiring companies, and source distribution.
>    - **Saved Shortlist**: Bookmarking system with **CSV** and **JSON** data export capabilities."

---

## 2. Technology Choices & Technical Justifications

### Why 3 Ingestion Sources (REST JSON + XML RSS)?
- Demonstrates **multi-format feed ingestion capability**: `RemotiveSource` and `ArbeitnowSource` parse JSON REST APIs, while `WeworkremotelySource` parses RSS XML feeds via `xml.etree.ElementTree`. All 3 output a unified normalized schema.

### Why Tech Stack Tag Extraction?
- A regex keyword parser parses job titles and descriptions to identify top tech keywords (`Python`, `React`, `AWS`, `Docker`, `SQL`, `AI/ML`, `Go`), enabling instant developer skill matching.

### Why CSV & JSON Data Export?
- Evaluators look for real-world user utility. Allowing candidates or data analysts to shortlist jobs and export them directly to CSV or JSON turns a basic demo into an actionable data tool.

---

## 3. Key Files & Function Responsibilities

### Backend Files
- [config.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/config.py): Configuration and environment variables.
- [models.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/database/models.py): Defines `Job` and `IngestionRun` SQLAlchemy ORM tables.
- [base.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/ingestion/base.py): Abstract `JobSource` base class with retry backoff and SHA256 ID generation.
- [remotive.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/ingestion/remotive.py): Remotive JSON API adapter.
- [arbeitnow.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/ingestion/arbeitnow.py): Arbeitnow JSON API adapter.
- [weworkremotely.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/ingestion/weworkremotely.py): WeWorkRemotely RSS XML adapter.
- [pipeline.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/ingestion/pipeline.py): Pipeline execution with deduplication, anomaly handling, and telemetry.
- [job_service.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/services/job_service.py): Database query helper, tech stack tag extractor, and analytics aggregator.
- [routes.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/api/routes.py): FastAPI route handlers (`/health`, `/jobs`, `/jobs/{id}`, `/ingest`, `/stats`, `/analytics`).

### Frontend Files
- [App.tsx](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/frontend/src/App.tsx): Dashboard state, tab navigation, bookmark persistence, and toasts.
- [AnalyticsView.tsx](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/frontend/src/components/AnalyticsView.tsx): Visual analytics suite graphing tech stack demand and hiring trends.
- [ShortlistDrawer.tsx](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/frontend/src/components/ShortlistDrawer.tsx): Bookmarked jobs drawer with CSV and JSON data export.
- [JobCard.tsx](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/frontend/src/components/JobCard.tsx): Card rendering with tech stack tag pills and bookmark toggle.
- [JobDetailModal.tsx](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/frontend/src/components/JobDetailModal.tsx): Modal displaying full HTML job description.

---

## 4. Potential Interview Questions & Strong Responses

### Q1: *"How do you handle both JSON APIs and RSS XML feeds in the same pipeline?"*
> **Answer**: "We define an abstract base class `JobSource` that exposes `fetch_raw_jobs()` and `normalize_job()`. JSON adapters use standard dictionary parsing, while `WeworkremotelySource` uses `xml.etree.ElementTree` to parse XML nodes (`<item>`, `<title>`, `<pubDate>`). Both map into the exact same standardized dictionary schema, ensuring seamless database ingestion regardless of the source's data format."

### Q2: *"How does your tech stack keyword extraction work?"*
> **Answer**: "In `job_service.py`, `extract_tech_tags` uses regex word-boundary pattern matching (`\b<keyword>\b`) across combined job titles and descriptions against a target list (`Python`, `React`, `AWS`, `Docker`, `SQL`, `AI/ML`). This extracts up to 6 matching skill tags dynamically without requiring manual tag inputs."
