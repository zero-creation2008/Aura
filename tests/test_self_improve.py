import sys
import tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config
config.DB_PATH = tempfile.mktemp(suffix=".db")
config.GITHUB_TOKEN = ""   # not configured for these tests
config.GITHUB_REPO = ""

from core import db
db.init_db()

from github import self_improve


def test_proposal_created_and_readable():
    proposal_id = db.create_proposal("aura/test-branch", "Test change", "desc", ["foo.py"])
    proposal = db.get_proposal(proposal_id)
    assert proposal["branch_name"] == "aura/test-branch"
    assert proposal["status"] == "pending"


def test_is_configured_false_without_token():
    assert self_improve.is_configured() is False


def test_failed_tests_block_push_and_are_recorded():
    result = self_improve.propose_and_push(
        repo_dir=config.WORKSPACE_DIR,
        title="Should not push",
        description="tests failed",
        changed_paths=["foo.py"],
        test_result={"success": False, "stderr": "boom"},
    )
    assert result["status"] == "failed_tests"
    assert result["tests_passed"] == 0


def test_unconfigured_github_records_error_not_crash():
    result = self_improve.propose_and_push(
        repo_dir=config.WORKSPACE_DIR,
        title="No github configured",
        description="",
        changed_paths=["foo.py"],
        test_result={"success": True},
    )
    assert result["status"] == "error"
    assert "GITHUB_TOKEN" in result["error"]


def test_merge_pull_request_always_in_dangerous_actions():
    # Hard guardrail check: merging must never be removable from this set
    # by config alone — it's the one human checkpoint in the whole pipeline.
    assert "merge_pull_request" in config.DANGEROUS_ACTIONS


def test_slugify_produces_safe_branch_component():
    slug = self_improve._slugify("Fix the login bug!! (urgent)")
    assert " " not in slug
    assert "!" not in slug
    assert "(" not in slug
