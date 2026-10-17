from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging
from src.presentation.websockets.connection_manager import manager
from src.core.entities.cognitive_mode import LEDRingState

router = APIRouter(tags=["Hardware WebSockets"])
logger = logging.getLogger("cura.hardware_stream")

@router.websocket("/ws/v1/hardware/stream")
async def websocket_hardware_stream(websocket: WebSocket):
    """
    FR-HW-006 & FR-HW-007: Real-time hardware synchronization stream.
    Synchronizes Mini CURA LED ring animations and 4" screen status cards.
    """
    await manager.connect(websocket)
    try:
        # Send initial handshake state
        await websocket.send_json({
            "event": "HANDSHAKE",
            "payload": {
                "system": "CURA Edge AI",
                "led_state": LEDRingState.IDLE.value,
                "color_hex": "#16B9FE",
                "message": "Connected to CURA Hardware Bridge",
            }
        })

        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                event_type = msg.get("event")
                if event_type == "BUTTON_PRESS":
                    # Hardware emergency button notification
                    await manager.broadcast({
                        "event": "EMERGENCY_TRIGGERED",
                        "payload": {"source": "hardware_button", "led_state": LEDRingState.EMERGENCY.value}
                    })
            except Exception as e:
                logger.error(f"Error handling WS frame: {e}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
