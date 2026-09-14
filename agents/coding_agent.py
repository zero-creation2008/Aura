"""
AURA - Coding Agent.

Loop: inspect repo -> plan -> propose file changes -> (auto-apply if safe,
else request approval) -> run tests -> if failure, diagnose+fix -> repeat,
bounded by config.MAX_ITERATIONS and config.MAX_TASK_SECONDS.

Safety model:
- All file paths go through core.safety (workspace-confined, extension
  allow-list, blocked patterns for secrets/.git/etc).
- Writing/editing files is auto-applied in semi_autonomous/autonomous mode
  IF the path is allowed. Deleting a file always needs approval
  (config.DANGEROUS_ACTIONS), no matter the mode.
- Running tests uses only the pre-approved command whitelist in
  tools.test_runner. Anything else is not run automatically.
"""
import time
import json

import config
from core import llm, db, safety, audit
from tools import file_tools, test_runner


def _propose_changes(task_description: str, existing_files: dict) -> dict:
    """Ask the LLM to propose file changes as structured JSON:
    {"files": [{"path": ..., "content": ...}], "explanation": ...}
    """
    files_context = "\n\n".join(
        f"--- {path} ---\n{content[:3000]}" for path, content in existing_files.items()
    ) or "(workspace is currently empty)"

    prompt = (
        "You are a careful coding agent working inside a sandboxed project workspace.\n"
        f"Task: {task_description}\n\n"
        f"Current files:\n{files_context}\n\n"
        "Respond ONLY with JSON of this exact shape:\n"
        '{"files": [{"path": "relative/path.py", "content": "full file content"}], '
        '"explanation": "short explanation of the change"}\n'
        "Only include files that need to be created or changed. Use relative paths. "
        "Do not include file paths outside the project (no .., no absolute paths)."
    )
    return llm.generate_json(prompt)


def _diagnose_failure(task_description: str, test_output: dict, files: dict) -> dict:
    files_context = "\n\n".join(
        f"--- {path} ---\n{content[:3000]}" for path, content in files.items()
    )
    prompt = (
        f"The following test run failed for this task: {task_description}\n\n"
        f"stdout:\n{test_output.get('stdout', '')}\n\nstderr:\n{test_output.get('stderr', '')}\n\n"
        f"Current files:\n{files_context}\n\n"
        "Diagnose the problem and respond ONLY with JSON of this shape:\n"
        '{"files": [{"path": "relative/path.py", "content": "corrected full file content"}], '
        '"explanation": "what was wrong and how this fixes it"}'
    )
    return llm.generate_json(prompt)


