import httpx
import json
import logging
from typing import List, Dict, Any, Optional
from src.core.interfaces.llm_engine import ILLMEngine
from src.core.entities.cognitive_mode import CognitiveMode
from src.infrastructure.llm.prompt_templates import get_system_prompt

logger = logging.getLogger("cura.llm")

class OllamaClient(ILLMEngine):
    """
    Adapter for Qwen 2.5 1.5B running on Ollama / llama.cpp server.
    Target: Raspberry Pi 4 Model B (4GB RAM) / Laptop.
    """
    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        model_name: str = "qwen2.5:1.5b-instruct",
        timeout_seconds: float = 30.0,
    ):
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self.timeout = timeout_seconds

    async def generate_response(
        self,
        prompt: str,
        mode: CognitiveMode = CognitiveMode.NORMAL,
        history: Optional[List[Dict[str, str]]] = None,
        available_tools: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        system_prompt = get_system_prompt(mode)
        
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.4 if mode == CognitiveMode.ALZHEIMER else 0.7,
                "num_predict": 120,
            }
        }
        if available_tools:
            payload["tools"] = available_tools

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    msg = data.get("message", {})
                    tool_calls = msg.get("tool_calls")
                    if tool_calls and len(tool_calls) > 0:
                        tc = tool_calls[0]
                        func = tc.get("function", {})
                        return {
                            "type": "tool_call",
                            "content": msg.get("content", ""),
                            "tool_name": func.get("name"),
                            "tool_arguments": func.get("arguments", {}),
                        }
                    return {
                        "type": "text",
                        "content": msg.get("content", "").strip(),
                        "tool_name": None,
                        "tool_arguments": None,
                    }
        except Exception as e:
            logger.warning(f"Ollama server unavailable ({e}). Using CURA offline fallback.")

        # Fallback offline simulation for development and testing
        return self._generate_offline_fallback(prompt, mode)

    def _generate_offline_fallback(self, prompt: str, mode: CognitiveMode) -> Dict[str, Any]:
        p_lower = prompt.lower()
        if "طقس" in p_lower or "حرارة" in p_lower:
            return {
                "type": "tool_call",
                "content": "",
                "tool_name": "get_current_weather",
                "tool_arguments": {"city": "Cairo"},
            }
        elif "آخر يومين" in p_lower or "عمل إيه" in p_lower:
            return {
                "type": "tool_call",
                "content": "",
                "tool_name": "get_caregiver_patient_summary",
                "tool_arguments": {"days": 2},
            }
        elif "أخدت" in p_lower and "دوا" in p_lower:
            return {
                "type": "tool_call",
                "content": "",
                "tool_name": "confirm_medication_dose",
                "tool_arguments": {"status": "taken"},
            }

        if mode == CognitiveMode.ALZHEIMER:
            return {
                "type": "text",
                "content": "أهلاً بك يا فندم، أنا معاك وجنبك دائماً. لا تقلق، كل شيء تمام وبخير.",
                "tool_name": None,
                "tool_arguments": None,
            }
        elif mode == CognitiveMode.ADHD:
            return {
                "type": "text",
                "content": "عظيم! خلينا نركز في الخطوة الأولى دلوقتي، ونسيب باقي الشغل لوقته.",
                "tool_name": None,
                "tool_arguments": None,
            }
        return {
            "type": "text",
            "content": f"أهلاً بك، أنا CURA مساعدك الذكي. سمعتك تقول: '{prompt}'. كيف يمكنني مساعدتك؟",
            "tool_name": None,
            "tool_arguments": None,
        }
