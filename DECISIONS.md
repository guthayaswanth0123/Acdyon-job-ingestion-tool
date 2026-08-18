# Engineering Decisions Document (DECISIONS.md)

**Candidate Assessment**: Acdyon Technologies Frontend & Engineering Challenge — Part 1  
**Project**: Top-1% Resilient Job Listing Ingestion Platform & Intelligence Analytics Suite  

---

## 1. Detection Surface & Client Fingerprinting

Automated scrapers attempting to extract data from protected platforms (LinkedIn, Indeed, Wellfound) are detected through several explicit telemetry layers:

1. **TLS / HTTP Fingerprinting**: Headless browsers (Puppeteer, Playwright) and naive HTTP clients exhibit distinct TLS ciphers, ALPN negotiation parameters, and missing standard headers (`Accept-Language`, `Sec-Fetch-Mode`, `Sec-Ch-Ua`).
2. **Behavioral & Timing Patterns**: Machine-like rapid sequential requests with sub-100ms delays, non-human mouse movement paths, or unrendered canvas elements immediately trigger anti-bot systems (Cloudflare, Akamai, Datadome).
3. **Identity & IP Reputation**: Requests originating from data-center IP blocks (AWS, GCP, DigitalOcean) without residential proxy rotation or valid authenticated session cookies face instant CAPTCHA challenges or HTTP 429/403 blocks.

### Design Mitigation
Instead of engaging in an arms race (browser fingerprint spoofing, stealth plugins, proxy evasion) that violates Terms of Service and risks IP/account bans, our design **eliminates the detection surface entirely** by consuming official, unauthenticated public feeds (**Remotive API**, **Arbeitnow API**, and **WeWorkRemotely RSS**). We send standard browser user-agent headers, respect API contracts, and enforce conservative pacing.

---

## 2. Ingestion Strategy & Multi-Format Heterogeneity

### Why Multi-Source Public Feed Ingestion over Direct Scraping?
- **Multi-Format Architecture**: Our ingestion engine handles both **REST JSON APIs** (Remotive, Arbeitnow) and **XML/RSS Feeds** (WeWorkRemotely) using a unified `JobSource` abstract base class.
- **Stability & ToS Compliance**: Direct HTML scraping is inherently fragile—a single CSS class update breaks parsing logic. Public feeds provide stable contracts and legal compliance.
- **Fallback Hierarchy**: If a primary source is unresponsive or rate-limited, the pipeline logs the anomaly and seamlessly executes secondary adapters, ensuring continuous data availability.

---

## 3. Pipeline Resilience & Anomaly Handling

- **HTTP Timeouts & Exponential Backoff**: Outbound requests enforce a 12-second HTTP connection/read timeout using `httpx`. Temporary server errors (429, 500, 502, 503, 504) trigger up to 3 retries with exponential backoff (`1.5^attempt` seconds).
- **Non-Destructive Zero-Record Handling**: If a source returns an empty payload (`0 jobs`) due to upstream maintenance, the database is **not wiped**. The pipeline logs an empty-feed anomaly, sets run status to `partial_success`, and retains all existing records.
- **Deterministic Deduplication**: Record IDs are generated via `SHA256(source + url)`. Re-running ingestion updates existing jobs if content modified or skips them as duplicates, preventing DB inflation.

---

## 4. Candidate Experience & Intelligence Capabilities

- **Automated Tech Stack Tag Extraction**: Extracted tech keywords (`Python`, `React`, `TypeScript`, `AWS`, `FastAPI`, `Docker`, `SQL`, `AI/ML`) render interactive tag pills on job cards.
- **Candidate Shortlisting & Data Export**: Users can bookmark target jobs to a persistent shortlist (`localStorage`) and export their shortlist to **CSV** or **JSON**.
- **Market Intelligence Analytics**: Built-in visual analytics suite graphing tech stack demand distributions, top hiring organizations, and ingestion telemetry.

---

## 5. Trade-Offs Made Under Time Constraint

1. **SQLite vs PostgreSQL**: SQLite was selected to deliver a zero-dependency, self-contained demonstration suitable for immediate deployment without external database hosting overhead. For production scale (100k+ records), we would migrate to PostgreSQL with pg_trgm full-text search indexes.
2. **Synchronous Pipeline vs Distributed Queues**: Ingestion runs synchronously in background FastAPI tasks. Under a 1-week timeline, we would implement Celery/Redis worker queues with scheduled cron triggers and Prometheus metrics.

---

## 6. AI Tool Usage Disclosure

AI tools (Antigravity AI) were utilized for rapid project scaffolding, boilerplate code generation, UI layout ideas, and documentation generation. All generated code was personally reviewed, refactored, tested via Pytest (10/10 tests passing), and verified end-to-end.
