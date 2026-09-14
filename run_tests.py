"""
Minimal test runner for environments without pytest installed.
Discovers test_*.py files in tests/, runs every function starting with
test_, reports pass/fail. Same test files work with real pytest too.
"""
import sys
import traceback
import importlib.util
from pathlib import Path

TESTS_DIR = Path(__file__).parent / "tests"


def run_file(path: Path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    mod = importlib.util.module_from_spec(spec)
    passed, failed = 0, []
    try:
        spec.loader.exec_module(mod)
    except Exception as e:
        print(f"  MODULE LOAD ERROR: {e}")
        traceback.print_exc()
        return 0, [("<module load>", str(e))]

    for name in dir(mod):
        if name.startswith("test_") and callable(getattr(mod, name)):
            try:
                getattr(mod, name)()
                passed += 1
                print(f"  PASS  {name}")
            except AssertionError as e:
                failed.append((name, str(e)))
                print(f"  FAIL  {name}: {e}")
            except Exception as e:
                failed.append((name, str(e)))
                print(f"  ERROR {name}: {e}")
    return passed, failed


def main():
    total_passed = 0
    total_failed = []
    for test_file in sorted(TESTS_DIR.glob("test_*.py")):
        print(f"\n{test_file.name}")
        p, f = run_file(test_file)
        total_passed += p
        total_failed.extend(f)

    print(f"\n{'='*40}")
    print(f"{total_passed} passed, {len(total_failed)} failed")
    if total_failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
