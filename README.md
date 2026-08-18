# Acdyon Ingest — Multi-Source Job Ingestion & Market Analytics Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)
[![Pytest](https://img.shields.io/badge/Pytest-8.0-0A9EDC?style=flat-square&logo=pytest)](https://docs.pytest.org/)

**Author**: Gutha Yaswanth (`guthayaswanth0123`)  
**Project Target**: Acdyon Technologies Frontend & Engineering Challenge — **Part 1 (Scraper / Job Listing Ingestion Project)**  
**Live Frontend**: [https://acdyon-job-ingestion-tool.vercel.app](https://acdyon-job-ingestion-tool.vercel.app)  
**Live Backend API**: [https://acdyon-job-ingestion-tool.onrender.com](https://acdyon-job-ingestion-tool.onrender.com)  
**GitHub Repository**: [https://github.com/guthayaswanth0123/Acdyon-job-ingestion-tool](https://github.com/guthayaswanth0123/Acdyon-job-ingestion-tool)  

---

## 📌 Executive Summary & Purpose

**Acdyon Ingest** is a production-grade fullstack web application and ingestion pipeline built to solve the **Part 1 Scraper / Ingestion Challenge**. 

Rather than relying on fragile direct HTML scraping from platforms like LinkedIn or Indeed—which violate Terms of Service, risk IP bans, and break whenever CSS classes update—this platform demonstrates an **anti-bot resilient, compliant multi-source ingestion strategy**. It ingests, normalizes, deduplicates, and analyzes job listing data across 3 heterogeneous public sources (**Remotive REST API**, **Arbeitnow REST API**, and **WeWorkRemotely RSS XML Feed**) while providing a dark glassmorphic candidate intelligence dashboard.

---

## 📁 Complete Repository Directory Structure

```text
Acdyon-job-ingestion-tool/
├── DECISIONS.md                      # Engineering decision document & anti-bot detection analysis
├── README.md                         # Main comprehensive system documentation & setup guide
│
├── backend/                          # FastAPI Python Backend Application
│   ├── pytest.ini                    # Pytest test configuration & path bindings
│   ├── requirements.txt              # Backend dependencies (fastapi, uvicorn, sqlalchemy, httpx, pytest)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app entrypoint, CORS setup, DB startup auto-seeding
│   │   ├── config.py                 # Pydantic environment configuration & API feed endpoints
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py             # REST API endpoint handlers (/health, /jobs, /ingest, /stats, /analytics)
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── connection.py         # SQLAlchemy engine & SessionLocal sqlite connection setup
│   │   │   └── models.py             # SQLAlchemy ORM models (Job, IngestionRun)
│   │   ├── ingestion/
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Abstract JobSource base class with retry backoff & SHA256 hashing
│   │   │   ├── remotive.py           # Remotive REST JSON API adapter
│   │   │   ├── arbeitnow.py          # Arbeitnow REST JSON API adapter
│   │   │   ├── weworkremotely.py     # WeWorkRemotely RSS 2.0 XML feed adapter
│   │   │   └── pipeline.py           # Ingestion pipeline runner with deduplication & zero-record protection
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── job.py                # Pydantic schemas (JobSchema, JobListResponse, IngestionResult, StatsResponse)
│   │   └── services/
│   │       ├── __init__.py
│   │       └── job_service.py        # Job database service, tech stack tag extractor, and analytics aggregator
│   └── tests/                        # Pytest Automated Test Suite
│       ├── __init__.py
│       ├── test_health.py            # Health check endpoint integration test
│       ├── test_ingestion.py         # Source normalization, RSS parsing, deduplication, and anomaly tests
│       └── test_jobs_api.py          # Jobs list, search filtering, and single job detail API tests
│
└── frontend/                         # React 18 + Vite + TypeScript + Tailwind CSS Frontend
    ├── package.json                  # Frontend dependencies & scripts
    ├── index.html                    # HTML document entrypoint
    ├── vite.config.ts                # Vite build configuration & API proxy settings
    ├── tailwind.config.js            # Tailwind CSS design tokens & animations
    ├── tsconfig.json                 # TypeScript compiler configuration
    └── src/
        ├── main.tsx                  # React root rendering entrypoint
        ├── App.tsx                   # Main dashboard container, tab navigation, shortlist state, toast alerts
        ├── index.css                 # Global CSS design tokens, glassmorphism, & modal typography rules
        ├── types/
        │   └── job.ts                # TypeScript interfaces (Job, JobListResponse, IngestionResult, AnalyticsResponse)
        ├── services/
        │   └── api.ts                # Frontend HTTP client service for backend API endpoints
        └── components/
            ├── Header.tsx            # Navigation header, tab switcher, trigger ingestion button, Easter Egg trigger
            ├── StatsOverview.tsx     # Metric cards showing total jobs, sources count, top locations, last run status
            ├── SearchFilterBar.tsx   # Live debounced search input, location filter, source filter, category filter
            ├── JobCard.tsx           # Glassmorphic job card with tech stack tag pills, date, location, bookmark button
            ├── JobDetailModal.tsx    # Modal view with HTML entity decoder, tabbed role video guide, & career tips
            ├── AnalyticsView.tsx     # Market intelligence suite graphing tech stack demand & top hiring companies
            ├── ShortlistDrawer.tsx   # Bookmarked jobs drawer with CSV & JSON dataset export tools
            ├── EmptyState.tsx        # Empty state component when no search results match
            ├── ErrorState.tsx        # Error alert component with retry button
            └── EasterEggModal.tsx    # Scraper Matrix Konami Code Easter Egg modal (↑ ↑ ↓ ↓ ← → ← → B A)
```

---

## 🌟 Key Platform Capabilities & Architecture

### 1. Multi-Format Ingestion Engine (3 Sources)
The platform ingests from 3 distinct public feeds, demonstrating multi-format handling:
- **Remotive API** (REST JSON): Remote software development listings.
- **Arbeitnow API** (REST JSON): European & global technology job board.
- **WeWorkRemotely RSS Feed** (XML): Fullstack programming RSS 2.0 XML feed parsed using Python's `xml.etree.ElementTree`.

### 2. Pipeline Resilience & Anomaly Protection
- **Deterministic SHA256 Deduplication**: Every record ID is generated via `SHA256(source + url)`. Re-running ingestion updates modified content without inserting duplicate records.
- **HTTP Timeouts & Exponential Backoff**: Outbound feed requests enforce a 12-second HTTP connection timeout. Transient 5xx or network failures retry up to 3 times with exponential backoff (`1.5^attempt` seconds).
- **Non-Destructive Zero-Record Protection**: If an upstream feed returns 0 records due to provider maintenance, **the existing database is never wiped**. The pipeline logs an anomaly and retains all existing records.

### 3. Automated Tech Stack Tag Extractor
A dynamic regex keyword parser parses job titles and descriptions to identify top tech keywords (`Python`, `React`, `TypeScript`, `AWS`, `FastAPI`, `Docker`, `SQL`, `AI/ML`, `Go`, `Kubernetes`) and renders interactive tag pills on job cards.

### 4. Interactive Market Analytics Suite
Renders real-time demand graphs for tech stack keywords, top hiring organizations, source distribution percentages, and location trends.

### 5. Candidate Shortlist & Dataset Exporter (CSV / JSON)
Candidates can bookmark target roles to a persistent shortlist (`localStorage`) and export their shortlist to **CSV** or **JSON** dataset files with one click.

### 6. Role Video Guide & Modal Typography
The job detail modal includes a **Role Video Guide** tab with embedded career reference videos (showing workflows for Developers, Designers, Data Analysts, Product Managers, Sales, and Finance) alongside unescaped rich HTML formatting.

---

## 🚀 How to Setup and Run Locally

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **Git**: Installed

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/guthayaswanth0123/Acdyon-job-ingestion-tool.git
cd Acdyon-job-ingestion-tool
```

---

### Step 2: Setup and Run Backend (FastAPI)

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - **Backend API**: `http://localhost:8000`
   - **Interactive OpenAPI Swagger Docs**: `http://localhost:8000/docs`

---

### Step 3: Setup and Run Frontend (React + Vite)

1. Open a new terminal tab and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - **Frontend Application**: `http://localhost:5173`

---

## 🧪 Running Automated Tests

Run the complete Pytest backend test suite (10 unit/integration tests):
```bash
cd backend
.\venv\Scripts\pytest.exe -v
```

---

## 🛠️ Building for Production

To create a production-ready build of the frontend:
```bash
cd frontend
npm run build
```
The optimized production bundle will be generated inside `frontend/dist/`.

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status & DB connection | None |
| `GET` | `/api/jobs` | Paginated job list | `search`, `location`, `source`, `category`, `page`, `limit` |
| `GET` | `/api/jobs/{id}` | Single job details by ID | `id` (path) |
| `POST` | `/api/ingest` | Triggers multi-source feed ingestion | `source` (`remotive`, `arbeitnow`, `weworkremotely`, `all`) |
| `GET` | `/api/stats` | Platform telemetry & run stats | None |
| `GET` | `/api/analytics` | Aggregated market analytics data | None |

---

## ☁️ Deployment Architecture

- **Backend Deployment**: Hosted on **Render** using Uvicorn ASGI server with automatic GitHub push deployment.
- **Frontend Deployment**: Hosted on **Vercel** with Vite production optimization and automatic edge CDN distribution.

---

## 🧑‍💻 Author Information

**Developer**: Gutha Yaswanth  
**GitHub**: [https://github.com/guthayaswanth0123](https://github.com/guthayaswanth0123)  
**Repository**: [https://github.com/guthayaswanth0123/Acdyon-job-ingestion-tool](https://github.com/guthayaswanth0123/Acdyon-job-ingestion-tool)  
**Built For**: Acdyon Technologies Engineering Challenge (Part 1 Scraper / Ingestion Project)
