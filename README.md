# Acdyon Ingest — Resilient Job Listing Ingestion Platform

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

---

## 🏗️ Architecture & Data Flow

```text
[ Remotive API / Arbeitnow API ]
              │
              │ HTTP GET (Timeouts & Exponential Retries)
              ▼
    ┌────────────────────┐
    │  JobSource Adapter │  <-- Abstract Base Class
    └─────────┬──────────┘
              ▼
    ┌────────────────────┐
    │ Ingestion Pipeline │  <-- Normalization & Deterministic Hashing
    └─────────┬──────────┘
              ▼
    ┌────────────────────┐
    │  SQLite Database   │  <-- Tables: jobs, ingestion_runs
    └─────────┬──────────┘
              ▼
    ┌────────────────────┐
    │  FastAPI REST API  │  <-- Search, Filter, Pagination, Stats
    └─────────┬──────────┘
              ▼
    ┌────────────────────┐
    │  React Dashboard   │  <-- Dark Glassmorphism UI & Matrix Easter Egg
    └────────────────────┘
```

---

## ✨ Key Features

1. **Compliant Public Ingestion Engine**: Pulls real job postings without violating platform ToS, avoiding account/IP bans or anti-bot evasions.
2. **Modular Source Adapters**: Pluggable architecture allowing instant integration of new RSS/API job sources via `JobSource` abstract class.
3. **Deterministic Deduplication**: Generates immutable keys (`SHA256(source + url)`) to prevent duplicate record insertion across ingestions.
4. **Resilience & Anomaly Safeguards**: Enforces HTTP timeouts (12s), exponential backoff retries (up to 3 attempts), and non-destructive zero-record protections (DB is never wiped if feed returns 0 items).
5. **Polished Dashboard UI**: Dark slate glassmorphism design with search, location/source filters, telemetry metrics overview, job detail modal, mobile responsiveness (390px - 1440px), and bonus Konami Code Easter Egg (`↑ ↑ ↓ ↓ ← → ← → B A`).
6. **Telemetry & Telematics**: Tracks detailed ingestion statistics (`fetched`, `inserted`, `updated`, `duplicates`, `failed`, `duration_seconds`) stored in `ingestion_runs`.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2, `httpx` (async HTTP client), Pytest.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Database**: SQLite3 (`jobs.db`).
- **Deployment**: Vercel (Frontend), Render (Backend).

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone Repository
```bash
git clone https://github.com/your-username/acdyon-job-ingestion.git
cd acdyon-job-ingestion
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend API server
uvicorn app.main:app --reload --port 8000
```
Backend API will run at `http://localhost:8000`.  
Swagger Interactive Documentation available at `http://localhost:8000/docs`.

### 3. Frontend Setup
In a new terminal window:
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev
```
Frontend Dashboard will run at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run backend unit and integration test suite:
```bash
cd backend
pytest -v
```

Tests cover:
- Health endpoint integrity (`/api/health`)
- Raw JSON normalization logic for Remotive & Arbeitnow
- Deterministic SHA256 ID generation & deduplication
- Pipeline empty feed anomaly resilience
- Search, filter, and pagination REST endpoints

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and database connectivity. |
| `GET` | `/api/jobs` | Paginated list of jobs. Supports `search`, `location`, `source`, `category`, `page`, `limit`. |
| `GET` | `/api/jobs/{id}` | Detailed job record by deterministic ID. |
| `POST` | `/api/ingest` | Triggers ingestion run for `source=remotive`, `arbeitnow`, or `all`. |
| `GET` | `/api/stats` | Platform telemetry metrics (job counts, location stats, last run log). |

---

## ☁️ Deployment Instructions

### Frontend (Vercel)
1. Push code to GitHub repository.
2. Import project into Vercel dashboard.
3. Set root directory to `frontend`.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Add Environment Variable: `VITE_API_BASE_URL=https://<your-render-backend-url>.onrender.com/api`.
6. Deploy!

### Backend (Render)
1. Create a new Web Service on Render connected to your GitHub repo.
2. Set Root Directory to `backend`.
3. Set Environment to `Python 3`.
4. Build Command: `pip install -r requirements.txt`.
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Add Environment Variable: `CORS_ORIGINS=https://<your-vercel-frontend-url>.vercel.app`.
7. Deploy!
