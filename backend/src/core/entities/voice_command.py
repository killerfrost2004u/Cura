from dataclasses import dataclass
from typing import Optional

@dataclass
class AudioChunk:
    data: bytes
    sample_rate: int = 16000
    channels: int = 1
    duration_ms: int = 0

@dataclass
class TranscriptionResult:
    text: str
    language: str
    confidence: float
    duration_seconds: float
    is_final: bool = True

@dataclass
class SynthesizedAudio:
    audio_bytes: bytes
    format: str = "wav"
    sample_rate: int = 22050
    duration_seconds: float = 0.0
