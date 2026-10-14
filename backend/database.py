import os
import time
import psycopg
from psycopg.rows import dict_row

DB_NAME = os.getenv("DB_NAME", "recruitment_db")
DB_USER = os.getenv("DB_USER", os.getenv("USER", "postgres"))
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_PASSWORD = os.getenv("DB_PASSWORD", "")


def get_connection():
    connect_kwargs = {
        "dbname": DB_NAME,
        "user": DB_USER,
        "host": DB_HOST,
        "port": DB_PORT,
        "row_factory": dict_row,
    }
    if DB_PASSWORD:
        connect_kwargs["password"] = DB_PASSWORD
    return psycopg.connect(**connect_kwargs)


def initialize_database(max_retries=10, retry_delay=2):
    for attempt in range(1, max_retries + 1):
        try:
            with get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS jobs (
                            id SERIAL PRIMARY KEY,
                            title VARCHAR(200) NOT NULL,
                            department VARCHAR(100) NOT NULL,
                            job_type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
                            applicants INTEGER NOT NULL DEFAULT 0,
                            status VARCHAR(30) NOT NULL DEFAULT 'Active',
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                        )
                    """)

                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS candidates (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(150) NOT NULL,
                            role VARCHAR(200) NOT NULL,
                            experience VARCHAR(50) NOT NULL DEFAULT 'Not specified',
                            score INTEGER NOT NULL DEFAULT 0
                                CHECK (score BETWEEN 0 AND 100),
                            status VARCHAR(30) NOT NULL DEFAULT 'Applied',
                            applied_on DATE NOT NULL DEFAULT CURRENT_DATE,
                            email VARCHAR(255) UNIQUE,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                        )
                    """)

                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS audit_logs (
                            id SERIAL PRIMARY KEY,
                            action VARCHAR(100) NOT NULL,
                            entity_type VARCHAR(50) NOT NULL,
                            entity_id INTEGER,
                            details TEXT,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                        )
                    """)

                    cur.execute("SELECT COUNT(*) AS total FROM jobs")
                    if cur.fetchone()["total"] == 0:
                        cur.executemany("""
                            INSERT INTO jobs
                            (title, department, job_type, applicants, status)
                            VALUES (%s, %s, %s, %s, %s)
                        """, [
                            ("Senior React Developer", "Engineering", "Full-time", 48, "Active"),
                            ("Machine Learning Engineer", "AI & Data", "Full-time", 36, "Active"),
                            ("Product Designer", "Design", "Remote", 24, "Active"),
                            ("Backend Developer", "Engineering", "Full-time", 19, "Active"),
                        ])

                    cur.execute("SELECT COUNT(*) AS total FROM candidates")
                    if cur.fetchone()["total"] == 0:
                        cur.executemany("""
                            INSERT INTO candidates
                            (name, role, experience, score, status, applied_on)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, [
                            ("Aarav Sharma", "Senior React Developer", "5 years", 94, "Shortlisted", "2026-10-14"),
                            ("Priya Nair", "Machine Learning Engineer", "3 years", 89, "Interview", "2026-10-13"),
                            ("Rahul Mehta", "Backend Developer", "4 years", 86, "Screening", "2026-10-13"),
                            ("Ananya Iyer", "UI/UX Designer", "2 years", 82, "Applied", "2026-10-12"),
                            ("Vikram Patel", "Data Analyst", "3 years", 78, "Applied", "2026-10-11"),
                        ])

                    cur.execute("SELECT COUNT(*) AS total FROM audit_logs")
                    if cur.fetchone()["total"] == 0:
                        cur.executemany("""
                            INSERT INTO audit_logs
                            (action, entity_type, entity_id, details)
                            VALUES (%s, %s, %s, %s)
                        """, [
                            ("job_created", "job", 1, "Role created: Senior React Developer (Engineering)"),
                            ("job_created", "job", 2, "Role created: Machine Learning Engineer (AI & Data)"),
                            ("candidate_status_updated", "candidate", 1, "Status updated to Shortlisted (AI Match: 94%)"),
                            ("candidate_status_updated", "candidate", 2, "Status updated to Interview (AI Match: 89%)"),
                            ("candidate_status_updated", "candidate", 3, "Status updated to Screening (AI Match: 86%)"),
                        ])

                conn.commit()
            print("Database initialized and verified successfully.")
            return
        except Exception as e:
            print(f"PostgreSQL connection attempt {attempt}/{max_retries} failed: {e}")
            if attempt == max_retries:
                raise e
            time.sleep(retry_delay)


