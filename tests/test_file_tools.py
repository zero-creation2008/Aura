import sys
import tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config
config.WORKSPACE_DIR = Path(tempfile.mkdtemp())

from tools import file_tools
from core.safety import SafetyViolation


def test_write_and_read_file():
    file_tools.write_file("hello.py", "print('hi')")
    content = file_tools.read_file("hello.py")
    assert content == "print('hi')"


def test_dry_run_does_not_write():
    result = file_tools.write_file("dryrun.py", "x = 1", dry_run=True)
    assert result["applied"] is False
    assert not (config.WORKSPACE_DIR / "dryrun.py").exists()


def test_diff_generated_on_change():
    file_tools.write_file("changeme.py", "a = 1")
    result = file_tools.write_file("changeme.py", "a = 2", dry_run=True)
    assert "a = 1" in result["diff"]
    assert "a = 2" in result["diff"]


def test_blocked_path_raises():
    try:
        file_tools.write_file("../outside.py", "bad")
        assert False, "should have raised"
    except SafetyViolation:
        pass


def test_blocked_extension_raises():
    try:
        file_tools.write_file("virus.exe", "bad")
        assert False, "should have raised"
    except SafetyViolation:
        pass


def test_list_files():
    file_tools.write_file("a.py", "1")
    file_tools.write_file("sub/b.py", "2")
    files = file_tools.list_files()
    assert "a.py" in files
    assert "sub/b.py" in files


def test_delete_file():
    file_tools.write_file("deleteme.py", "x")
    result = file_tools.delete_file("deleteme.py")
    assert result["deleted"] is True
    assert not (config.WORKSPACE_DIR / "deleteme.py").exists()
