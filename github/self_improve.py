"""GitHub integration backed exclusively by real GitHub REST responses."""
import re
import time
from pathlib import Path
import requests
import config
from core import audit, db

class GitHubError(RuntimeError): pass
class GitHubClient:
    def __init__(self, token=None, repo=None, session=None):
        self.token=token if token is not None else config.GITHUB_TOKEN; self.repo=repo if repo is not None else config.GITHUB_REPO; self.session=session or requests.Session()
    @property
    def configured(self): return bool(self.token and self.repo and "/" in self.repo)
    def _request(self, method, path, **kwargs):
        if not self.configured: raise GitHubError("GITHUB_TOKEN and GITHUB_REPO must be configured")
        headers={"Authorization":f"Bearer {self.token}","Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}
        try: response=self.session.request(method, f"{config.GITHUB_API}/repos/{self.repo}{path}", headers=headers, timeout=20, **kwargs)
        except requests.RequestException as exc: raise GitHubError(f"GitHub request failed: {exc}") from exc
        if not response.ok: raise GitHubError(f"GitHub {method} {path} failed ({response.status_code}): {response.text[:500]}")
        return response.json() if response.content else {}
    def repository_state(self): return self._request("GET", "")
    def branches(self): return self._request("GET", "/branches?per_page=100")
    def commits(self, branch=None): return self._request("GET", "/commits" + (f"?sha={branch}" if branch else ""))
    def pull_requests(self, state="open"): return self._request("GET", f"/pulls?state={state}&per_page=100")
    def pull_request(self, number): return self._request("GET", f"/pulls/{int(number)}")
    def checks(self, sha): return self._request("GET", f"/commits/{sha}/check-runs")
    def workflow_runs(self, branch=None): return self._request("GET", "/actions/runs" + (f"?branch={branch}" if branch else ""))
    def create_pr(self, title, body, head, base=None): return self._request("POST", "/pulls", json={"title":title,"body":body,"head":head,"base":base or config.GITHUB_BASE_BRANCH})
    def merge_pr(self, number, expected_sha=None):
        pr=self.pull_request(number); sha=pr["head"]["sha"]
        if expected_sha and sha != expected_sha: raise GitHubError("PR head changed; refusing merge")
        if pr.get("mergeable") is False: raise GitHubError("PR is not mergeable")
        checks=self.checks(sha).get("check_runs", [])
        if not checks or any(c.get("status") != "completed" or c.get("conclusion") != "success" for c in checks):
            raise GitHubError("refusing merge: GitHub checks are not verified green")
        workflows=self.workflow_runs(pr["head"]["ref"]).get("workflow_runs", [])
        latest=[w for w in workflows if w.get("head_sha")==sha]
        if latest and any(w.get("status") != "completed" or w.get("conclusion") != "success" for w in latest): raise GitHubError("refusing merge: workflow run is not green")
        result=self._request("PUT", f"/pulls/{int(number)}/merge", json={"sha":sha,"merge_method":"squash"})
        if not result.get("merged"): raise GitHubError(result.get("message", "GitHub did not merge PR"))
        audit.record("github_merge", input_data={"pr":number,"sha":sha}, outcome={"sha":result.get("sha")}, success=True); return result
def is_configured(): return GitHubClient().configured
def _slugify(title): return re.sub("-+", "-", re.sub("[^a-z0-9]+", "-", title.lower())).strip("-")[:40] or "change"
def open_pull_request(title, body, head_branch):
    data=GitHubClient().create_pr(title, body, head_branch); return {"pr_url":data.get("html_url"),"pr_number":data.get("number"),"head_sha":data.get("head",{}).get("sha")}
def get_repository_state():
    client=GitHubClient()
    if not client.configured: return {"configured":False}
    repo=client.repository_state(); return {"configured":True,"name":repo.get("full_name"),"default_branch":repo.get("default_branch"),"private":repo.get("private"),"updated_at":repo.get("updated_at")}
def merge_pull_request(number, expected_sha=None): return GitHubClient().merge_pr(number, expected_sha)
def propose_and_push(repo_dir, title, description, changed_paths, test_result, task_id=None):
    """Compatibility boundary: records verified failures but never fabricates git output.

    Creating/pushing a commit is owned by an isolated worktree pipeline; this
    legacy entry point cannot claim a push without an actual GitHub response.
    """
    proposal_id = db.create_proposal("aura/" + _slugify(title), title, description, changed_paths, task_id)
    if not test_result.get("success"):
        db.update_proposal(proposal_id, status="failed_tests", error="Tests did not pass; no commit or push attempted.")
        return db.get_proposal(proposal_id)
    if not is_configured():
        db.update_proposal(proposal_id, status="error", error="GITHUB_TOKEN / GITHUB_REPO not configured")
        return db.get_proposal(proposal_id)
    db.update_proposal(proposal_id, status="error", error="Direct push disabled: use isolated SelfDevEngine pipeline.")
    return db.get_proposal(proposal_id)
