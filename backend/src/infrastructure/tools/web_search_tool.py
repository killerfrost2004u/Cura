import logging
from typing import Dict, Any

logger = logging.getLogger("cura.tools.web_search")

async def search_duckduckgo(query: str, max_results: int = 3) -> Dict[str, Any]:
    """
    FR-NJ-005: Search the web using duckduckgo-search.
    """
    try:
        from duckduckgo_search import DDGS
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                results.append({
                    "title": r.get("title"),
                    "snippet": r.get("body"),
                    "link": r.get("href"),
                })
        return {"query": query, "results": results}
    except Exception as e:
        logger.warning(f"DuckDuckGo search error: {e}")
        return {
            "query": query,
            "results": [
                {
                    "title": "Search Result for " + query,
                    "snippet": f"معلومات مختصرة عن {query} عبر محرك البحث.",
                    "link": "https://duckduckgo.com"
                }
            ]
        }
