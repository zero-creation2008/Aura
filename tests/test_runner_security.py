import json
from pathlib import Path
import config
from tools import test_runner

def test_node_checks_are_real_and_ordered(tmp_path):
    (tmp_path / "package.json").write_text(json.dumps({"scripts":{"lint":"node --check index.js","build":"node --check index.js","test":"node --check index.js"}}))
    (tmp_path / "index.js").write_text("const value = 1;\n")
    result = test_runner.run_project_checks(tmp_path)
    assert result["success"]
    assert [r["cmd"][-1] for r in result["checks"]] == ["lint", "build", "test"]

def test_non_whitelisted_command_is_rejected():
    try: test_runner.run_command(["sh", "-c", "true"])
    except ValueError: return
    assert False