def run(task_id: int, task_description: str) -> dict:
    db.log_activity("coding_task_started", task_description, task_id)
    db.update_task(task_id, status="running")
    start_time = time.time()

    for iteration in range(1, config.MAX_ITERATIONS + 1):
        if time.time() - start_time > config.MAX_TASK_SECONDS:
            db.update_task(task_id, status="failed", result="Task exceeded max time limit.")
            db.log_activity("coding_task_timeout", "", task_id)
            return {"success": False, "error": "max time exceeded"}

        db.log_activity("iteration_start", f"#{iteration}", task_id)

        # 1. inspect repo
        existing_paths = file_tools.list_files()
        existing_files = {}
        for p in existing_paths[:20]:  # cap how much context we pull in
            try:
                existing_files[p] = file_tools.read_file(p)
            except Exception:
                continue

        # 2. plan + propose changes
        try:
            proposal = _propose_changes(task_description, existing_files)
        except llm.LLMUnavailable as e:
            db.update_task(task_id, status="failed", result=str(e))
            return {"success": False, "error": str(e)}

        files_to_write = proposal.get("files", [])
        if len(files_to_write) > config.MAX_CHANGED_FILES:
            db.update_task(task_id, status="failed", result="Proposed file-change limit exceeded.")
            return {"success": False, "error": "file-change limit exceeded"}
        total_bytes = sum(len(str(f.get("content", "")).encode()) for f in files_to_write if isinstance(f, dict))
        if total_bytes > config.MAX_CHANGED_BYTES:
            db.update_task(task_id, status="failed", result="Proposed byte-change limit exceeded.")
            return {"success": False, "error": "byte-change limit exceeded"}
        if not files_to_write:
            db.update_task(task_id, status="failed",
                            result="Model produced no file changes to apply.")
            db.log_activity("coding_task_failed", "no files proposed", task_id)
            return {"success": False, "error": "no files proposed"}

        # 3. apply changes (each path individually safety-checked)
        applied = []
        blocked = []
        for f in files_to_write:
            path, content = f.get("path"), f.get("content", "")
            if not path:
                continue
            allowed, reason = safety.is_path_allowed(path)
            if not allowed:
                blocked.append({"path": path, "reason": reason})
                continue
            result = file_tools.write_file(path, content, dry_run=False)
            applied.append(result)
            audit.record("workspace_write", task_id=task_id, input_data={"path": path, "bytes": len(content.encode())}, outcome={"applied": True}, success=True)

        db.add_task_step(
            task_id, iteration, "apply_changes",
            json.dumps([f["path"] for f in files_to_write]),
            json.dumps({"applied": [a["path"] for a in applied], "blocked": blocked}),
            len(applied) > 0,
        )
        db.log_activity(
            "files_applied",
            f"{len(applied)} applied, {len(blocked)} blocked",
            task_id,
        )
        if blocked:
            db.log_activity("files_blocked", json.dumps(blocked), task_id)

        # 4. run tests
        test_result = test_runner.run_tests()
        db.add_task_step(task_id, iteration, "run_tests", "", json.dumps(test_result), test_result["success"])

        if test_result["success"]:
            db.update_task(
                task_id, status="done",
                result=f"Success after {iteration} iteration(s). {proposal.get('explanation', '')}",
            )
            db.log_activity("coding_task_done", f"iterations={iteration}", task_id)

            return {"success": True, "iterations": iteration, "applied": applied,
                    "verification": test_result}

        # 5. diagnose + fix, then loop again
        db.log_activity("test_failed_diagnosing", "", task_id)
        try:
            fix_proposal = _diagnose_failure(task_description, test_result, existing_files)
        except llm.LLMUnavailable as e:
            db.update_task(task_id, status="failed", result=str(e))
            return {"success": False, "error": str(e)}

        if not fix_proposal.get("files"):
            db.update_task(
                task_id, status="failed",
                result=f"Tests failed and no fix could be generated. Last error:\n{test_result.get('stderr','')[:500]}",
            )
            db.log_activity("coding_task_failed", "no fix generated", task_id)
            return {"success": False, "error": "no fix generated", "test_output": test_result}

        # feed the fix into the next loop iteration by writing it now
        for f in fix_proposal.get("files", []):
            path, content = f.get("path"), f.get("content", "")
            if not path:
                continue
            allowed, reason = safety.is_path_allowed(path)
            if allowed:
                file_tools.write_file(path, content, dry_run=False)

    db.update_task(task_id, status="failed",
                    result=f"Exceeded max iterations ({config.MAX_ITERATIONS}) without passing tests.")
    db.log_activity("coding_task_max_iterations", "", task_id)
    return {"success": False, "error": "max iterations exceeded"}


def request_delete(task_id: int, path: str) -> int:
    """Deletion always requires approval — creates an approval record and
    returns its id instead of deleting immediately."""
    approval_id = db.create_approval(task_id, "delete_file", {"path": path})
    db.log_activity("approval_requested", f"delete_file: {path}", task_id)
    return approval_id


def execute_approved_delete(approval_id: int) -> dict:
    approval = db.get_approval(approval_id)
    if not approval or approval["status"] != "approved":
        raise PermissionError("This delete was not approved.")
    details = json.loads(approval["details"])
    return file_tools.delete_file(details["path"])
