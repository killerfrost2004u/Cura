from abc import ABC, abstractmethod
from ..entities.voice_command import SynthesizedAudio
from ..entities.cognitive_mode import CognitiveMode

class ITTSEngine(ABC):
    """
    Port: Text-to-Speech synthesis abstraction (Piper TTS, Coqui, eSpeak).
    """
    @abstractmethod
    async def synthesize(
        self,
        text: str,
        mode: CognitiveMode = CognitiveMode.NORMAL,
        language: str = "ar",
    ) -> SynthesizedAudio:
        """Synthesize spoken audio from text."""
        pass
