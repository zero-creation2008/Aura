"""
AURA - Central configuration.
All tunables live here. Nothing here is a secret; secrets go in .env.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# --- LLM (local, via Ollama) ---
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")  # small model, Termux-friendly
OLLAMA_TIMEOUT = int(os.environ.get("OLLAMA_TIMEOUT", "120"))

# --- Storage ---
# PostgreSQL is the production system of record; SQLite is development/test fallback.
DATABASE_URL = os.environ.get("DATABASE_URL", "")
DB_PATH = os.environ.get("AURA_DB_PATH", str(BASE_DIR / "aura.db"))
REDIS_URL = os.environ.get("REDIS_URL", "")
WORKSPACE_DIR = Path(os.environ.get("AURA_WORKSPACE", str(BASE_DIR / "workspace")))
WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)

# --- Web research ---
# Free, no-key search backend (DuckDuckGo HTML endpoint). Fragile by nature —
# no guarantees on uptime/format, since it isn't an official API.
SEARCH_MAX_RESULTS = 5
FETCH_TIMEOUT = 15
FETCH_MAX_CHARS = 20000  # cap extracted page text so it doesn't blow past context

# --- Coding agent safety policy ---
# Anything matching these patterns is BLOCKED outright, no override.
BLOCKED_PATH_PATTERNS = [
    ".env", ".git/", "id_rsa", ".ssh/", "secrets", "credentials",
]
# File extensions the coding agent is allowed to touch at all.
ALLOWED_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json",
    ".md", ".txt", ".yml", ".yaml", ".sh", ".toml", ".cfg",
}
# Actions that ALWAYS require explicit user approval before running,
# regardless of autonomy mode.
DANGEROUS_ACTIONS = {"delete_file", "run_shell", "install_package", "merge_pull_request"}
# NOTE: git_commit and git_push to a FEATURE BRANCH (never main/master) are not
# in this set — self-improvement can commit+push a branch autonomously, but only
# after tests pass. Merging that branch into main always requires approval, and
# that happens on GitHub itself (reviewing the PR), not through this app.

# --- GitHub self-improvement integration ---
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")          # personal access token, repo scope
GITHUB_REPO = os.environ.get("GITHUB_REPO", "")            # "username/reponame"
GITHUB_BASE_BRANCH = os.environ.get("GITHUB_BASE_BRANCH", "main")
GITHUB_API = "https://api.github.com"

# Max file size the agent will read/write (bytes) — guards against
# accidentally trying to load huge binaries as text.
MAX_FILE_SIZE = 512 * 1024
MAX_CHANGED_FILES = int(os.environ.get("AURA_MAX_CHANGED_FILES", "20"))
MAX_CHANGED_BYTES = int(os.environ.get("AURA_MAX_CHANGED_BYTES", str(2 * 1024 * 1024)))
COMMAND_TIMEOUT = int(os.environ.get("AURA_COMMAND_TIMEOUT", "300"))
MAX_PARALLEL_STEPS = int(os.environ.get("AURA_MAX_PARALLEL_STEPS", "3"))
MAX_RETRIES = int(os.environ.get("AURA_MAX_RETRIES", "2"))

# --- Agent loop limits (prevents runaway loops) ---
MAX_ITERATIONS = int(os.environ.get("AURA_MAX_ITERATIONS", "8"))
MAX_TASK_SECONDS = int(os.environ.get("AURA_MAX_TASK_SECONDS", "300"))

# --- Autonomy mode ---
# manual: everything needs approval
# semi_autonomous (default): safe changes auto-apply, dangerous ones need approval
# autonomous: still enforces DANGEROUS_ACTIONS approval — hard boundary, not user-configurable away
AUTONOMY_MODE = os.environ.get("AURA_AUTONOMY_MODE", "semi_autonomous")

FLASK_HOST = os.environ.get("AURA_HOST", "127.0.0.1")
FLASK_PORT = int(os.environ.get("AURA_PORT", "8787"))
FLASK_DEBUG = os.environ.get("AURA_DEBUG", "0") == "1"

# API access: remote callers must authenticate with this bearer token.
API_TOKEN = os.environ.get("AURA_API_TOKEN", "")
RATE_LIMIT_PER_MINUTE = int(os.environ.get("AURA_RATE_LIMIT_PER_MINUTE", "60"))
