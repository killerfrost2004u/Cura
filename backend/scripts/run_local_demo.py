"""
Interactive CLI Demo for CURA AI Pipeline.
Enables instant local testing of all 3 cognitive modes and tool-calling router.
"""
import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.core.entities.cognitive_mode import CognitiveMode
from src.presentation.api.dependencies import get_container

async def main():
    container = get_container()
    print("=" * 65)
    print("CURA Adaptive AI Assistant — Terminal Interactive Demo")
    print("Official Edge AI Architecture Prototype")
    print("=" * 65)
    print("Select Mode:")
    print("  1) Normal CURA (Everyday Assistant)")
    print("  2) Alzheimer's Mode (Patient Care, High Patience, Calming Arabic)")
    print("  3) ADHD Mode (Focus Sprint, Single Task, Pause & Confirm)")
    print("  q) Quit")
    print("-" * 65)

    mode_choice = input("Enter choice (1/2/3): ").strip()
    if mode_choice == "2":
        mode = CognitiveMode.ALZHEIMER
        print("\n>>> ACTIVE MODE: ALZHEIMER CARE MODE (FR-ALZ-001)")
    elif mode_choice == "3":
        mode = CognitiveMode.ADHD
        print("\n>>> ACTIVE MODE: ADHD FOCUS MODE (FR-ADHD-001)")
    else:
        mode = CognitiveMode.NORMAL
        print("\n>>> ACTIVE MODE: NORMAL EVERYDAY CURA (FR-NJ-001)")

    tools_schema = container.tool_router.get_tool_definitions()

    print("\nAsk CURA anything (in Arabic or English). Examples:")
    print(" - 'درجة الحرارة كام في القاهرة؟' (Tool Calling: Weather)")
    print(" - 'عمل إيه آخر يومين؟' (Tool Calling: Caregiver 2-Day Report)")
    print(" - 'أنا أخدت الدواء خلاص' (Tool Calling: Medication Confirm)")
    print(" - 'ابحث عن أحدث علاجات مرض الزهايمر' (Tool Calling: Web Search)")
    print("Type 'exit' to quit.\n")

    while True:
        try:
            user_input = input("You > ").strip()
            if not user_input or user_input.lower() in ["exit", "quit", "q"]:
                print("Exiting CURA demo. Goodbye!")
                break

            print("[Thinking & Reasoning...]")
            llm_res = await container.llm.generate_response(
                prompt=user_input,
                mode=mode,
                available_tools=tools_schema,
            )

            if llm_res.get("type") == "tool_call":
                t_name = llm_res.get("tool_name")
                t_args = llm_res.get("tool_arguments", {})
                print(f"[*] Executing Tool: {t_name} with args: {t_args}")
                tool_res = await container.tool_router.execute_tool(t_name, t_args)
                print(f"[*] Tool Output: {tool_res[:100]}...")

                follow_up = (
                    f"User asked: {user_input}\n"
                    f"Tool '{t_name}' returned: {tool_res}\n"
                    f"Formulate a warm, clear response in Arabic for mode: {mode.value}."
                )
                final_llm = await container.llm.generate_response(prompt=follow_up, mode=mode)
                print(f"CURA > {final_llm.get('content', '')}\n")
            else:
                print(f"CURA > {llm_res.get('content', '')}\n")

        except (KeyboardInterrupt, EOFError):
            print("\nExiting CURA demo.")
            break

if __name__ == "__main__":
    asyncio.run(main())
