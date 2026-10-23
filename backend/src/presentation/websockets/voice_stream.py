from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging
import base64
from src.presentation.api.dependencies import get_container
from src.core.entities.cognitive_mode import CognitiveMode

router = APIRouter(tags=["Voice WebSockets"])
logger = logging.getLogger("cura.voice_stream")

@router.websocket("/ws/v1/voice/stream")
async def websocket_voice_stream(websocket: WebSocket):
    """
    Live real-time bidirectional voice streaming over WebSockets.
    Receives raw audio chunks from client microphone, runs Cloudflare Whisper STT
    and Cloudflare DeepSeek-R1 reasoning, and streams back transcription and reasoning thoughts.
    """
    await websocket.accept()
    container = get_container()
    audio_buffer = bytearray()
    current_mode = CognitiveMode.NORMAL

    try:
        await websocket.send_json({
            "event": "CONNECTED",
            "provider": "Cloudflare Workers AI",
            "message": "Connected to CURA Live Voice WebSocket Stream"
        })

        while True:
            message = await websocket.receive()
            
            # Binary frame (raw audio bytes)
            if "bytes" in message and message["bytes"]:
                audio_buffer.extend(message["bytes"])
                continue

            # Text frame (control messages like CONFIG or END_OF_SPEECH)
            if "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                    event = payload.get("event")

                    if event == "SET_MODE":
                        mode_str = payload.get("mode", "normal").lower()
                        if mode_str == "alzheimer":
                            current_mode = CognitiveMode.ALZHEIMER
                        elif mode_str == "adhd":
                            current_mode = CognitiveMode.ADHD
                        else:
                            current_mode = CognitiveMode.NORMAL
                        await websocket.send_json({"event": "MODE_UPDATED", "mode": current_mode.value})

                    elif event == "AUDIO_CHUNK":
                        chunk_b64 = payload.get("audio_b64", "")
                        if chunk_b64:
                            audio_buffer.extend(base64.b64decode(chunk_b64))

                    elif event == "END_OF_SPEECH":
                        if len(audio_buffer) < 100:
                            await websocket.send_json({
                                "event": "EMPTY_AUDIO",
                                "message": "No audible speech detected."
                            })
                            audio_buffer.clear()
                            continue

                        await websocket.send_json({"event": "TRANSCRIBING"})
                        
                        # Execute speech-to-text
                        transcription = await container.stt.transcribe(bytes(audio_buffer))
                        user_text = transcription.text.strip()
                        
                        await websocket.send_json({
                            "event": "TRANSCRIPTION_RESULT",
                            "user_text": user_text,
                            "confidence": transcription.confidence,
                            "duration_seconds": transcription.duration_seconds
                        })

                        if not user_text:
                            audio_buffer.clear()
                            continue

                        await websocket.send_json({"event": "REASONING"})

                        # Execute LLM reasoning
                        llm_res = await container.llm.generate_response(
                            prompt=user_text,
                            mode=current_mode,
                        )

                        await websocket.send_json({
                            "event": "FINAL_RESPONSE",
                            "user_text": user_text,
                            "bot_text": llm_res.get("content", ""),
                            "reasoning_content": llm_res.get("reasoning_content", ""),
                            "provider": llm_res.get("provider", "cloudflare"),
                            "model": llm_res.get("model", ""),
                            "mode": current_mode.value
                        })

                        audio_buffer.clear()

                except json.JSONDecodeError:
                    logger.warning("Received invalid JSON on voice websocket")

    except WebSocketDisconnect:
        logger.info("Voice WebSocket client disconnected")
    except Exception as e:
        logger.error(f"Voice WebSocket stream error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
