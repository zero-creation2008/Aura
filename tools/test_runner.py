"""Verified command execution for workspace projects."""
import json
import os
import subprocess
import time
from pathlib import Path
import config
from core import audit

SAFE_TEST_COMMANDS = [["python3", "-m", "pytest"], ["python3", "-m", "unittest"], ["npm", "test"], ["npm", "run", "test"], ["npm", "run", "lint"], ["npm", "run", "build"], ["node", "--check"]]
def detect_project_type(workspace=None):
    root = Path(workspace or config.WORKSPACE_DIR)
    if (root / "package.json").is_file(): return "node"
    if any(root.rglob("*.py")) or (root / "requirements.txt").is_file(): return "python"
    return "unknown"
def _allowed(cmd): return any(cmd[:len(prefix)] == prefix for prefix in SAFE_TEST_COMMANDS)
def run_command(cmd, timeout=None, workspace=None, task_id=None):
    if not isinstance(cmd, list) or not cmd or not _allowed(cmd):
        raise ValueError("command is not an approved test/build command")
    root = Path(workspace or config.WORKSPACE_DIR).resolve()
    timeout = min(int(timeout or config.COMMAND_TIMEOUT), config.COMMAND_TIMEOUT)
    started = time.monotonic()
    try:
        result = subprocess.run(cmd, cwd=str(root), capture_output=True, text=True, timeout=timeout, env={**os.environ, "CI":"true"})
        outcome = {"cmd":cmd,"returncode":result.returncode,"stdout":result.stdout[-8000:],"stderr":result.stderr[-8000:],"duration_seconds":round(time.monotonic()-started, 3),"timed_out":False}
    except subprocess.TimeoutExpired as exc:
        outcome = {"cmd":cmd,"returncode":None,"stdout":(exc.stdout or "")[-8000:],"stderr":((exc.stderr or "") + "\ncommand timed out")[-8000:],"duration_seconds":round(time.monotonic()-started, 3),"timed_out":True}
    except FileNotFoundError as exc:
        outcome = {"cmd":cmd,"returncode":None,"stdout":"","stderr":str(exc),"duration_seconds":round(time.monotonic()-started,3),"timed_out":False}
    outcome["success"] = outcome["returncode"] == 0 and not outcome["timed_out"]
    audit.record("command_execution", task_id=task_id, input_data={"cmd":cmd,"cwd":str(root)}, outcome={k:outcome[k] for k in ("returncode","duration_seconds","timed_out")}, success=outcome["success"])
    return outcome
def _node_commands(root):
    try: scripts = json.loads((root / "package.json").read_text()).get("scripts", {})
    except (OSError, json.JSONDecodeError): return []
    commands=[]
    for name in ("lint", "build", "test"):
        if name in scripts: commands.append(["npm", "run", name])
    return commands
def run_project_checks(workspace=None, task_id=None):
    root=Path(workspace or config.WORKSPACE_DIR); kind=detect_project_type(root)
    commands = _node_commands(root) if kind == "node" else ([ ["python3","-m","pytest"] ] if kind == "python" else [])
    if not commands: return {"success":False,"checks":[],"error":"no recognized regression command"}
    checks=[]
    for command in commands:
        result=run_command(command, workspace=root, task_id=task_id); checks.append(result)
        if not result["success"]: return {"success":False,"checks":checks,"error":"regression command failed"}
    return {"success":True,"checks":checks}
def run_tests():
    result=run_project_checks()
    if result["checks"]: return result["checks"][-1] | {"success":result["success"]}
    return {"cmd":None,"returncode":None,"stdout":"","stderr":result["error"],"success":False}
def run_arbitrary_shell(cmd, timeout=60):
    raise PermissionError("arbitrary shell execution is disabled; expose a reviewed command explicitly")
