import sys
import tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config
config.DB_PATH = tempfile.mktemp(suffix=".db")

from core import db

db.init_db()


def test_create_and_get_task():
    task_id = db.create_task("test task", agent="test_agent")
    task = db.get_task(task_id)
    assert task["description"] == "test task"
    assert task["status"] == "pending"


def test_update_task_status():
    task_id = db.create_task("another task")
    db.update_task(task_id, status="done", result="ok")
    task = db.get_task(task_id)
    assert task["status"] == "done"
    assert task["result"] == "ok"


def test_task_steps():
    task_id = db.create_task("stepped task")
    db.add_task_step(task_id, 1, "web_search", "query", "results", True)
    steps = db.get_task_steps(task_id)
    assert len(steps) == 1
    assert steps[0]["action"] == "web_search"


def test_approval_flow():
    task_id = db.create_task("delete something")
    approval_id = db.create_approval(task_id, "delete_file", {"path": "foo.py"})
    pending = db.list_pending_approvals()
    assert any(a["id"] == approval_id for a in pending)
    db.resolve_approval(approval_id, True)
    approval = db.get_approval(approval_id)
    assert approval["status"] == "approved"


def test_memory_store_and_search_text():
    db.store_memory("knowledge", "Python is a programming language", topic="python")
    results = db.search_memory(text_query="programming language")
    assert any("programming language" in r["content"] for r in results)


def test_memory_embedding_search():
    db.store_memory("knowledge", "cats are mammals", embedding=[1.0, 0.0, 0.0])
    db.store_memory("knowledge", "cars are vehicles", embedding=[0.0, 1.0, 0.0])
    results = db.search_memory(query_embedding=[0.9, 0.1, 0.0])
    assert results[0]["content"] == "cats are mammals"
