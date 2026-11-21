import os
import sys
import asyncio
from dotenv import load_dotenv

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

load_dotenv(os.path.join(backend_root, ".env"))

from src.core.entities.cognitive_mode import CognitiveMode
from src.infrastructure.llm.cloudflare_ai_client import CloudflareWorkersAIClient
from src.infrastructure.database.neon_repository import NeonRepository, DEFAULT_ALZ_PATIENT_ID, DEFAULT_ADHD_PATIENT_ID
from src.infrastructure.tools import create_default_tool_router
from src.presentation.api.dependencies import Container

async def run_verification():
    print("=" * 75)
    print("CURA CLINICAL PIPELINE VERIFICATION")
    print("=" * 75)

    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    api_token = os.getenv("CLOUDFLARE_API_TOKEN")
    model_name = os.getenv("CLOUDFLARE_LLM_MODEL", "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b")

    print(f"Cloudflare Account: {account_id[:8]}... | Model: {model_name}")

    repo = NeonRepository()
    tools = create_default_tool_router(repo)
    client = CloudflareWorkersAIClient(account_id=account_id, api_token=api_token, model_name=model_name)

    # 1. Test Alzheimer Mode Tool Calling: Lookup medications
    print("\n--- [1/3] Testing Alzheimer Cognitive Mode ---")
    alz_prompt = "هو أنا عندي دواء إيه النهاردة يا بنتي؟"
    print(f"Prompt: '{alz_prompt}'")
    tools_schema = tools.get_tool_definitions()

    res_alz = await client.generate_response(
        prompt=alz_prompt,
        mode=CognitiveMode.ALZHEIMER,
        available_tools=tools_schema
    )
    print(f"Response Type: {res_alz.get('type')}")
    if res_alz.get("type") == "tool_call":
        t_name = res_alz.get("tool_name")
        t_args = res_alz.get("tool_arguments", {})
        print(f"  -> Tool Call Detected: {t_name} with args: {t_args}")
        tool_res = await tools.execute_tool(t_name, t_args)
        print(f"  -> Tool Result: {tool_res[:150]}...")
    else:
        print(f"  -> Response: {res_alz.get('content')}")

    # 2. Test ADHD Mode: Task Decomposition
    print("\n--- [2/3] Testing ADHD Cognitive Mode ---")
    adhd_prompt = "عندي تسليم مشروع كبير أوي ومرعوب أبدأ فيه، حاسس إني مشلول"
    print(f"Prompt: '{adhd_prompt}'")
    res_adhd = await client.generate_response(
        prompt=adhd_prompt,
        mode=CognitiveMode.ADHD,
        available_tools=tools_schema
    )
    print(f"Response Type: {res_adhd.get('type')}")
    if res_adhd.get("type") == "tool_call":
        t_name = res_adhd.get("tool_name")
        t_args = res_adhd.get("tool_arguments", {})
        print(f"  -> Tool Call Detected: {t_name} with args: {t_args}")
        tool_res = await tools.execute_tool(t_name, t_args)
        print(f"  -> Tool Result: {tool_res[:150]}...")
    else:
        print(f"  -> Response: {res_adhd.get('content')}")

    # 3. Test Full Container & Neon DB Integration
    print("\n--- [3/3] Testing Neon DB Patient Summary ---")
    container = Container()
    summary = await container.repo.get_patient_summary(DEFAULT_ALZ_PATIENT_ID, days=7)
    print(f"  -> Patient Summary (7 Days):")
    print(f"     Medications Taken: {summary.get('medications_taken')}/{summary.get('medications_total')}")
    print(f"     Confusion Logs (Repeated Questions): {summary.get('repeated_questions_count')}")
    print(f"     ADHD Completed Tasks: {summary.get('tasks_completed')}")
    print(f"     Emergency Events: {summary.get('emergency_events_count')}")

    print("\n" + "=" * 75)
    print("VERIFICATION COMPLETED SUCCESSFULLY!")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_verification())
