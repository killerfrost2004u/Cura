# CURA — Complete Visual Flowcharts & Architecture Blueprint

> Comprehensive visual documentation covering the **CURA AI Cognitive Engine**, the **Whole-Project Client Ecosystem**, and the **Hybrid Cloud + Edge Hardware Architecture**.

---

## High-Resolution Visual Diagrams (PNG)

| Diagram | Target Audience | Key Scope | File |
| :--- | :--- | :--- | :--- |
| **Whole-Project Client Flowchart** | Clients, Stakeholders & Clinical Reviewers | Multi-channel client apps (`Web`, `Flutter`, `Desktop`, `Mini CURA Hub`), Adaptive Care Modes, Cloud/Edge Sync, and Emergency SOS flow | [CURA_Whole_Project_Client_Flowchart.png](CURA_Whole_Project_Client_Flowchart.png) |
| **CURA AI Model Flowchart** | AI / ML Engineers & Technical Leads | End-to-end STT → Cognitive Mode Router → Claude Fable 5.2 / ADRD / MIT Prompt Engine → Hybrid LLM → `<think>` Parser → 5-Tier Search & 10 Tools → Egyptian TTS | [CURA_AI_Model_Flowchart.png](CURA_AI_Model_Flowchart.png) |
| **Hybrid Cloud & Edge System Architecture** | System Architects & DevOps | 4-tier architecture spanning Client Surfaces, Vercel Serverless & FastAPI `/api/v1` + WebSockets, Cloudflare Workers AI + Raspberry Pi 4 Offline Stack, and Neon Postgres 16 + S3 + Edge SQLite | [CURA_System_Architecture_Diagram.png](CURA_System_Architecture_Diagram.png) |
| **Clean Software & Mini CURA Hardware** | Backend & Embedded Firmware Teams | Concentric Clean Architecture Dependency Inversion layers (`Core → Use Cases → Interfaces → Infrastructure`) alongside Pi 4 peripherals, FSM, and 4GB RAM budget | [CURA_Clean_Hardware_Architecture.png](CURA_Clean_Hardware_Architecture.png) |

---

## 1. Hybrid Cloud & Edge System Architecture (Mermaid)

```mermaid
flowchart TB
    subgraph Clients["1. Client Surfaces & Hardware"]
        Web["Web Portal & Cockpits (Next.js 14 on Vercel)"]
        Mobile["Mobile App (Flutter Patient & Caregiver)"]
        Desktop["Desktop GUI (MVVM Workstation)"]
        PiHub["Mini CURA Hardware (Raspberry Pi 4 - 4GB)"]
    end

    subgraph Gateway["2. API Gateway & Transport Layer"]
        VercelAPI["Vercel Serverless API (/api/chat, /api/transcribe, /api/tts)"]
        FastAPI["FastAPI Core REST API (/api/v1)"]
        WSHub["Full-Duplex WebSocket Hub (/ws/v1/hardware/stream, /ws/v1/voice/stream)"]
    end

    subgraph CloudCore["3A. Cloud AI & Clean Architecture"]
        CFLLM["Cloudflare Workers AI (Llama 3.3 70B FP8-Fast)"]
        CloudSpeech["Cloud Speech (Whisper Large v3 Turbo / ElevenLabs / Edge TTS)"]
        WebSearch["5-Tier Live Web Search (Serper / Tavily / Google News / Wiki / DDG)"]
        PromptSafety["Prompt & Safety Guardrails (Claude Fable 5.2 / ADRD-Bench / MIT)"]
        UseCases["Core Use Cases (VoiceInteraction / EmergencyAlert / RepetitionTrack)"]
        ToolRouter["Clinical Tool Router (10 AI Functions)"]
    end

    subgraph EdgeCore["3B. Edge Offline AI (Raspberry Pi 4 - 4GB RAM)"]
        WhisperCPP["Local STT - Whisper.cpp (Q5_0)"]
        QwenLocal["Local LLM - Qwen 2.5 1.5B-Instruct (GGUF Q4_K_M)"]
        PiperTTS["Local TTS - Piper Neural ONNX"]
        Daemon["Hardware Bridge & FSM Daemon (systemd)"]
    end

    subgraph Storage["4. Persistence, S3 Storage & Offline Sync"]
        NeonDB[("Neon Serverless PostgreSQL 16 (Frankfurt - 13 Tables)")]
        NeonS3[("Neon S3 Object Storage (uploads Bucket)")]
        EdgeSQLite[("Edge SQLite Local Cache (Pi 4)")]
    end

    Web -->|"HTTPS"| VercelAPI
    Mobile -->|"REST"| FastAPI
    Desktop -->|"REST"| FastAPI
    Desktop <-->|"WSS"| WSHub
    PiHub <-->|"WSS Stream"| WSHub

    VercelAPI --> CFLLM
    VercelAPI --> CloudSpeech
    VercelAPI --> WebSearch
    FastAPI --> UseCases
    CFLLM <--> PromptSafety
    UseCases <--> ToolRouter

    WSHub <--> Daemon
    WhisperCPP --> QwenLocal --> PiperTTS --> Daemon

    UseCases <--> NeonDB
    UseCases <--> NeonS3
    Daemon <--> EdgeSQLite
    EdgeSQLite <-->|"sync_batches"| NeonDB
```

---

## 2. Clean Software Architecture & Dependency Inversion (Mermaid)

