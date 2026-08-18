# Acdyon Ingest — Resilient Multi-Source Job Ingestion & Market Analytics Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)
[![Pytest](https://img.shields.io/badge/Pytest-8.0-0A9EDC?style=flat-square&logo=pytest)](https://docs.pytest.org/)

Production-quality fullstack web application built for **Part 1 (Scraper / Job Listing Ingestion Project)** of the **Acdyon Technologies Engineering Challenge**.

---

## 🌐 Live Production Demo Links

- **Live Deployed Frontend (Vercel)**: [https://acdyon-job-ingestion-tool.vercel.app](https://acdyon-job-ingestion-tool.vercel.app)
- **Live Deployed Backend API (Render)**: [https://acdyon-job-ingestion-tool.onrender.com](https://acdyon-job-ingestion-tool.onrender.com)
- **GitHub Repository**: [https://github.com/guthayaswanth0123/Acdyon-job-ingestion-tool](https://github.com/guthayaswanth0123/Acdyon-job-ingestion-tool)

---

## 🏗️ System Architecture & Data Pipeline

```text
┌────────────────────────────┐
│ Remotive API (REST JSON)   │ ──┐
├────────────────────────────┤   │     ┌─────────────────────┐     ┌──────────────────────┐     ┌──────────────┐
│ Arbeitnow API (REST JSON)  │ ──┼───► │ JobSource Adapters  │ ──► │ Ingestion Pipeline   │ ──► │ SQLite DB    │
├────────────────────────────┤   │     │ (Timeouts & Retries)│     │ (SHA256 Deduplication)│     │ (jobs, runs) │
│ WeWorkRemotely (RSS XML)   │ ──┘     └─────────────────────┘     └──────────────────────┘     └──────┬───────┘
└────────────────────────────┘                                                                         │
                                                                                                       ▼
    ┌──────────────────────────────┐                   ┌──────────────────────────────┐         ┌──────┴───────┐
    │ React Saved Shortlist Drawer │ ◄──────────────── │ Visual Analytics Suite       │ ◄────── │ FastAPI      │
    │ (CSV & JSON Exporter)        │                   │ (Tech Stack Demand Charts)   │         │ REST API     │
    └──────────────────────────────┘                   └──────────────────────────────┘         └──────────────┘
```

---

## ✨ Core Key Features

1. **Multi-Format Feed Ingestion Engine (3 Sources)**:
   - Ingests from **Remotive REST API** (JSON), **Arbeitnow REST API** (JSON), and **WeWorkRemotely RSS** (XML Feed), demonstrating multi-format feed ingestion without ToS violations or account bans.
2. **Automated Tech Stack Tag Extraction**:
   - Dynamic regex parser extracts skill keywords (`Python`, `React`, `TypeScript`, `AWS`, `FastAPI`, `Docker`, `SQL`, `AI/ML`, `Go`) from job descriptions and displays interactive tag pills on job cards.
3. **Interactive Market Analytics Suite**:
   - Visual charts graphing tech stack demand distributions, top hiring organizations, and ingestion telemetry.
4. **Candidate Shortlist & Data Exporter**:
   - Users can bookmark roles to a persistent shortlist (`localStorage`) and export their shortlist to **CSV** or **JSON** files.
5. **Deterministic Deduplication & Pipeline Resilience**:
   - ID generation via `SHA256(source + url)`. HTTP 12s connection timeouts, 3-attempt exponential backoff retries, and non-destructive zero-record protection (existing database is retained if an external feed returns 0 items).
6. **Polished Glassmorphism Dashboard**:
   - Dark mode slate theme, tabbed navigation, live search, location/source filters, responsive modal detail view with custom typography, and Konami Code Easter Egg (`↑ ↑ ↓ ↓ ← → ← → B A`).

---

## 💻 Local Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # On Windows
# source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend server will run at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend dashboard will run at: `http://localhost:5173`.

---

## 🧪 Automated Testing

Run the Pytest suite (10 unit/integration tests):
```bash
cd backend
.\venv\Scripts\pytest.exe -v
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check status and SQLite database connectivity. |
| `GET` | `/api/jobs` | Paginated job list. Supports `search`, `location`, `source`, `category`, `page`, `limit`. |
| `GET` | `/api/jobs/{id}` | Single job listing by deterministic ID. |
| `POST` | `/api/ingest` | Triggers ingestion for `source=remotive`, `arbeitnow`, `weworkremotely`, or `all`. |
| `GET` | `/api/stats` | System telemetry metrics (job counts, source counts, last run status). |
| `GET` | `/api/analytics` | Aggregated market analytics data for tech stack demand and hiring trends. |
