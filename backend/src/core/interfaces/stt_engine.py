from abc import ABC, abstractmethod
from ..entities.voice_command import TranscriptionResult

class ISTTEngine(ABC):
    """
    Port: Speech-to-Text abstraction (Whisper.cpp, Vosk, or Cloud fallback).
    """
    @abstractmethod
    async def transcribe(self, audio_data: bytes, language: str = "ar") -> TranscriptionResult:
        """Transcribe raw audio bytes to text."""
        pass
