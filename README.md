# Acdyon Ingest — Resilient Job Listing Ingestion Platform & Intelligence Suite

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)
[![Pytest](https://img.shields.io/badge/Pytest-8.0-0A9EDC?style=flat-square&logo=pytest)](https://docs.pytest.org/)

Production-quality fullstack web application built for **Part 1 (Scraper / Job Listing Ingestion Project)** of the **Acdyon Technologies Engineering Challenge**.

---

## 🌐 Live Production Demo & Links

- **Live Deployed Frontend (Vercel)**: [https://acdyon-job-ingestion-tool.vercel.app](https://acdyon-job-ingestion-tool.vercel.app)
- **Live Deployed Backend API (Render)**: [https://acdyon-job-ingestion-tool.onrender.com](https://acdyon-job-ingestion-tool.onrender.com)
- **GitHub Repository**: [https://github.com/guthayaswanth0123/Acdyon-job-ingestion-tool](https://github.com/guthayaswanth0123/Acdyon-job-ingestion-tool)

---

## 🏗️ Architecture & Multi-Source Data Flow

```text
[ Remotive API (REST JSON) ] ──┐
[ Arbeitnow API (REST JSON)  ] ├──► [ JobSource Adapters ] ──► [ Ingestion Pipeline ] ──► [ SQLite DB ]
[ WeWorkRemotely (RSS XML)   ] ──┘   (Timeouts & Retries)       (SHA256 Deduplication)       (jobs, runs)
                                                                                                 │
                                                                                                 ▼
    ┌───────────────────────────┐                      ┌───────────────────────────┐       ┌─────┴─────┐
    │ React Saved Shortlist Drawer│ ◄────────────────── │ Visual Analytics Suite    │ ◄──── │ FastAPI   │
    │ (CSV & JSON Export)       │                      │ (Tech Stack Demand Charts)│       │ REST API  │
    └───────────────────────────┘                      └───────────────────────────┘       └───────────┘
```

---

## ✨ Top-1% Standout Features

1. **Multi-Format Ingestion Engine (3 Data Sources)**: Ingests from **Remotive REST API**, **Arbeitnow REST API**, and **WeWorkRemotely RSS XML Feed**, demonstrating multi-format feed parsing in a unified pipeline.
2. **Automated Tech Stack Tag Extraction**: Regex algorithm parses job descriptions and titles to extract tech keywords (`Python`, `React`, `AWS`, `Docker`, `TypeScript`, `FastAPI`, `AI/ML`, `Go`, `Kubernetes`) rendered as interactive tag pills.
3. **Interactive Visual Analytics Suite**: Renders real-time demand graphs for tech stack keywords, top hiring companies, and source distribution.
4. **Candidate Shortlisting & Data Exporter**: Users can save target jobs to a persistent shortlist (`localStorage`) and export them directly to **CSV** or **JSON** files for application tracking.
5. **Deterministic Deduplication**: Key generation via `SHA256(source + url)` prevents duplicate record insertion across ingestions.
6. **Resilience Safeguards**: 12-second HTTP timeouts, 3-attempt exponential backoff retries, and non-destructive zero-record protections (DB is never wiped if feed returns 0 items).
7. **Polished Glassmorphism UI**: Dark slate theme, tabbed navigation, live search, location/source filters, mobile responsiveness (390px - 1440px), and bonus Konami Code Easter Egg (`↑ ↑ ↓ ↓ ← → ← → B A`).

---

## 🛠️ Technology Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2, `httpx` (async HTTP client), Pytest (10/10 passing).
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Database**: SQLite3 (`jobs.db`).
- **Deployment**: Vercel (Frontend), Render (Backend).

---

## 🧪 Running Automated Tests

Run backend unit and integration test suite (10 tests):
```bash
cd backend
.\venv\Scripts\pytest.exe -v
```

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and database connectivity. |
| `GET` | `/api/jobs` | Paginated list of jobs. Supports `search`, `location`, `source`, `category`, `page`, `limit`. |
| `GET` | `/api/jobs/{id}` | Detailed job record by deterministic ID. |
| `POST` | `/api/ingest` | Triggers ingestion run for `source=remotive`, `arbeitnow`, `weworkremotely`, or `all`. |
| `GET` | `/api/stats` | Platform telemetry metrics (job counts, location stats, last run log). |
| `GET` | `/api/analytics` | Aggregated tech stack distribution, top hiring companies, and source share for visual charts. |
