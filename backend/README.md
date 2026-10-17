# CURA — AI Pipeline & Backend Core

<div align="center">

![CURA Logo](../Cura%20Logo.svg)

**Edge AI Orchestrator & Multi-Platform Services**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Framework-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Edge AI](https://img.shields.io/badge/Target-Raspberry%20Pi%204%20(4GB)-c51a4a.svg?logo=raspberry-pi&logoColor=white)](https://www.raspberrypi.com/)
[![LLM](https://img.shields.io/badge/Model-Qwen%202.5%201.5B%20(Q4__K__M)-6851ff.svg)](https://huggingface.co/Qwen)

</div>

---

## 🏛️ Architecture Overview

The `backend` service is structured using **Clean Architecture (Hexagonal / Ports & Adapters)** to decouple business use cases from concrete AI libraries and transport layers:

```
backend/
├── src/
│   ├── core/                        # Domain Core (Zero external framework imports)
│   │   ├── entities/                # CognitiveMode, Intent, VoiceCommand, MedicationPlan
│   │   ├── interfaces/              # ISTTEngine, ILLMEngine, ITTSEngine, IToolRouter
│   │   └── use_cases/               # ProcessVoiceInteraction, HandleEmergencyAlert, etc.
│   ├── infrastructure/              # Low-Level Concrete Adapters
│   │   ├── speech/                  # WhisperCppAdapter, PiperTTSAdapter
│   │   ├── llm/                     # OllamaClient (Qwen 2.5 1.5B), PromptTemplates
│   │   ├── tools/                   # DuckDuckGoTool, WeatherTool, PatientSummaryTool
│   │   └── database/                # InMemoryRepository (Mock/Dev), Postgres, SQLite
│   └── presentation/                # Delivery Mechanisms
│       ├── api/                     # FastAPI REST Endpoints (/api/v1/...)
│       └── websockets/              # WebSocket Hardware & GUI State Stream (/ws/v1/...)
├── scripts/                         # Setup & CLI test scripts
└── tests/                           # PyTest Unit & Integration test suite
```

---

## ⚡ Edge AI Pipeline on Raspberry Pi 4 (4GB RAM)

- **LLM**: `Qwen 2.5 (1.5B-Instruct)` in GGUF `Q4_K_M` (~1.05 GB) via `llama.cpp` or `Ollama`.
- **STT**: `Whisper.cpp` (`base`/`small` `Q5_0`, ~180–240 MB) for on-device Arabic transcription.
- **TTS**: `Piper TTS` (Arabic ONNX, ~65 MB) for sub-second (<0.2s) voice output.
- **Hardware Resources**: Camera module removed to dedicate 100% CPU/RAM to speech and NLP. Total RAM consumption remains strictly bounded within **2.2 GB – 2.8 GB**.

---

## 🚀 Quickstart & Local Development

### 1. Set Up Virtual Environment
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate
# On Linux / macOS / Raspberry Pi
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Setup Models (Laptop / Pi 4)
```bash
python scripts/download_models.py
```

### 4. Run Interactive Terminal Demo
Test all 3 cognitive modes and tool calling directly in your console:
```bash
python scripts/run_local_demo.py
```

### 5. Run FastAPI Server
```bash
uvicorn src.presentation.api.main:app --reload --port 8000
```
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Alternative ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Running Tests

```bash
pytest tests/ -v
```

---

## 🌐 Key API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/v1/health` | `GET` | Health check & model status |
| `/api/v1/voice/interact-text` | `POST` | Text-based prompt interaction with Tool Calling |
| `/api/v1/voice/demo-interact` | `POST` | "Try CURA" audio upload endpoint |
| `/api/v1/patients/{id}/summary` | `GET` | Caregiver 2-day activity report (FR-ALZ-009) |
| `/api/v1/medications/{id}/confirm`| `POST` | Voice/tap dose confirmation (FR-ALZ-007) |
| `/api/v1/emergency/trigger` | `POST` | SOS trigger from hardware button or app |
| `/ws/v1/hardware/stream` | `WS` | Real-time hardware LED and display card streaming |
