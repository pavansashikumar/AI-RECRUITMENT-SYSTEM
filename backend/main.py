import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import get_connection, initialize_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="AI Recruitment System API",
    description="Backend API for the recruitment management dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [
    origin.strip()
    for origin in cors_origins_env.split(",")
    if origin.strip()
] if cors_origins_env else [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:80",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class JobCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    department: str = Field(min_length=2, max_length=100)
    job_type: str = Field(default="Full-time", max_length=50)


class CandidateStatusUpdate(BaseModel):
    status: str


ALLOWED_STATUSES = {
    "Applied", "Screening", "Shortlisted",
    "Interview", "Hired", "Rejected",
}


@app.get("/")
def home():
    return {"message": "AI Recruitment System API is running"}


@app.get("/health")
def health():
    with get_connection() as conn:
        conn.execute("SELECT 1")
    return {"status": "healthy", "database": "connected"}


@app.get("/dashboard/stats")
def dashboard_stats():
    with get_connection() as conn:
        jobs = conn.execute("""
            SELECT COUNT(*) AS total
            FROM jobs WHERE status = 'Active'
        """).fetchone()["total"]

        candidates = conn.execute("""
            SELECT COUNT(*) AS total FROM candidates
        """).fetchone()["total"]

        interviews = conn.execute("""
            SELECT COUNT(*) AS total FROM candidates
            WHERE status = 'Interview'
        """).fetchone()["total"]

        hired = conn.execute("""
            SELECT COUNT(*) AS total FROM candidates
            WHERE status = 'Hired'
        """).fetchone()["total"]

    return {
        "active_jobs": jobs,
        "total_candidates": candidates,
        "interviews_scheduled": interviews,
        "offers_accepted": hired,
    }


@app.get("/jobs")
def list_jobs():
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT id, title, department, job_type, applicants, status,
                   created_at
            FROM jobs ORDER BY id DESC
        """).fetchall()
    return rows


@app.post("/jobs", status_code=201)
def create_job(job: JobCreate):
    with get_connection() as conn:
        row = conn.execute("""
            INSERT INTO jobs (title, department, job_type)
            VALUES (%s, %s, %s)
            RETURNING id, title, department, job_type, applicants, status,
                      created_at
        """, (job.title, job.department, job.job_type)).fetchone()

        conn.execute("""
            INSERT INTO audit_logs (action, entity_type, entity_id, details)
            VALUES (%s, %s, %s, %s)
        """, ("job_created", "job", row["id"], job.title))

    return row


@app.get("/candidates")
def list_candidates():
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT id, name, role, experience, score, status, applied_on, email
            FROM candidates ORDER BY id DESC
        """).fetchall()
    return rows


@app.patch("/candidates/{candidate_id}/status")
def update_candidate_status(
    candidate_id: int,
    update: CandidateStatusUpdate,
):
    if update.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid candidate status")

    with get_connection() as conn:
        row = conn.execute("""
            UPDATE candidates SET status = %s
            WHERE id = %s
            RETURNING id, name, role, experience, score, status, applied_on
        """, (update.status, candidate_id)).fetchone()

        if row is None:
            raise HTTPException(status_code=404, detail="Candidate not found")

        conn.execute("""
            INSERT INTO audit_logs (action, entity_type, entity_id, details)
            VALUES (%s, %s, %s, %s)
        """, (
            "candidate_status_updated",
            "candidate",
            candidate_id,
            update.status,
        ))

    return row


@app.get("/audit-logs")
def list_audit_logs():
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT id, action, entity_type, entity_id, details, created_at
            FROM audit_logs ORDER BY created_at DESC LIMIT 100
        """).fetchall()
    return rows
