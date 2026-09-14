"""Append-only, hash-chained autonomous-execution audit trail."""
import hashlib, json, time
from core import db
def record(action, *, task_id=None, input_data=None, outcome=None, success=False):
    previous = db.latest_audit_hash() or ""
    payload = json.dumps({"action":action,"input":input_data,"outcome":outcome,"success":bool(success),"previous":previous}, sort_keys=True, default=str)
    digest = hashlib.sha256(payload.encode()).hexdigest()
    return db.append_audit_event(task_id, action, input_data, outcome, bool(success), previous, digest, time.time())
