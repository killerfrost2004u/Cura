from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, AsyncGenerator
from ..entities.cognitive_mode import CognitiveMode

class ILLMEngine(ABC):
    """
    Port: Language Model Reasoning abstraction (Qwen 2.5 1.5B via Ollama / llama.cpp).
    """
    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        mode: CognitiveMode = CognitiveMode.NORMAL,
        history: Optional[List[Dict[str, str]]] = None,
        available_tools: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Generate response from LLM, returning either text or a tool call request.
        Returns:
            {
                "type": "text" | "tool_call",
                "content": str,
                "tool_name": Optional[str],
                "tool_arguments": Optional[Dict[str, Any]]
            }
        """
        pass
