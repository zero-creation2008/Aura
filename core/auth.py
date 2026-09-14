"""Authentication, request validation, and lightweight rate limiting."""
import hmac
import time
from collections import defaultdict, deque
from functools import wraps
from flask import jsonify, request
import config

_requests = defaultdict(deque)
def _client_key():
    return request.headers.get("X-Forwarded-For", request.remote_addr or "unknown").split(",")[0].strip()
def _limited():
    now = time.monotonic(); bucket = _requests[_client_key()]
    while bucket and bucket[0] <= now - 60: bucket.popleft()
    if len(bucket) >= config.RATE_LIMIT_PER_MINUTE: return True
    bucket.append(now); return False
def require_api_token(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if _limited(): return jsonify({"error": "rate limit exceeded"}), 429
        supplied = request.headers.get("Authorization", "").removeprefix("Bearer ")
        local = _client_key() in {"127.0.0.1", "::1", "localhost"}
        if not config.API_TOKEN and local: return view(*args, **kwargs)
        if not config.API_TOKEN or not hmac.compare_digest(supplied, config.API_TOKEN):
            return jsonify({"error": "authentication required"}), 401
        return view(*args, **kwargs)
    return wrapped
def json_object(required=()):
    data = request.get_json(silent=True)
    if not isinstance(data, dict): return None, (jsonify({"error":"JSON object required"}), 400)
    missing = [key for key in required if key not in data]
    if missing: return None, (jsonify({"error":"missing fields: " + ", ".join(missing)}), 400)
    return data, None
