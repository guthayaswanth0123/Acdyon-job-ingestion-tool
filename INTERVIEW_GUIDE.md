# Interview Preparation & Defense Guide (INTERVIEW_GUIDE.md)

**Candidate Guide**: Comprehensive breakdown of the Job Listing Ingestion Platform for technical interview presentation and line-by-line code defense.

---

## 1. Executive Summary & Core Philosophy

**Question**: *"Can you walk me through your project and your overall architecture?"*

**Answer**:
> "I built an end-to-end, resilient Job Listing Ingestion & Dashboard platform. The core goal was to demonstrate engineering judgment by building an ingestion system that pulls real job data reliably without violating ToS or risking IP/account bans.
> 
> My architecture consists of three decoupled layers:
> 1. **Ingestion Layer (Python/FastAPI)**: Uses an abstract adapter pattern (`JobSource`) to pull from safe public job APIs (Remotive and Arbeitnow). It normalizes raw records, enforces HTTP timeouts and retries, generates deterministic SHA256 IDs, and deduplicates entries before writing to SQLite.
> 2. **Database & Storage Layer (SQLAlchemy ORM + SQLite)**: Stores normalized jobs and records telemetry metrics for every ingestion execution (`IngestionRun`).
> 3. **Presentation Layer (React + Vite + TypeScript + Tailwind CSS)**: Provides a dark-themed intelligence dashboard with instant search, location/source filters, telemetry metrics overview, detailed job view modal, and responsive design from mobile (390px) to desktop (1440px)."

---

## 2. Technology Choices & Technical Justifications

### Why FastAPI for the Backend?
- **Asynchronous I/O Support**: FastAPI natively supports `async/await` with `httpx`, allowing concurrent ingestion fetches without blocking the main event loop.
- **Pydantic Validation**: Automatically validates incoming query parameters and serializes outbound API JSON schemas.
- **Swagger Documentation**: Automatically generates interactive OpenAPI specs at `/docs`.

### Why React + Vite + TypeScript for the Frontend?
- **Vite**: Ultra-fast HMR and bundle compilation compared to legacy Create-React-App.
- **TypeScript**: Ensures compile-time type safety across API response types (`Job`, `JobListResponse`, `IngestionResult`), preventing runtime `undefined` property crashes.
- **Tailwind CSS**: Utility-first CSS allowing custom glassmorphism design system without external heavy UI libraries.

### Why Remotive API & Arbeitnow API as Data Sources?
- **Compliance & Risk Elimination**: Protected sites (LinkedIn, Indeed) enforce strict anti-bot protections (Cloudflare CAPTCHAs, TLS fingerprinting, IP bans). Remotive and Arbeitnow provide official, unauthenticated public REST endpoints.
- **Demonstration of Ingestion Pattern**: The challenge specifically evaluates ingestion system design, resilience, deduplication, and pipeline safety—not ToS evasion techniques.

---

## 3. Deep-Dive Ingestion Engine & Resilience Mechanisms

### How Ingestion Works Step-by-Step
1. **Trigger**: An ingestion run is invoked either automatically on startup if the DB is empty or via `POST /api/ingest`.
2. **Fetch with Safety (`fetch_raw_jobs`)**: `httpx.AsyncClient` fetches raw JSON from the source with a 12-second timeout and custom User-Agent.
3. **Retry with Exponential Backoff**: If HTTP status 429, 500, 502, 503, or 504 occurs, the client sleeps for `1.5^attempt` seconds before retrying (max 3 attempts).
4. **Normalization (`normalize_job`)**: The adapter parses source-specific JSON structures into a standard dictionary (`title`, `company`, `location`, `description`, `url`, `published_at`).
5. **Deterministic ID Hashing (`generate_deterministic_id`)**: Generates an ID using `SHA256(source + url.lower().strip())[:16]`.
6. **Deduplication & Upsert**: The pipeline queries SQLite by ID. If present and content changed, it updates the record. If unchanged, it increments `duplicate_count`. If new, it inserts a new row.
7. **Telemetry Log**: Records `fetched_count`, `inserted_count`, `updated_count`, `duplicate_count`, and `duration_seconds` in `IngestionRun`.

