import os
import sys
import asyncio
import json
from dotenv import load_dotenv

backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

load_dotenv(os.path.join(backend_root, ".env"))

from src.core.entities.cognitive_mode import CognitiveMode
from src.infrastructure.tools import create_default_tool_router
from src.infrastructure.database.neon_repository import NeonRepository
from src.presentation.api.dependencies import Container

async def test_search():
    print("=" * 75)
    print("TESTING CURA WEB SEARCH INTEGRATION")
    print("=" * 75)

    repo = NeonRepository()
    router = create_default_tool_router(repo)

    # 1. Direct tool execution
    print("\n[1/2] Testing execute_tool('search_web')...")
    query = "مرض الزهايمر أحدث الأبحاث"
    raw_res = await router.execute_tool("search_web", {"query": query})
    data = json.loads(raw_res)
    assert data["status"] == "success", "Tool execution failed"
    search_data = data["data"]
    print(f"Engine: {search_data.get('engine')}")
    print(f"Results Count: {search_data.get('total_results')}")
    for idx, r in enumerate(search_data.get("results", [])[:3], 1):
        print(f"  {idx}. {r.get('title')}")
        print(f"     {r.get('snippet')[:90]}...")
        print(f"     Link: {r.get('link')}")

    # 2. Testing End-to-End LLM Tool-Calling Pipeline with Web Search
    print("\n[2/2] Testing End-to-End Voice Interaction with Web Search...")
    container = Container()
    
    # Send a prompt explicitly asking to search the web
    prompt = "ابحث على الإنترنت عن أحدث علاج للزهايمر ولخصلي النتائج باختصار"
    print(f"User Prompt: '{prompt}'")

    tools_schema = container.tool_router.get_tool_definitions()
    llm_res = await container.llm.generate_response(
        prompt=prompt,
        mode=CognitiveMode.NORMAL,
        available_tools=tools_schema
    )
    
    print(f"LLM First Pass Type: {llm_res.get('type')}")
    if llm_res.get("type") == "tool_call":
        t_name = llm_res.get("tool_name")
        t_args = llm_res.get("tool_arguments", {})
        print(f"  -> Model triggered tool: '{t_name}' with args: {t_args}")
        tool_output = await container.tool_router.execute_tool(t_name, t_args)
        
        # Follow-up formulation
        follow_up = (
            f"User query: {prompt}\n"
            f"Web search results: {tool_output}\n"
            f"Please synthesize a clear, helpful, accurate answer in Arabic based strictly on these search results."
        )
        final_res = await container.llm.generate_response(prompt=follow_up, mode=CognitiveMode.NORMAL)
        print("\nFinal Synthesized Answer:")
        print(final_res.get("content"))
    else:
        print("Model answered directly:")
        print(llm_res.get("content"))

    print("\n" + "=" * 75)
    print("WEB SEARCH TEST COMPLETED")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(test_search())
