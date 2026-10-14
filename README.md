# TalentFlow - AI Resume Screening & Recruitment System

A modern full-stack Recruitment & Applicant Tracking System (ATS) with AI candidate scoring, interactive analytics, and audit logging.

## Tech Stack
- **Frontend:** React 19, Vite, Recharts, Lucide Icons, Custom CSS
- **Backend:** Python FastAPI, Uvicorn, Pydantic
- **Database:** PostgreSQL 16 (via `psycopg` v3)
- **Containerization:** Docker & Docker Compose

---

## Running with Docker (Recommended)

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and ensure it is running.

### 1-Step Launch
Open your terminal in the `AI-RECRUITMENT-SYSTEM` folder and run:

```bash
docker compose up --build
```

### Accessing the Services
| Service | URL / Port | Purpose |
|---|---|---|
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Main recruitment dashboard & analytics |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | FastAPI REST API root |
| **Interactive API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI for testing API endpoints |
| **PostgreSQL Database** | `localhost:5432` | DB: `recruitment_db`, User: `postgres`, Pass: `postgrespassword` |

### Stopping the System
```bash
docker compose down
```
To also delete the database volume and start completely fresh:
```bash
docker compose down -v
```

---

## Running Locally Without Docker

### 1. Start PostgreSQL
Ensure PostgreSQL is running on `localhost:5432` with a database named `recruitment_db`.

### 2. Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