All source code under `backend/src/` enforces strict Dependency Inversion: inner domain rules and entities have zero external framework or database imports, while outer infrastructure adapters implement abstract ports defined in `src/core/interfaces/`.

```mermaid
flowchart LR
    subgraph Outer["Layer 4: Presentation & Infrastructure Adapters"]
        API["FastAPI Routers & WebSockets"]
        CloudAdapters["Cloudflare AI & Ollama Clients"]
        SpeechAdapters["Whisper / ElevenLabs / Piper Adapters"]
        DBAdapters["Neon Postgres, S3 & 10 Clinical Tools"]
    end

    subgraph Ports["Layer 3: Interfaces / Abstract Ports"]
        ILLM["ILLMEngine & ISTTEngine & ITTSEngine"]
        ITool["IToolRouter"]
        IRepo["IRepositories"]
    end

    subgraph App["Layer 2: Application Use Cases"]
        UC1["ProcessVoiceInteractionUseCase"]
        UC2["HandleEmergencyAlertUseCase"]
        UC3["TrackQuestionRepetitionUseCase"]
        UC4["SummarizeCaregiverLogUseCase"]
    end

    subgraph Domain["Layer 1: Pure Domain Entities (Zero External Deps)"]
        E1["CognitiveMode & LEDRingState"]
        E2["VoiceCommand & SynthesizedAudio"]
        E3["Medication"]
        E4["EmergencyEvent"]
        E5["ClinicalIntent"]
    end

    Outer -->|"implements ports"| Ports
    App -->|"depends only on abstractions"| Ports
    App -->|"orchestrates"| Domain
```

---

## 3. End-to-End Speech-to-Speech (STS) Interaction Sequence (Mermaid)

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient / User
    participant Client as Web / Mobile / Mini CURA Mic
    participant STT as Whisper Engine (/api/transcribe)
    participant Router as Mode & Search Engine (/api/chat)
    participant Tools as Tool Router / 5-Tier Search / Neon DB
    participant LLM as Llama 3.3 70B / Qwen 2.5
    participant TTS as Phonology & TTS (/api/tts)

    User->>Client: Speaks voice query (Egyptian AR or English)
    Client->>STT: Streams recorded audio buffer
    STT-->>Client: Transcribed text (filtered against silence hallucinations)
    Client->>Router: POST query + cognitive mode + patient_id
    Router->>Tools: Pre-fetch live search (Serper/Tavily/News) or Neon clinical context
    Tools-->>Router: Verified snippets & patient records
    Router->>LLM: Prompt (Claude Fable 5.2 / ADRD-Bench / MIT) + context
    LLM-->>Router: Raw completion with internal <think> reasoning trace
    Router->>Router: Extract reasoning_content & strip all <think> tags globally
    Router-->>Client: Clean response_text + collapsible reasoning trace
    Client->>TTS: Request neural voice output (when spoken mode active)
    TTS->>TTS: Apply Egyptian phonology harakat & natural pause cues
    TTS-->>Client: Synthesized audio stream (ElevenLabs / Edge TTS / Piper)
    Client-->>User: Plays natural voice reply & updates caregiver logs
```

---

## 4. Mini CURA Hardware Finite State Machine & Edge Memory Allocation

Target device: **Raspberry Pi 4 Model B (4GB RAM)** running 64-bit Raspberry Pi OS (`systemd` daemon in `hardware/firmware/daemon.py`). Camera module is excluded so 100% of CPU and RAM support low-latency local AI.

```mermaid
stateDiagram-v2
    [*] --> Boot: Power ON & systemd daemon start
    Boot --> Idle: 16x WS2812B LEDs ready + 4.0" LCD clock
    Idle --> Listen: Voice trigger or mic activation (LED Blue)
    Listen --> Process: Whisper.cpp Q5_0 STT capture (LED Green)
    Process --> Speak: Qwen 2.5 1.5B + Tool / SQLite lookup (LED Yellow)
    Speak --> Idle: Piper Neural TTS via MAX98357A + 3W speaker
    Idle --> SOS: GPIO-17 physical button press (250ms debounce)
    Listen --> SOS: Emergency interrupt (LED Red)
    Process --> SOS: Critical escalation alert
    SOS --> Idle: Priority alert logged & caregiver notified
```

---

## 5. Emergency SOS & Offline-to-Cloud Synchronization Flow

```mermaid
flowchart LR
    Trigger["SOS Input (GPIO-17 Button / Mobile 1-Tap / Voice Distress)"] --> Debounce["Validate Trigger (250ms Hardware Debounce)"]
    Debounce --> LocalLog["Write Emergency Event to Edge SQLite / Neon emergency_events"]
    LocalLog --> Notify["Escalate to Priority 1 & 2 Caregivers (emergency_contacts)"]
    LocalLog --> SyncCheck{"Cloud Connection Available?"}
    SyncCheck -->|"Yes"| CloudPush["Push Immediate Telemetry via /api/v1/emergency & WSS"]
    SyncCheck -->|"No (Air-Gapped)"| QueueBatch["Queue in Edge SQLite sync_batches"]
    QueueBatch -->|"Reconnect"| CloudPush
```

---

*Regenerate any diagram cleanly from Python via [`docs/generate_cura_ai_flowchart.py`](generate_cura_ai_flowchart.py) and [`docs/generate_cura_project_diagrams.py`](generate_cura_project_diagrams.py).*
