import pytest
import asyncio
import os
from unittest.mock import AsyncMock, patch, MagicMock
from src.core.entities.cognitive_mode import CognitiveMode
from src.infrastructure.llm.cloudflare_ai_client import CloudflareWorkersAIClient
from src.infrastructure.speech.cloudflare_whisper_adapter import CloudflareWhisperAdapter
from src.presentation.api.dependencies import Container

def test_cloudflare_llm_reasoning_extraction():
    async def _run():
        client = CloudflareWorkersAIClient(
            account_id="mock_acc",
            api_token="mock_tok",
            model_name="@cf/deepseek-ai/deepseek-r1-distill-qwen-32b"
        )

        mock_raw_response = (
            "<think>\n"
            "1. Patient is asking about blood pressure medication.\n"
            "2. Check dosage interval: 4 hours.\n"
            "3. Keep tone calm and clear for Alzheimer's.\n"
            "</think>\n"
            "نعم يا فندم، حضرتك تناولت دواء الضغط الساعة 9 صباحاً."
        )

        mock_http_response = MagicMock()
        mock_http_response.status_code = 200
        mock_http_response.json.return_value = {
            "result": {"response": mock_raw_response},
            "success": True
        }

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_http_response

            res = await client.generate_response(
                prompt="أنا أخدت دواء الضغط ولا لسه؟",
                mode=CognitiveMode.ALZHEIMER
            )

            assert res["type"] == "text"
            assert res["content"] == "نعم يا فندم، حضرتك تناولت دواء الضغط الساعة 9 صباحاً."
            assert "Patient is asking about blood pressure medication" in res["reasoning_content"]
            assert res["provider"] == "cloudflare_workers_ai"

    asyncio.run(_run())

def test_cloudflare_llm_mock_fallback_on_error():
    async def _run():
        client = CloudflareWorkersAIClient(
            account_id="mock_acc",
            api_token="mock_tok"
        )

        with patch("httpx.AsyncClient.post", side_effect=Exception("Connection timeout")):
            res = await client.generate_response(
                prompt="Hello",
                mode=CognitiveMode.ADHD
            )

            assert res["type"] == "text"
            assert "أول مهمة" in res["content"]
            assert "fallback" in res["provider"]

    asyncio.run(_run())

def test_cloudflare_whisper_transcription():
    async def _run():
        adapter = CloudflareWhisperAdapter(
            account_id="mock_acc",
            api_token="mock_tok"
        )

        mock_http_response = MagicMock()
        mock_http_response.status_code = 200
        mock_http_response.json.return_value = {
            "result": {
                "text": "ما هي حالة الطقس اليوم؟",
                "word_count": 6
            },
            "success": True
        }

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_http_response

            dummy_audio = b"\x00\x00" * 200
            res = await adapter.transcribe(dummy_audio)

            assert res.text == "ما هي حالة الطقس اليوم؟"
            assert res.confidence == 0.95
            assert res.duration_seconds >= 0.0

    asyncio.run(_run())

def test_cloudflare_whisper_empty_audio_guard():
    async def _run():
        adapter = CloudflareWhisperAdapter(
            account_id="mock_acc",
            api_token="mock_tok"
        )
        res = await adapter.transcribe(b"")
        assert res.text == ""
        assert res.confidence == 0.0

    asyncio.run(_run())

def test_container_dependency_injection():
    with patch.dict(os.environ, {
        "LLM_PROVIDER": "cloudflare",
        "STT_PROVIDER": "cloudflare",
        "CLOUDFLARE_ACCOUNT_ID": "test_acc",
        "CLOUDFLARE_API_TOKEN": "test_token",
    }):
        container = Container()
        assert isinstance(container.llm, CloudflareWorkersAIClient)
        assert isinstance(container.stt, CloudflareWhisperAdapter)
