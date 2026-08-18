# Engineering Decisions Document (DECISIONS.md)

**Candidate Assessment**: Acdyon Technologies Frontend & Engineering Challenge — Part 1  
**Project**: Resilient Job Listing Ingestion Platform & Intelligence Dashboard  

---

## 1. Detection Surface & Client Fingerprinting

Automated scrapers attempting to extract data from protected platforms (LinkedIn, Indeed, Wellfound) are detected through several explicit telemetry layers:

1. **TLS / HTTP Fingerprinting**: Headless browsers (Puppeteer, Playwright) and naive HTTP clients exhibit distinct TLS ciphers, ALPN negotiation parameters, and missing standard headers (`Accept-Language`, `Sec-Fetch-Mode`, `Sec-Ch-Ua`).
2. **Behavioral & Timing Patterns**: Machine-like rapid sequential requests with sub-100ms delays, non-human mouse movement paths, or unrendered canvas elements immediately trigger anti-bot systems (Cloudflare, Akamai, Datadome).
3. **Identity & IP Reputation**: Requests originating from data-center IP blocks (AWS, GCP, DigitalOcean) without residential proxy rotation or valid authenticated session cookies face instant CAPTCHA challenges or HTTP 429/403 blocks.

### Design Mitigation
Instead of engaging in an arms race (browser fingerprint spoofing, stealth plugins, proxy evasion) that violates Terms of Service and risks IP/account bans, our design **eliminates the detection surface entirely** by consuming official, unauthenticated public feeds (**Remotive API** & **Arbeitnow API**). We send standard browser user-agent headers, respect API contracts, and enforce conservative pacing.

---

## 2. Ingestion Strategy & Source Selection

### Why Public API/Feed Ingestion over Direct Scraping?
- **Stability & ToS Compliance**: Direct HTML scraping is inherently fragile—a single CSS class update or layout change breaks parsing logic. Public APIs provide stable JSON contracts and legal compliance.
- **Source Adapter Abstraction**: The ingestion engine uses a modular `JobSource` abstract base class. Adding a new public source (e.g. We Work Remotely RSS) requires writing a 30-line adapter subclass without modifying database or API route logic.
- **Fallback Hierarchy**: If the primary source (`RemotiveSource`) is unresponsive or rate-limited, the pipeline logs the anomaly and seamlessly executes secondary adapters (`ArbeitnowSource`), ensuring continuous data availability.

---

## 3. Pipeline Resilience & Anomaly Handling

- **HTTP Timeouts & Exponential Backoff**: All outbound requests enforce a 12-second HTTP connection/read timeout using `httpx`. Temporary server errors (429, 500, 502, 503, 504) trigger up to 3 retries with exponential backoff (`1.5^attempt` seconds).
- **Non-Destructive Zero-Record Handling**: If a source returns an empty payload (`0 jobs`) due to upstream maintenance, the database is **not wiped**. The pipeline logs an empty-feed anomaly, sets run status to `partial_success`, and retains all existing records.
- **Deterministic Deduplication**: Record IDs are generated via `SHA256(source + url)`. Re-running ingestion updates existing jobs if content modified or skips them as duplicates, preventing DB inflation.

---

## 4. Trade-Offs Made Under Time Constraint

1. **SQLite vs PostgreSQL**: SQLite was selected to deliver a zero-dependency, self-contained demonstration suitable for immediate deployment without external database hosting overhead. For production scale (100k+ records), we would migrate to PostgreSQL with pg_trgm full-text search indexes.
2. **Synchronous Pipeline vs Distributed Queues**: Ingestion runs synchronously in background FastAPI tasks. Under a 1-week timeline, we would implement Celery/Redis worker queues with scheduled cron triggers and Prometheus metrics.

---

## 5. Scraping Boundaries & Ethics

Our technical line is unambiguous: **We never bypass CAPTCHAs, spoof authentication, bypass rate limits, or violate platform ToS.** The live demo ingests strictly from public, permissionless job feeds.

---

## 6. AI Tool Usage Disclosure

AI tools (Antigravity AI) were utilized for rapid project scaffolding, boilerplate code generation, UI layout ideas, and documentation generation. All generated code was personally reviewed, refactored, tested via Pytest, and verified end-to-end.
