from functools import lru_cache
from src.infrastructure.speech.whisper_adapter import WhisperCppAdapter
from src.infrastructure.speech.piper_adapter import PiperTTSAdapter
from src.infrastructure.llm.ollama_client import OllamaClient
from src.infrastructure.tools import create_default_tool_router, ToolRouterImpl
from src.infrastructure.database.in_memory_repository import InMemoryRepository
from src.core.use_cases.process_voice_interaction import ProcessVoiceInteractionUseCase
from src.core.use_cases.handle_emergency_alert import HandleEmergencyAlertUseCase
from src.core.use_cases.summarize_caregiver_log import SummarizeCaregiverLogUseCase
from src.core.use_cases.track_question_repetition import TrackQuestionRepetitionUseCase

class Container:
    def __init__(self):
        self.stt = WhisperCppAdapter()
        self.llm = OllamaClient()
        self.tts = PiperTTSAdapter()
        self.tool_router = create_default_tool_router()
        self.repo = InMemoryRepository()

        # Wire Use Cases
        self.voice_interaction_use_case = ProcessVoiceInteractionUseCase(
            stt_engine=self.stt,
            llm_engine=self.llm,
            tts_engine=self.tts,
            tool_router=self.tool_router,
        )
        self.emergency_use_case = HandleEmergencyAlertUseCase(emergency_repo=self.repo)
        self.summarize_use_case = SummarizeCaregiverLogUseCase(patient_repo=self.repo, llm_engine=self.llm)
        self.track_repetition_use_case = TrackQuestionRepetitionUseCase(patient_repo=self.repo)

@lru_cache()
def get_container() -> Container:
    return Container()
