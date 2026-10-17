from enum import Enum
from dataclasses import dataclass
from typing import Optional

class CognitiveMode(str, Enum):
    """
    Core Adaptive Modes in CURA.
    """
    NORMAL = "normal"          # Phase 1: General Everyday Assistant
    ALZHEIMER = "alzheimer"    # Phase 2A: Memory Care & Low-Complexity Support
    ADHD = "adhd"              # Phase 2B: Focus, Time Estimation & Single Tasking

class LEDRingState(str, Enum):
    """
    Mini CURA WS2812B Hardware Status States (FR-HW-006).
    """
    IDLE = "idle"              # Breathing soft cyan
    LISTENING = "listening"    # Pulsing Blue (#16B9FE)
    PROCESSING = "processing"  # Spinning Green (#10B981)
    SPEAKING = "speaking"      # Glowing Yellow/Amber (#F59E0B)
    EMERGENCY = "emergency"    # Strobing Red (#EF4444)

@dataclass
class ModeConfig:
    mode: CognitiveMode
    speech_rate: float         # 0.8 to 1.2
    max_sentence_length: int   # Token ceiling for replies
    enable_pause_confirm: bool # ADHD safeguard
    high_contrast_ui: bool     # Alzheimer visual requirement
    repetition_patience: bool  # Infinite patience without irritation
    primary_color: str         # Brand hex code

MODE_PROFILES = {
    CognitiveMode.NORMAL: ModeConfig(
        mode=CognitiveMode.NORMAL,
        speech_rate=1.0,
        max_sentence_length=150,
        enable_pause_confirm=False,
        high_contrast_ui=False,
        repetition_patience=False,
        primary_color="#16B9FE",
    ),
    CognitiveMode.ALZHEIMER: ModeConfig(
        mode=CognitiveMode.ALZHEIMER,
        speech_rate=0.88,
        max_sentence_length=60,
        enable_pause_confirm=False,
        high_contrast_ui=True,
        repetition_patience=True,
        primary_color="#3FEDBA",
    ),
    CognitiveMode.ADHD: ModeConfig(
        mode=CognitiveMode.ADHD,
        speech_rate=1.05,
        max_sentence_length=70,
        enable_pause_confirm=True,
        high_contrast_ui=False,
        repetition_patience=False,
        primary_color="#AF6AFB",
    ),
}
