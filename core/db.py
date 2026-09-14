"""
AURA - SQLite persistence layer.
Replaces Postgres+pgvector from the original spec with SQLite + a simple
cosine-similarity search done in Python, since Termux has no easy pgvector.
Good enough for a single-user local memory store.
"""
import sqlite3
import re
import json
import time
import math
from contextlib import contextmanager

import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',   -- pending, running, done, failed, awaiting_approval
    agent TEXT,
    created_at REAL NOT NULL,
    updated_at REAL NOT NULL,
    result TEXT
);

CREATE TABLE IF NOT EXISTS task_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    step_index INTEGER NOT NULL,
    action TEXT NOT NULL,
    input TEXT,
    output TEXT,
    success INTEGER,
    created_at REAL NOT NULL,
    FOREIGN KEY(task_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
    created_at REAL NOT NULL,
    resolved_at REAL,
    FOREIGN KEY(task_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,           -- short_term, long_term, knowledge
    topic TEXT,
    content TEXT NOT NULL,
    source TEXT,
    embedding TEXT,               -- JSON list of floats
    confidence REAL DEFAULT 1.0,
    created_at REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    event TEXT NOT NULL,
    detail TEXT,
    created_at REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    action TEXT NOT NULL,
    input_data TEXT,
    outcome TEXT,
    success INTEGER NOT NULL,
    previous_hash TEXT NOT NULL,
    event_hash TEXT NOT NULL UNIQUE,
    created_at REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    branch_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    files_changed TEXT,          -- JSON list of relative paths
    tests_passed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, pushed, pr_open, failed
    pr_url TEXT,
    error TEXT,
    created_at REAL NOT NULL,
    updated_at REAL NOT NULL
);
"""


class _PostgresConnection:
    """Small compatibility adapter so the persistence API uses PostgreSQL in production."""
    def __init__(self, conn): self._conn = conn
    @staticmethod
    def _sql(sql): return re.sub(r"\?", "%s", sql)
    def execute(self, sql, params=()): return self._conn.execute(self._sql(sql), params)
    def executescript(self, script):
        for statement in script.split(";"):
            if statement.strip(): self._conn.execute(statement)
    def commit(self): self._conn.commit()
    def close(self): self._conn.close()

@contextmanager
def get_conn():
    if config.DATABASE_URL:
        try:
            import psycopg
            from psycopg.rows import dict_row
        except ImportError as exc:
            raise RuntimeError("DATABASE_URL requires psycopg; install production dependencies") from exc
        conn = _PostgresConnection(psycopg.connect(config.DATABASE_URL, row_factory=dict_row))
    else:
        conn = sqlite3.connect(config.DB_PATH)
        conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    schema = SCHEMA
    if config.DATABASE_URL:
        # SQLite-only identity syntax is converted before the migration runs.
        schema = schema.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "BIGSERIAL PRIMARY KEY")
    with get_conn() as conn:
        conn.executescript(schema)


# ---------- Tasks ----------

def create_task(description: str, agent: str = None) -> int:
    now = time.time()
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO tasks (description, status, agent, created_at, updated_at) VALUES (?, 'pending', ?, ?, ?)",
            (description, agent, now, now),
        )
        return cur.lastrowid


def update_task(task_id: int, **fields):
    if not fields:
        return
    fields["updated_at"] = time.time()
    cols = ", ".join(f"{k} = ?" for k in fields)
    vals = list(fields.values()) + [task_id]
    with get_conn() as conn:
        conn.execute(f"UPDATE tasks SET {cols} WHERE id = ?", vals)


def get_task(task_id: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        return dict(row) if row else None


def list_tasks(limit: int = 50):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def add_task_step(task_id: int, step_index: int, action: str, input_data: str, output: str, success: bool):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO task_steps (task_id, step_index, action, input, output, success, created_at) VALUES (?,?,?,?,?,?,?)",
            (task_id, step_index, action, input_data, output, int(success), time.time()),
        )


def get_task_steps(task_id: int):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM task_steps WHERE task_id = ? ORDER BY step_index", (task_id,)
        ).fetchall()
        return [dict(r) for r in rows]


# ---------- Approvals ----------

def create_approval(task_id: int, action: str, details: dict) -> int:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO approvals (task_id, action, details, status, created_at) VALUES (?,?,?, 'pending', ?)",
            (task_id, action, json.dumps(details), time.time()),
        )
        return cur.lastrowid


def resolve_approval(approval_id: int, approved: bool):
    with get_conn() as conn:
        conn.execute(
            "UPDATE approvals SET status = ?, resolved_at = ? WHERE id = ?",
            ("approved" if approved else "rejected", time.time(), approval_id),
        )


def get_approval(approval_id: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM approvals WHERE id = ?", (approval_id,)).fetchone()
        return dict(row) if row else None


def list_pending_approvals():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM approvals WHERE status = 'pending' ORDER BY created_at"
        ).fetchall()
        return [dict(r) for r in rows]


# ---------- Memory ----------

def store_memory(kind: str, content: str, topic: str = None, source: str = None,
                  embedding: list = None, confidence: float = 1.0) -> int:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO memory (kind, topic, content, source, embedding, confidence, created_at) VALUES (?,?,?,?,?,?,?)",
            (kind, topic, content, source, json.dumps(embedding) if embedding else None,
             confidence, time.time()),
        )
        return cur.lastrowid


def _cosine(a, b):
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def search_memory(query_embedding: list = None, kind: str = None, text_query: str = None, top_k: int = 5):
    """
    If query_embedding is given, ranks by cosine similarity over stored embeddings.
    Falls back to simple substring match on text_query if no embeddings available.
    """
    with get_conn() as conn:
        sql = "SELECT * FROM memory"
        params = []
        if kind:
            sql += " WHERE kind = ?"
            params.append(kind)
        rows = [dict(r) for r in conn.execute(sql, params).fetchall()]

    if query_embedding:
        scored = []
        for r in rows:
            emb = json.loads(r["embedding"]) if r["embedding"] else None
            score = _cosine(query_embedding, emb) if emb else 0.0
            scored.append((score, r))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [r for score, r in scored[:top_k] if score > 0]

    if text_query:
        text_query_l = text_query.lower()
        matches = [r for r in rows if text_query_l in r["content"].lower()]
        return matches[:top_k]

    return rows[:top_k]


def delete_memory(memory_id: int):
    with get_conn() as conn:
        conn.execute("DELETE FROM memory WHERE id = ?", (memory_id,))


# ---------- Activity log ----------

def log_activity(event: str, detail: str = "", task_id: int = None):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO activity_log (task_id, event, detail, created_at) VALUES (?,?,?,?)",
            (task_id, event, detail, time.time()),
        )


def get_activity(limit: int = 100):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


# ---------- Proposals (self-improvement PRs) ----------

def create_proposal(branch_name: str, title: str, description: str = "",
                     files_changed: list = None, task_id: int = None) -> int:
    now = time.time()
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO proposals (task_id, branch_name, title, description, files_changed, "
            "tests_passed, status, created_at, updated_at) VALUES (?,?,?,?,?,0,'pending',?,?)",
            (task_id, branch_name, title, description,
             json.dumps(files_changed or []), now, now),
        )
        return cur.lastrowid


def update_proposal(proposal_id: int, **fields):
    if not fields:
        return
    fields["updated_at"] = time.time()
    cols = ", ".join(f"{k} = ?" for k in fields)
    vals = list(fields.values()) + [proposal_id]
    with get_conn() as conn:
        conn.execute(f"UPDATE proposals SET {cols} WHERE id = ?", vals)


def get_proposal(proposal_id: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM proposals WHERE id = ?", (proposal_id,)).fetchone()
        return dict(row) if row else None


def list_proposals(limit: int = 50):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM proposals ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


# ---------- Append-only audit trail ----------
def append_audit_event(task_id, action, input_data, outcome, success, previous_hash, event_hash, created_at):
    with get_conn() as conn:
        cur = conn.execute("INSERT INTO audit_log (task_id, action, input_data, outcome, success, previous_hash, event_hash, created_at) VALUES (?,?,?,?,?,?,?,?)", (task_id, action, json.dumps(input_data, default=str), json.dumps(outcome, default=str), int(success), previous_hash, event_hash, created_at))
        return cur.lastrowid

def latest_audit_hash():
    with get_conn() as conn:
        row = conn.execute("SELECT event_hash FROM audit_log ORDER BY id DESC LIMIT 1").fetchone()
        return row["event_hash"] if row else None

def list_audit_events(limit=100):
    with get_conn() as conn:
        return [dict(row) for row in conn.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT ?", (limit,)).fetchall()]

def healthcheck():
    try:
        with get_conn() as conn: conn.execute("SELECT 1").fetchone()
        return {"ok": True, "backend": "sqlite-development" if not config.DATABASE_URL else "postgresql"}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}
