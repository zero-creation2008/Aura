"""Evidence-based self-development in an isolated git worktree."""
import shutil, subprocess, tempfile
from pathlib import Path
from tools import test_runner
from core import audit
class SelfDevEngine:
    def __init__(self, source): self.source=Path(source).resolve()
    def source_evidence(self):
        return {str(p.relative_to(self.source)): p.read_text(errors="replace")[:12000] for p in self.source.rglob("*") if p.is_file() and ".git" not in p.parts}
    def run(self, change):
        with tempfile.TemporaryDirectory(prefix="aura-selfdev-") as temporary:
            workspace=Path(temporary)/"work"; shutil.copytree(self.source, workspace, ignore=shutil.ignore_patterns(".git","__pycache__",".pytest_cache"))
            modified=change(workspace, self.source_evidence())
            if not modified: return {"success":False,"error":"proposal made no change"}
            verification=test_runner.run_project_checks(workspace)
            audit.record("self_dev_verification", input_data={"files":modified}, outcome=verification, success=verification["success"])
            if not verification["success"]: return {"success":False,"verified":False,"verification":verification}
            return {"success":True,"verified":True,"workspace":str(workspace),"files":modified,"verification":verification}