### How Failure & Anomaly Cases are Handled
- **Source Down / Network Failure**: The pipeline catches the HTTP exception, logs an error, records status `failed` in `IngestionRun`, and leaves existing DB records intact.
- **Empty Feed Anomaly (0 jobs returned)**: If a source returns an empty array, the pipeline logs a warning, sets status to `partial_success`, and **does not delete existing DB jobs**.

---

## 4. Key Files & Function Responsibilities

### Backend Files
- [config.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/config.py): Application configuration and environment variable loading.
- [models.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/database/models.py): Defines `Job` and `IngestionRun` SQLAlchemy ORM tables.
- [base.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/ingestion/base.py): Abstract `JobSource` class containing retry backoff and deterministic SHA256 ID logic.
- [remotive.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/ingestion/remotive.py): Adapter parsing Remotive API raw JSON fields.
- [arbeitnow.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/ingestion/arbeitnow.py): Adapter parsing Arbeitnow API raw JSON fields.
- [pipeline.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/ingestion/pipeline.py): Orchestrates fetch, normalization, deduplication, DB upsert, and telemetry.
- [job_service.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/services/job_service.py): Database query helper supporting SQL ILIKE search, location/source filtering, and pagination.
- [routes.py](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/backend/app/api/routes.py): FastAPI route handlers (`/health`, `/jobs`, `/jobs/{id}`, `/ingest`, `/stats`).

### Frontend Files
- [App.tsx](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/frontend/src/App.tsx): Main dashboard state container, handling filter state, API calls, Konami listener, and toasts.
- [Header.tsx](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/frontend/src/components/Header.tsx): Header navigation with ingestion trigger button and telemetry toggle.
- [SearchFilterBar.tsx](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/frontend/src/components/SearchFilterBar.tsx): Live search input and filter dropdowns.
- [JobCard.tsx](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/frontend/src/components/JobCard.tsx): Displays job cards with company, title, tags, relative date, and excerpt.
- [JobDetailModal.tsx](file:///c:/Users/nithe/OneDrive/Attachments/Desktop/Acydon/frontend/src/components/JobDetailModal.tsx): Modal displaying full sanitized HTML description and original apply link.

---

## 5. Potential Interview Questions & Strong Responses

### Q1: *"What happens if the job source changes its HTML structure or JSON schema?"*
> **Answer**: "Because we use an abstract source adapter pattern (`JobSource`), schema changes are isolated to a single adapter class (e.g. `RemotiveSource`). If field names change, we only update `normalize_job` in that adapter. The pipeline, database models, and frontend remain completely unaffected."

### Q2: *"How do you prevent inserting the same job twice when ingestion runs every hour?"*
> **Answer**: "We generate a deterministic primary key for each record using a SHA-256 hash of `f'{source}:{url}'`. Before inserting, the pipeline queries SQLite by this ID. If it already exists, we compare content timestamps and increment our duplicate counter rather than creating a duplicate row."

### Q3: *"How would you scale this system to ingest 1,000,000 jobs per day across 50 sources?"*
> **Answer**:
> 1. **Storage**: Replace SQLite with PostgreSQL, using partitioned tables by date and `pg_trgm` indexes for fast search.
> 2. **Async Task Queue**: Replace synchronous pipeline calls with Celery / Redis background worker tasks distributed across multiple worker nodes.
> 3. **Rate Limiting & Proxy Pool**: Implement distributed token-bucket rate limiting per domain to prevent overloading source APIs.
> 4. **Observability**: Expose Prometheus metrics for failed ingestion runs and trigger PagerDuty alerts if a source fails 3 consecutive runs.

---

## 6. What Could Be Improved With One Week of Fulltime Development?
1. **Automated Cron Scheduling**: Add APScheduler or Celery Beat for periodic background ingestion runs every 6 hours.
2. **Full-Text Search Engine**: Integrate PostgreSQL TSVector or Meilisearch for instant fuzzy searching across millions of descriptions.
3. **User Bookmarks & Saved Searches**: Add user authentication and saved job alerts via email notifications.
