import httpx
import json
import logging
import re
from typing import List, Dict, Any, Optional
from src.core.interfaces.llm_engine import ILLMEngine
from src.core.entities.cognitive_mode import CognitiveMode
from src.infrastructure.llm.prompt_templates import get_system_prompt

logger = logging.getLogger("cura.cloudflare_llm")

class CloudflareWorkersAIClient(ILLMEngine):
    """
    Adapter for Cloudflare Workers AI Serverless Cloud GPUs.
    Supports reasoning models (DeepSeek-R1 Distill 32B) and fast models (Qwen 2.5 7B).
    Extracts and audits internal <think> traces while returning clean, concise speech responses.
    """
    def __init__(
        self,
        account_id: Optional[str] = None,
        api_token: Optional[str] = None,
        model_name: str = "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
        timeout_seconds: float = 35.0,
    ):
        self.account_id = account_id
        self.api_token = api_token
        self.model_name = model_name
        self.timeout = timeout_seconds
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/ai/run/{self.model_name}"

    async def generate_response(
        self,
        prompt: str,
        mode: CognitiveMode = CognitiveMode.NORMAL,
        history: Optional[List[Dict[str, str]]] = None,
        available_tools: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Execute inference on Cloudflare Workers AI GPU cluster.
        Extracts multi-step reasoning thoughts and formats sanitized response.
        """
        # Fallback check if credentials are unconfigured (e.g. offline dev/mock test)
        if not self.account_id or not self.api_token or "your_" in self.account_id:
            logger.warning("Cloudflare credentials missing. Operating in fallback mock mode.")
            return self._mock_fallback(prompt, mode)

        system_prompt = get_system_prompt(mode)
        
        # Optimize prompt for Alzheimer's / ADHD to ensure reasoning remains snappy (< 2.5s)
        if mode in [CognitiveMode.ALZHEIMER, CognitiveMode.ADHD]:
            speed_guideline = "\n[REASONING GUIDELINE: Keep internal <think> step brief (under 3 lines) so the patient gets an immediate answer without waiting]."
            system_prompt += speed_guideline

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }

        # Payload optimized for Cloudflare Workers AI
        payload: Dict[str, Any] = {
            "messages": messages,
            "max_tokens": 512 if mode == CognitiveMode.NORMAL else 256,
            "temperature": 0.3 if mode == CognitiveMode.ALZHEIMER else 0.6,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(self.base_url, headers=headers, json=payload)
                
                if res.status_code == 200:
                    data = res.json()
                    result = data.get("result", {})
                    raw_text = result.get("response", "").strip()
                    
                    return self._process_reasoning_output(raw_text, available_tools)
                else:
                    logger.error(f"Cloudflare Workers AI returned status {res.status_code}: {res.text}")
                    return self._mock_fallback(prompt, mode, error=f"HTTP {res.status_code}")

        except Exception as e:
            logger.error(f"Cloudflare Workers AI request failed: {e}")
            return self._mock_fallback(prompt, mode, error=str(e))

    def _process_reasoning_output(self, raw_text: str, available_tools: Optional[List[Dict[str, Any]]]) -> Dict[str, Any]:
        """
        Extracts <think>...</think> reasoning traces and cleans final speech output.
        """
        reasoning_content = ""
        clean_content = raw_text

        # Extract explicit <think> block if present
        think_match = re.search(r"<think>(.*?)</think>", raw_text, re.DOTALL)
        if think_match:
            reasoning_content = think_match.group(1).strip()
            clean_content = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()
        else:
            # Check for implicit self-correction thinking traces
            if "Wait, that's not correct" in raw_text or "Let me correct myself" in raw_text:
                parts = raw_text.split("The correct way", 1)
                if len(parts) == 2:
                    reasoning_content = parts[0].strip()
                    clean_content = "The correct way" + parts[1]

        # Check for JSON tool calls in the output if tools are active
        if available_tools and ("{" in clean_content and "}" in clean_content):
            try:
                json_match = re.search(r"\{.*\}", clean_content, re.DOTALL)
                if json_match:
                    tool_json = json.loads(json_match.group(0))
                    if "tool" in tool_json or "name" in tool_json:
                        return {
                            "type": "tool_call",
                            "content": clean_content,
                            "reasoning_content": reasoning_content,
                            "tool_name": tool_json.get("tool") or tool_json.get("name"),
                            "tool_arguments": tool_json.get("parameters") or tool_json.get("arguments", {}),
                            "provider": "cloudflare_workers_ai",
                            "model": self.model_name
                        }
            except Exception:
                pass

        return {
            "type": "text",
            "content": clean_content,
            "reasoning_content": reasoning_content,
            "provider": "cloudflare_workers_ai",
            "model": self.model_name
        }

    def _mock_fallback(self, prompt: str, mode: CognitiveMode, error: Optional[str] = None) -> Dict[str, Any]:
        """Graceful deterministic fallback when offline or error occurs."""
        if mode == CognitiveMode.ALZHEIMER:
            fallback = "أهلاً بك يا فندم. أنا معك دائماً. كيف أستطيع مساعدتك والاطمئنان عليك الآن؟"
        elif mode == CognitiveMode.ADHD:
            fallback = "أهلاً بك! دعنا نركز على أهم خطوة لديك اليوم. ما هي أول مهمة سنبدأ بها معاً؟"
        else:
            fallback = "مرحباً بك، أنا CURA مساعدك الذكي التكيفي. كيف يمكنني خدمتك اليوم؟"

        return {
            "type": "text",
            "content": fallback,
            "reasoning_content": f"Safety fallback triggered. Details: {error or 'Mode fallback'}",
            "provider": "cloudflare_workers_ai_fallback",
            "model": self.model_name
        }
