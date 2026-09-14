"""
AURA - Research Agent.
Pipeline: query -> search -> fetch top results -> summarize each ->
cross-check -> combined summary -> store in knowledge memory.
"""
from core import llm, db
from core.embeddings import embed
from tools import web_tools


def run(task_id: int, query: str) -> dict:
    db.log_activity("research_started", query, task_id)
    db.update_task(task_id, status="running")

    results = web_tools.web_search(query)
    db.add_task_step(task_id, 1, "web_search", query, str(results), bool(results))

    if not results or "error" in (results[0] if results else {}):
        error = results[0].get("error") if results else "no results"
        db.update_task(task_id, status="failed", result=f"Search failed: {error}")
        db.log_activity("research_failed", str(error), task_id)
        return {"success": False, "error": error}

    sources = []
    for i, r in enumerate(results):
        if not r.get("url"):
            continue
        page = web_tools.fetch_page(r["url"])
        db.add_task_step(task_id, i + 2, "fetch_page", r["url"],
                          str(page)[:500], not bool(page.get("error")))
        if page.get("text"):
            sources.append({"title": r["title"], "url": r["url"], "text": page["text"][:4000]})

    if not sources:
        db.update_task(task_id, status="failed", result="No pages could be fetched.")
        return {"success": False, "error": "no fetchable pages"}

    db.log_activity("summarizing", f"{len(sources)} sources", task_id)

    combined_input = "\n\n---\n\n".join(
        f"SOURCE: {s['title']} ({s['url']})\n{s['text']}" for s in sources
    )
    prompt = (
        f"You are a research assistant. Based ONLY on the sources below, answer this query: "
        f"'{query}'\n\nNote any disagreements between sources. Cite source titles inline.\n\n"
        f"{combined_input}"
    )

    try:
        summary = llm.generate(prompt, temperature=0.2)
    except llm.LLMUnavailable as e:
        db.update_task(task_id, status="failed", result=str(e))
        db.log_activity("research_failed", str(e), task_id)
        return {"success": False, "error": str(e)}

    # store as knowledge memory
    for s in sources:
        db.store_memory(
            kind="knowledge", topic=query, content=s["text"][:2000],
            source=s["url"], embedding=embed(s["text"][:2000]), confidence=0.7,
        )
    db.store_memory(
        kind="knowledge", topic=query, content=summary,
        source="research_agent_summary", embedding=embed(summary), confidence=0.9,
    )

    db.update_task(task_id, status="done", result=summary)
    db.log_activity("research_done", query, task_id)
    return {"success": True, "summary": summary, "sources": [s["url"] for s in sources]}
