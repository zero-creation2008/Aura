"""Dependency DAG executor with bounded concurrency, retries and cancellation."""
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
from dataclasses import dataclass
@dataclass(frozen=True)
class Step: name: str; run: object; depends_on: tuple=()
def execute(steps, max_parallel=3, retries=0, cancelled=lambda: False):
    pending={s.name:s for s in steps}; results={}; running={}
    with ThreadPoolExecutor(max_workers=max_parallel) as pool:
        while pending or running:
            if cancelled():
                for future in running: future.cancel()
                return {"success":False,"cancelled":True,"results":results}
            ready=[s for s in pending.values() if all(results.get(d,{}).get("success") for d in s.depends_on)]
            blocked=[n for n,s in pending.items() if any(d in results and not results[d].get("success") for d in s.depends_on)]
            for name in blocked: results[name]={"success":False,"error":"dependency failed"}; del pending[name]
            for step in ready[:max_parallel-len(running)]:
                pending.pop(step.name); running[pool.submit(_retry, step.run, retries)]=step.name
            if not running:
                if pending: return {"success":False,"results":results,"error":"dependency cycle"}
                break
            done,_=wait(running, return_when=FIRST_COMPLETED)
            for future in done:
                name=running.pop(future)
                try: results[name]=future.result()
                except Exception as exc: results[name]={"success":False,"error":str(exc)}
    return {"success":all(r.get("success") for r in results.values()),"results":results}
def _retry(fn, retries):
    last=None
    for _ in range(retries+1):
        last=fn()
        if last.get("success"): return last
    return last or {"success":False,"error":"step did not return a result"}
