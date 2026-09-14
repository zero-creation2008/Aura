"""
AURA - file tools for the coding agent.
Every function here goes through core.safety before touching disk.
"""
import difflib

from core.safety import resolve_workspace_path, check_file_size, SafetyViolation


def read_file(path: str) -> str:
    target = resolve_workspace_path(path)
    if not target.exists():
        raise FileNotFoundError(f"{path} does not exist in workspace")
    ok, reason = check_file_size(target)
    if not ok:
        raise SafetyViolation(reason)
    return target.read_text(errors="replace")


def write_file(path: str, content: str, dry_run: bool = False) -> dict:
    """
    Writes content to path. If dry_run, returns a diff without touching disk
    — used so the orchestrator can show the user what would change before
    auto-applying it.
    """
    target = resolve_workspace_path(path)
    old_content = target.read_text(errors="replace") if target.exists() else ""

    diff = "\n".join(difflib.unified_diff(
        old_content.splitlines(), content.splitlines(),
        fromfile=f"a/{path}", tofile=f"b/{path}", lineterm=""
    ))

    if dry_run:
        return {"path": path, "diff": diff, "applied": False}

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content)
    return {"path": path, "diff": diff, "applied": True}


def delete_file(path: str) -> dict:
    """Deletion is in config.DANGEROUS_ACTIONS — the orchestrator must
    route this through an approval gate before calling it for real."""
    target = resolve_workspace_path(path)
    existed = target.exists()
    if existed:
        target.unlink()
    return {"path": path, "deleted": existed}


def list_files(subdir: str = "") -> list:
    target = resolve_workspace_path(subdir) if subdir else __import__("config").WORKSPACE_DIR
    if not target.exists():
        return []
    out = []
    for p in target.rglob("*"):
        if p.is_file():
            try:
                out.append(str(p.relative_to(__import__("config").WORKSPACE_DIR)))
            except ValueError:
                continue
    return sorted(out)
