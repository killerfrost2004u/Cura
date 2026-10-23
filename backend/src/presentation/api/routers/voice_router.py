from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from src.core.entities.cognitive_mode import CognitiveMode
from src.presentation.api.dependencies import get_container, Container

router = APIRouter(prefix="/voice", tags=["Voice Interaction"])

class TextInteractionRequest(BaseModel):
    text: str
    mode: CognitiveMode = CognitiveMode.NORMAL
    patient_id: Optional[str] = "patient-001"

@router.post("/interact-text")
async def interact_text(
    req: TextInteractionRequest,
    container: Container = Depends(get_container),
):
    """Direct text query to AI pipeline (useful for GUI testing or silent mode)."""
    tools_schema = container.tool_router.get_tool_definitions()
    
    # Check question repetition if Alzheimer's mode
    repetition_info = None
    if req.mode == CognitiveMode.ALZHEIMER:
        count, is_rep = await container.track_repetition_use_case.execute(
            patient_id=req.patient_id,
            question_text=req.text,
            intent_name="query",
        )
        repetition_info = {"count_last_24h": count, "is_repeated": is_rep}

    llm_res = await container.llm.generate_response(
        prompt=req.text,
        mode=req.mode,
        available_tools=tools_schema,
    )

    executed_tools = []
    final_text = ""

    if llm_res.get("type") == "tool_call":
        t_name = llm_res.get("tool_name")
        t_args = llm_res.get("tool_arguments", {})
        executed_tools.append(t_name)
        tool_res = await container.tool_router.execute_tool(t_name, t_args)

        follow_up = (
            f"User query: {req.text}\n"
            f"Tool '{t_name}' result: {tool_res}\n"
            f"Reply in warm Arabic for mode {req.mode.value}."
        )
        final_llm = await container.llm.generate_response(prompt=follow_up, mode=req.mode)
        final_text = final_llm.get("content", "")
    else:
        final_text = llm_res.get("content", "")

    return {
        "status": "success",
        "data": {
            "user_query": req.text,
            "response_text": final_text,
            "reasoning_content": llm_res.get("reasoning_content", ""),
            "mode": req.mode.value,
            "tools_executed": executed_tools,
            "repetition": repetition_info,
        }
    }

@router.post("/demo-interact")
async def demo_interact(
    audio_file: UploadFile = File(...),
    mode: CognitiveMode = Form(CognitiveMode.NORMAL),
    container: Container = Depends(get_container),
):
    """
    FR-WEB-005: "Try CURA" Web Audio Demo endpoint.
    Receives WebM audio chunk from browser, executes voice pipeline, and returns text and audio response.
    """
    content = await audio_file.read()
    result = await container.voice_interaction_use_case.execute(
        audio_bytes=content,
        mode=mode,
    )
    return {
        "status": "success",
        "data": {
            "transcribed_text": result["user_text"],
            "response_text": result["bot_text"],
            "reasoning_content": result.get("reasoning_content", ""),
            "mode": result["mode"].value,
            "tools_executed": result["tools_executed"],
        }
    }
