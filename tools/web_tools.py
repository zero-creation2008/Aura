"""
AURA - web research tools.

Search: uses DuckDuckGo's HTML endpoint (no API key required). This is
scraping a public page, not an official API — it can break if DuckDuckGo
changes their markup, and should not be relied on for high-volume or
mission-critical use.

Fetch: downloads a page and strips it to readable text.
"""
import requests
from bs4 import BeautifulSoup

import config


def web_search(query: str, max_results: int = None) -> list:
    max_results = max_results or config.SEARCH_MAX_RESULTS
    url = "https://html.duckduckgo.com/html/"
    headers = {"User-Agent": "Mozilla/5.0 (AURA research agent)"}
    try:
        r = requests.post(url, data={"q": query}, headers=headers, timeout=config.FETCH_TIMEOUT)
        r.raise_for_status()
    except Exception as e:
        return [{"error": f"search request failed: {e}"}]

    soup = BeautifulSoup(r.text, "html.parser")
    results = []
    for result in soup.select(".result")[:max_results]:
        title_el = result.select_one(".result__a")
        snippet_el = result.select_one(".result__snippet")
        if not title_el:
            continue
        href = title_el.get("href", "")
        results.append({
            "title": title_el.get_text(strip=True),
            "url": href,
            "snippet": snippet_el.get_text(strip=True) if snippet_el else "",
        })
    return results


def fetch_page(url: str) -> dict:
    headers = {"User-Agent": "Mozilla/5.0 (AURA research agent)"}
    try:
        r = requests.get(url, headers=headers, timeout=config.FETCH_TIMEOUT)
        r.raise_for_status()
    except Exception as e:
        return {"url": url, "error": str(e), "text": ""}

    content_type = r.headers.get("Content-Type", "")
    if "text/html" not in content_type and "text/plain" not in content_type:
        return {"url": url, "error": f"unsupported content-type: {content_type}", "text": ""}

    soup = BeautifulSoup(r.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    text = " ".join(soup.get_text(separator=" ").split())
    return {"url": url, "text": text[:config.FETCH_MAX_CHARS], "error": None}
