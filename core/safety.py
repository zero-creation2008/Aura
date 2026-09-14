"""
AURA - safety policy enforcement.

This is the one module every risky action MUST pass through. Nothing in
the agents talks to the filesystem, shell, or git directly without going
through here first.

Design: allow-list, not block-list, wherever possible. Dangerous actions
ALWAYS require approval, regardless of autonomy mode — that boundary is
not configurable via .env or the UI, by design.
"""
from pathlib import Path

import config


class SafetyViolation(Exception):
    pass


def is_path_allowed(path: str) -> tuple[bool, str]:
    """
    Checks a target path against the workspace boundary, blocked patterns,
    and allowed extensions. Returns (allowed, reason_if_not).
    """
    try:
        target = (config.WORKSPACE_DIR / path).resolve()
    except Exception as e:
        return False, f"invalid path: {e}"

    # must stay inside the workspace directory (no ../.. escapes)
    try:
        target.relative_to(config.WORKSPACE_DIR.resolve())
    except ValueError:
        return False, "path escapes the workspace directory"

    path_str = str(target)
    for pattern in config.BLOCKED_PATH_PATTERNS:
        if pattern in path_str:
            return False, f"path matches blocked pattern '{pattern}'"

    if target.suffix and target.suffix not in config.ALLOWED_EXTENSIONS:
        return False, f"extension '{target.suffix}' is not in the allowed list"

    return True, ""


def requires_approval(action: str) -> bool:
    """Hard boundary: these actions ALWAYS need human approval."""
    return action in config.DANGEROUS_ACTIONS


def check_file_size(path: Path) -> tuple[bool, str]:
    if path.exists() and path.stat().st_size > config.MAX_FILE_SIZE:
        return False, f"file exceeds max size ({config.MAX_FILE_SIZE} bytes)"
    return True, ""


def resolve_workspace_path(path: str) -> Path:
    """Raises SafetyViolation if the path isn't allowed; otherwise returns
    the resolved absolute Path inside the workspace."""
    allowed, reason = is_path_allowed(path)
    if not allowed:
        raise SafetyViolation(f"Blocked: {reason} (path={path!r})")
    return (config.WORKSPACE_DIR / path).resolve()
