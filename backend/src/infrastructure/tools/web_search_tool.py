import logging
import asyncio
import re
from typing import Dict, Any, List
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger("cura.tools.web_search")

def _search_ddgs_sync(query: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Primary search engine using the modern ddgs library."""
    try:
        try:
            from ddgs import DDGS
        except ImportError:
            from duckduckgo_search import DDGS
            
        results = []
        with DDGS() as ddgs:
            raw = list(ddgs.text(query, max_results=max_results))
            for item in raw:
                title = item.get("title", "").strip()
                snippet = item.get("body", "").strip()
                link = item.get("href", "").strip()
                if title or snippet:
                    results.append({
                        "title": title,
                        "snippet": snippet,
                        "link": link,
                    })
        return results
    except Exception as e:
        logger.warning(f"ddgs search error for '{query}': {e}")
        return []

async def _search_html_fallback(query: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Robust fallback search engine parsing DuckDuckGo HTML without third-party API keys."""
    results = []
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
        }
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.post(
                "https://html.duckduckgo.com/html/",
                data={"q": query},
                headers=headers
            )
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                title_anchors = soup.find_all("a", class_="result__a")
                snippet_anchors = soup.find_all("a", class_="result__snippet")

                for i in range(min(len(title_anchors), max_results)):
                    title = title_anchors[i].get_text(strip=True)
                    link = title_anchors[i].get("href", "")
                    snippet = snippet_anchors[i].get_text(strip=True) if i < len(snippet_anchors) else ""

                    if title or snippet:
                        results.append({
                            "title": title,
                            "snippet": snippet,
                            "link": link,
                        })
    except Exception as e:
        logger.error(f"HTML fallback search failed: {e}")
    return results

async def search_duckduckgo(query: str, max_results: int = 4) -> Dict[str, Any]:
    """
    Search the live web for verified facts, medical research, weather, or real-time news.
    Features multi-engine fallback: ddgs (fast primary) -> DuckDuckGo HTML (robust secondary).
    """
    cleaned_query = query.strip()
    if not cleaned_query:
        return {"query": "", "results": [], "summary": "Empty search query."}

    logger.info(f"Executing web search for: '{cleaned_query}'")

    # 1. Attempt primary search in non-blocking worker thread
    results = await asyncio.to_thread(_search_ddgs_sync, cleaned_query, max_results)
    engine_used = "ddgs_primary"

    # 2. Fallback to direct HTTP scraping if primary was blocked or empty
    if not results:
        logger.info(f"Primary ddgs returned empty. Trying HTML fallback for: '{cleaned_query}'")
        results = await _search_html_fallback(cleaned_query, max_results)
        engine_used = "duckduckgo_html_fallback"

    # 3. Relax query if still empty and contains specific narrow years
    if not results and any(y in cleaned_query for y in ["2026", "2025", "2024"]):
        relaxed = re.sub(r"\b(2026|2025|2024)\b", "", cleaned_query).strip()
        if relaxed:
            results = await asyncio.to_thread(_search_ddgs_sync, relaxed, max_results)
            if not results:
                results = await _search_html_fallback(relaxed, max_results)
            if results:
                engine_used = "duckduckgo_relaxed_fallback"

    # 4. Final safety fallback
    if not results:
        results = [
            {
                "title": f"معلومات عن: {cleaned_query}",
                "snippet": f"لم يتم العثور على نتائج مباشرة في الوقت الحالي عن {cleaned_query}. يرجى صياغة السؤال بكلمات مفتاحية مختلفة.",
                "link": "https://duckduckgo.com"
            }
        ]
        engine_used = "safety_fallback"

    # Compile brief preview text for the LLM
    preview_snippets = [f"- {r.get('title', '')}: {r.get('snippet', '')}" for r in results if r.get('snippet')]
    formatted_context = "\n".join(preview_snippets)

    return {
        "query": cleaned_query,
        "total_results": len(results),
        "engine": engine_used,
        "results": results,
        "context_for_llm": formatted_context,
        "guidance": "صغ إجابتك للمستخدم بلغة عربية دافئة وسلسة بالاعتماد على هذه المعلومات المحدثة."
    }
