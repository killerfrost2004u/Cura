from typing import Dict, Any, Optional, List
import json
from src.core.entities.cognitive_mode import CognitiveMode, LEDRingState
from src.core.entities.voice_command import TranscriptionResult, SynthesizedAudio
from src.core.interfaces.stt_engine import ISTTEngine
from src.core.interfaces.llm_engine import ILLMEngine
from src.core.interfaces.tts_engine import ITTSEngine
from src.core.interfaces.tool_router import IToolRouter

class ProcessVoiceInteractionUseCase:
    """
    Main Voice Interaction Loop (Clean Architecture Use Case).
    Coordinates STT -> Intent / LLM -> Tool Calling -> TTS.
    """
    def __init__(
        self,
        stt_engine: ISTTEngine,
        llm_engine: ILLMEngine,
        tts_engine: ITTSEngine,
        tool_router: IToolRouter,
    ):
        self._stt = stt_engine
        self._llm = llm_engine
        self._tts = tts_engine
        self._tools = tool_router

    async def execute(
        self,
        audio_bytes: bytes,
        mode: CognitiveMode = CognitiveMode.NORMAL,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        transcription: TranscriptionResult = await self._stt.transcribe(audio_bytes)
        user_text = transcription.text.strip()
        if not user_text:
            return {
                "user_text": "",
                "bot_text": "لم أسمع أي كلام، هل يمكنك الإعادة؟",
                "audio_response": None,
                "mode": mode,
                "tools_executed": [],
            }

        tools_schema = self._tools.get_tool_definitions()

        llm_output = await self._llm.generate_response(
            prompt=user_text,
            mode=mode,
            history=history,
            available_tools=tools_schema,
        )

        executed_tools = []
        bot_response_text = ""

        if llm_output.get("type") == "tool_call":
            tool_name = llm_output.get("tool_name", "")
            tool_args = llm_output.get("tool_arguments", {})
            executed_tools.append(tool_name)

            tool_result_str = await self._tools.execute_tool(tool_name, tool_args)

            follow_up_prompt = (
                f"User asked: {user_text}\n"
                f"Tool '{tool_name}' returned: {tool_result_str}\n"
                f"Formulate a warm, concise conversational response in Arabic for mode: {mode.value}."
            )
            final_llm = await self._llm.generate_response(
                prompt=follow_up_prompt,
                mode=mode,
                history=history,
                available_tools=None,
            )
            bot_response_text = final_llm.get("content", "")
        else:
            bot_response_text = llm_output.get("content", "")

        synthesized_voice: SynthesizedAudio = await self._tts.synthesize(
            text=bot_response_text,
            mode=mode,
        )

        return {
            "user_text": user_text,
            "bot_text": bot_response_text,
            "audio_response": synthesized_voice,
            "mode": mode,
            "tools_executed": executed_tools,
        }
