from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def get_health():
    return {
        "status": "online",
        "service": "CURA AI & Backend Orchestrator",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "target_platform": "Raspberry Pi 4 Model B (4GB RAM)",
        "edge_models": {
            "stt": "Whisper.cpp (Q5_0)",
            "llm": "Qwen 2.5 1.5B-Instruct (GGUF Q4_K_M)",
            "tts": "Piper TTS (Arabic)",
        }
    }
