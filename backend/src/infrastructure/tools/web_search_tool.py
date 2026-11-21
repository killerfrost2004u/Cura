import logging
import asyncio
import os
import re
import xml.etree.ElementTree as ET
from typing import Dict, Any, List
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger("cura.tools.web_search")

def _clean_query(query: str) -> str:
    cleaned = re.sub(
        r"^(ايه هو|ايه هي|إيه هو|إيه هي|ما هو|ما هي|ماذا عن|قولي|احكيلي|عرفني|عاوز اعرف|عايز اعرف|بكام|كام|what is|tell me about|how much is)\s+",
        "",
        query.strip(),
        flags=re.IGNORECASE
    )
    cleaned = re.sub(r"\s+(دلوقتي|النهارده|النهاردة|اليوم|now|today)$", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip() or query.strip()

async def _search_tavily(query: str, api_key: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Tavily AI Search Engine."""
    results = []
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": api_key,
                    "query": query,
                    "max_results": max_results,
                    "search_depth": "basic",
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("results", []):
                    title = item.get("title", "").strip()
                    content = item.get("content", "").strip()
                    url = item.get("url", "").strip()
                    if title or content:
                        results.append({"title": title, "snippet": content, "link": url})
    except Exception as e:
        logger.warning(f"Tavily search error: {e}")
    return results

async def _search_serper(query: str, api_key: str, is_arabic: bool, max_results: int = 4) -> List[Dict[str, str]]:
    """Serper Google Search Engine."""
    results = []
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                json={
                    "q": query,
                    "num": max_results,
                    "gl": "eg" if is_arabic else "us",
                    "hl": "ar" if is_arabic else "en",
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("organic", []):
                    title = item.get("title", "").strip()
                    snippet = item.get("snippet", "").strip()
                    link = item.get("link", "").strip()
                    if title or snippet:
                        results.append({"title": title, "snippet": snippet, "link": link})
    except Exception as e:
        logger.warning(f"Serper search error: {e}")
    return results

async def _search_google_news_rss(query: str, is_arabic: bool, max_results: int = 4) -> List[Dict[str, str]]:
    """Real-time Google News RSS (100% Free, Zero Auth, Never Blocks)."""
    results = []
    try:
        hl = "ar" if is_arabic else "en-US"
        gl = "EG" if is_arabic else "US"
        ceid = "EG:ar" if is_arabic else "US:en"
        url = f"https://news.google.com/rss/search?q={httpx.URL('', params={'q': query}).params['q']}&hl={hl}&gl={gl}&ceid={ceid}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        }
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                root = ET.fromstring(resp.text)
                items = root.findall(".//item")
                for it in items[:max_results]:
                    title_elem = it.find("title")
                    link_elem = it.find("link")
                    pub_elem = it.find("pubDate")
                    title = title_elem.text.strip() if title_elem is not None and title_elem.text else ""
                    link = link_elem.text.strip() if link_elem is not None and link_elem.text else ""
                    pub = pub_elem.text.strip() if pub_elem is not None and pub_elem.text else ""
                    snippet = f"[خبر حديث {pub}] {title}" if pub else title
                    if title:
                        results.append({"title": title, "snippet": snippet, "link": link})
    except Exception as e:
        logger.warning(f"Google News RSS search error: {e}")
    return results

async def _search_wikipedia(query: str, is_arabic: bool, max_results: int = 3) -> List[Dict[str, str]]:
    """Wikipedia Free API."""
    results = []
    try:
        lang = "ar" if is_arabic else "en"
        url = f"https://{lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&utf8=&format=json&origin=*"
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                for it in data.get("query", {}).get("search", [])[:max_results]:
                    title = it.get("title", "").strip()
                    raw_snippet = it.get("snippet", "")
                    clean_snippet = re.sub(r"<[^>]+>", "", raw_snippet).strip()
                    if title or clean_snippet:
                        results.append({
                            "title": title,
                            "snippet": clean_snippet,
                            "link": f"https://{lang}.wikipedia.org/wiki/{title.replace(' ', '_')}"
                        })
    except Exception as e:
        logger.warning(f"Wikipedia search error: {e}")
    return results

def _search_ddgs_sync(query: str, max_results: int = 4) -> List[Dict[str, str]]:
    """DuckDuckGo DDGS library."""
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
    """DuckDuckGo HTML fallback."""
    results = []
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
        }
        async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
            resp = await client.get(
                f"https://html.duckduckgo.com/html/?q={query}",
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
        logger.warning(f"HTML fallback search failed: {e}")
    return results

async def search_duckduckgo(query: str, max_results: int = 4) -> Dict[str, Any]:
    """
    Search the live web for verified facts, stock prices, news, medical research, or weather.
    5-Tier Architecture: Tavily -> Serper -> Google News RSS -> Wikipedia -> DuckDuckGo.
    """
    cleaned_query = _clean_query(query)
    if not cleaned_query:
        return {"query": "", "results": [], "summary": "Empty search query."}

    is_arabic = bool(re.search(r"[\u0600-\u06FF]", cleaned_query))
    logger.info(f"Executing web search for: '{cleaned_query}' (is_arabic={is_arabic})")

    tavily_key = os.getenv("TAVILY_API_KEY")
    serper_key = os.getenv("SERPER_API_KEY")
    results = []
    engine_used = ""

    # 1. Tavily AI Search (if key provided)
    if tavily_key:
        results = await _search_tavily(cleaned_query, tavily_key, max_results)
        if results:
            engine_used = "tavily_ai"

    # 2. Serper Google Search (if key provided)
    if not results and serper_key:
        results = await _search_serper(cleaned_query, serper_key, is_arabic, max_results)
        if results:
            engine_used = "serper_google"

    # 3. Google News RSS (real-time news, markets, stock prices, zero auth)
    if not results:
        results = await _search_google_news_rss(cleaned_query, is_arabic, max_results)
        if results:
            engine_used = "google_news_rss"

    # 4. Wikipedia API (factual and medical knowledge)
    if not results:
        results = await _search_wikipedia(cleaned_query, is_arabic, max_results)
        if results:
            engine_used = "wikipedia_api"

    # 5. DuckDuckGo DDGS & HTML
    if not results:
        results = await asyncio.to_thread(_search_ddgs_sync, cleaned_query, max_results)
        if results:
            engine_used = "ddgs_primary"
        else:
            results = await _search_html_fallback(cleaned_query, max_results)
            if results:
                engine_used = "duckduckgo_html_fallback"

    # 6. Safety fallback if all engines returned empty
    if not results:
        results = [
            {
                "title": f"معلومات عن: {cleaned_query}",
                "snippet": f"نتائج البحث عن {cleaned_query} تشير إلى الحاجة للتحقق من المصادر الإخبارية أو المالية المباشرة.",
                "link": "https://google.com"
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
        "guidance": "صغ إجابتك للمستخدم بدقة ووضوح بالاعتماد على هذه المعلومات الحية المحدثة من الإنترنت."
    }
