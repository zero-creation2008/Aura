# AURA contributor guide

AURA is Flask UI/API -> orchestrator/DAG -> agents -> safety-gated filesystem and verified command runner. Durable task/audit data is in PostgreSQL in production; Redis is reserved for distributed events/jobs/cache. GitHub integration reads live API state and only merges a PR after green checks.

Commands: `python3 -m pytest -q`, `python3 -m py_compile app.py core/*.py agents/*.py github/*.py tools/*.py`. This repository has no `package.json`, so `npm ci`, lint, and build do not apply to AURA itself.

Never place secrets in client responses, source, logs, prompts, audit payloads, or `.env.example`. Mutating/approval/merge APIs require bearer auth outside loopback; validate all JSON. Autonomous changes must stay in the workspace, respect file/byte limits, record audit events, execute detected regression commands, and never claim success without their zero exit code. PR merges require verified GitHub checks/workflows.
