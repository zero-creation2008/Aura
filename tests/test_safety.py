import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config
from core import safety


def test_blocks_path_traversal():
    allowed, reason = safety.is_path_allowed("../../etc/passwd")
    assert not allowed


def test_blocks_env_file():
    allowed, reason = safety.is_path_allowed(".env")
    assert not allowed


def test_blocks_git_dir():
    allowed, reason = safety.is_path_allowed(".git/config")
    assert not allowed


def test_blocks_disallowed_extension():
    allowed, reason = safety.is_path_allowed("payload.exe")
    assert not allowed


def test_allows_normal_python_file():
    allowed, reason = safety.is_path_allowed("main.py")
    assert allowed, reason


def test_allows_nested_allowed_path():
    allowed, reason = safety.is_path_allowed("src/utils/helper.js")
    assert allowed, reason


def test_dangerous_actions_require_approval():
    assert safety.requires_approval("delete_file")
    assert safety.requires_approval("run_shell")
    # merging is the one human checkpoint in the self-improvement pipeline —
    # pushing a feature branch after tests pass is NOT gated (see github/self_improve.py),
    # but merging that branch into main always is.
    assert safety.requires_approval("merge_pull_request")
    assert not safety.requires_approval("write_file")
    assert not safety.requires_approval("git_push")


def test_resolve_workspace_path_raises_on_violation():
    try:
        safety.resolve_workspace_path("../outside.py")
        assert False, "should have raised"
    except safety.SafetyViolation:
        pass
