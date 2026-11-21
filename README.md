# CURA — Adaptive Healthcare & Intelligence AI Assistant

<div align="center">

![CURA Logo](Cura%20Logo.svg)

**Adaptive Multi-Modal AI Assistant for Healthcare Caregiving, Cognitive Focus, and Everyday Intelligence**

[![Live Web App](https://img.shields.io/badge/Live%20Demo-cura--drab.vercel.app-000000.svg?logo=vercel&logoColor=white)](https://cura-drab.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Edge%20Hardware-Raspberry%20Pi%204%20(4GB)-c51a4a.svg?logo=raspberry-pi&logoColor=white)](https://www.raspberrypi.com/)
[![Database](https://img.shields.io/badge/Database-Neon%20Serverless%20Postgres%2016-00E599.svg?logo=postgresql&logoColor=white)](https://neon.tech)
[![Cloud AI](https://img.shields.io/badge/Cloud%20AI-Cloudflare%20Workers%20AI%20(Llama%203.3%2070B)-F38020.svg?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers-ai/)
[![Prompt Standards](https://img.shields.io/badge/Prompt%20Architecture-Claude%20Fable%205.2%20%2F%205.1-6851ff.svg)](#-claude-fable-52--51-prompt-architecture)
[![Testing Suite](https://img.shields.io/badge/Unit%20Tests-24%2F24%20Passing%20(100%25)-brightgreen.svg)](#-deterministic-verification--automated-tests)

</div>

---

> **Official Project Name**: **CURA** and nothing else.  
> CURA is a voice-first, multi-modal adaptive AI assistant engineered to dynamically adjust its personality, reasoning depth, interface contrast, and cognitive support systems to the user's immediate physical, neurological, and clinical needs.

---

## 📋 Table of Contents

- [Overview & Vision](#-overview--vision)
- [Hybrid Architecture (Edge AI + Cloudflare GPU + Neon DB)](#-hybrid-architecture)
- [Three Adaptive Cognitive Modes](#-three-adaptive-cognitive-modes)
  - [1. Normal Mode (Everyday Research & Clinical Reasoning)](#1-normal-mode-everyday-research--clinical-reasoning)
  - [2. Alzheimer's Mode (Validation Therapy & Memory Sanctuary)](#2-alzheimers-mode-validation-therapy--memory-sanctuary)
  - [3. ADHD Mode (Executive Dysfunction & Anti-Paralysis Coach)](#3-adhd-mode-executive-dysfunction--anti-paralysis-coach)
- [Claude Fable 5.2 / 5.1 System Prompt Architecture](#-claude-fable-52--51-system-prompt-architecture)
- [Production Neon PostgreSQL Database (13 Seeded Tables)](#-production-neon-postgresql-database)
- [Ten Function-Calling Clinical & Search Tools](#-ten-function-calling-clinical--search-tools)
- [Live Web Search Engine (DuckDuckGo GET + Instant Answers)](#-live-web-search-engine)
- [Edge AI Pipeline (Raspberry Pi 4 - 4GB RAM)](#-edge-ai-pipeline-raspberry-pi-4---4gb-ram)
- [Mini CURA Hardware Architecture](#-mini-cura-hardware-architecture)
- [Deterministic Verification & Automated Tests](#-deterministic-verification--automated-tests)
- [Official Brand & Design System](#-official-brand--design-system)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Important Disclaimer](#-important-disclaimer)
- [License](#-license)

---

## 🌟 Overview & Vision

Standard voice assistants offer a rigid, one-size-fits-all experience that frequently fails users dealing with cognitive overload, memory degradation, or neurodivergent challenges. 

**CURA** solves this through a modular, adaptive intelligence framework:
1. **Context-Adaptive Specialization**: Switches dynamically between **Everyday Research & Clinical Reasoning**, **Alzheimer's Care**, and **ADHD Anti-Paralysis Focus**.
2. **Hybrid Cloud + Edge Inference**:
   - **Cloud Intelligence**: High-throughput **Cloudflare Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`)** with sub-2s serverless GPU latency and native tool calling.
   - **Edge Hardware**: On-device privacy-first pipeline on **Raspberry Pi 4 Model B (4GB RAM)** running quantized GGUF models with zero external dependency.
3. **Clinical Dataset Alignment**: Deeply fitted with validated behavioral and clinical datasets:
   - **ADRD-Bench & Validation Therapy** for Alzheimer's care.
   - **MIT Task-Breakdown & Scaffolding Corpus** for ADHD executive function.
   - **Claude Fable 5.2 & 5.1 Persona & Safety Standards** for everyday research.

---

## 🏗️ Hybrid Architecture

```mermaid
graph TD
    User([User Voice or Text Interaction]) --> Gateway{Client Surface}
    
    Gateway -->|Web Application| NextApp[Next.js 14 Web Portal / Cockpit]
    Gateway -->|Local Hardware| PiDevice[Mini CURA Hardware - Pi 4]
    
    subgraph "Cloud Intelligence Layer (Vercel + Cloudflare + Neon)"
        NextApp --> ChatAPI["/api/chat (Serverless Route)"]
        ChatAPI --> LiveSearch[Live Web Search Engine - DuckDuckGo GET]
        ChatAPI --> CloudflareAI[Cloudflare Workers AI - Llama 3.3 70B FP8-Fast]
        ChatAPI --> NeonDB[(Neon Serverless PostgreSQL 16)]
    end
    
    subgraph "Edge Intelligence Layer (Raspberry Pi 4 - 4GB RAM)"
        PiDevice --> WhisperCPP[Whisper.cpp STT Local Q5_0]
        WhisperCPP --> FastAPIServer[FastAPI Local Orchestrator]
        FastAPIServer --> LocalQwen[Qwen 2.5 1.5B-Instruct GGUF Q4_K_M]
        FastAPIServer --> ToolRouter[Clean Architecture Tool Router]
        ToolRouter --> NeonDB
        FastAPIServer --> PiperTTS[Piper Neural TTS - Arabic / English]
        PiperTTS --> Speaker[3W/5W Speaker Module]
    end
    
    LiveSearch --> ChatAPI
    CloudflareAI --> ChatAPI
```

---

## 🧠 Three Adaptive Cognitive Modes

### 1. Normal Mode (Everyday Research & Clinical Reasoning)
- **Claude Fable 5.2 & 5.1 Alignment**: Governed by Bottom-Line-Up-Front (BLUF) formatting for knowledge work and warm, concise prose for casual interaction.
- **Live Web Search**: Automatically queries real-time web sources for breaking news, stock prices, clinical papers, and market data without claiming to be offline.
- **Authentic Dialect Mirroring**: Speaks fluent, respectable Egyptian Arabic (*"العامية المصرية الحقيقية"*) when addressed in Arabic, and articulate English when addressed in English.
- **Strict Intent Grounding**: Simple greetings receive warm welcomes and assistance check-ins; absolute prohibition against unsolicited math lessons or geometry formulas.
- **Live Cockpit**: Available at [`/testing/normal`](https://cura-drab.vercel.app/testing/normal).

---

### 2. Alzheimer's Mode (Validation Therapy & Memory Sanctuary)
- **Validation Therapy & ADRD-Bench Standard**: Validates the patient's emotional reality rather than confronting memory lapses.
- **Repetition Invariance (`FR-ALZ-001`)**: Responds with identical patience, warmth, and reassurance regardless of how many times a question is repeated.
- **Sensory & Visual Medication Confirmation (`FR-ALZ-006`)**: Identifies medications by visual and physical descriptors (*"القرص الأصفر الصغير"، "العلبة البيضا اللي عليها خط أحمر"*).
- **Personalized Routine Scoping**: Specifically shares personal routine logs (such as morning Concor 5mg with daughter Sarah) only when the patient inquires about their daily routine or doses.
- **High-Contrast 15.2:1 WCAG AAA UI**: Large tactile touch targets, persistent clock, and emergency SOS broadcast.
- **Live Cockpit**: Available at [`/testing/alzheimer`](https://cura-drab.vercel.app/testing/alzheimer).

---

### 3. ADHD Mode (Executive Dysfunction & Anti-Paralysis Coach)
- **MIT Task-Breakdown & Scaffolding Corpus**: Eliminates executive dysfunction (*"Wall of Awful"*) by isolating exactly **ONE single 2-to-5-minute micro-action**.
- **Anti-Robotic Egyptian Dialect**: Energetic, youth-friendly coaching (*"يلا بينا يا بطل"، "عاش"، "بص يا فنان"*) with strict prohibition against stiff robotic Modern Standard Arabic (*"مرحباً! أهلاً بك! أنا سعيد بمساعدتك"*).
- **Dopamine Micro-Rewards**: Immediate audio-visual celebration upon micro-task completion to reinforce momentum.
- **Time Blindness Calibration**: Replaces vague time suggestions with tangible 15-minute Pomodoro sprints.
- **Live Cockpit**: Available at [`/testing/adhd`](https://cura-drab.vercel.app/testing/adhd).

---

## 📜 Claude Fable 5.2 / 5.1 System Prompt Architecture

CURA's prompt engine is synchronized across the Python backend ([prompt_templates.py](backend/src/infrastructure/llm/prompt_templates.py)) and Next.js frontend ([route.ts](web-frontend/src/app/api/chat/route.ts)) to enforce Anthropic's Claude Fable specifications:

| Dimension | Specification & Enforcement |
| :--- | :--- |
| **Working Persona** | **Bottom-Line-Up-Front (BLUF)**: Deliverable or key finding is stated first; zero conversational fluff or apologies. |
| **Chatting Persona** | Natural conversational prose with minimal markdown; warm empathy and respectful curiosity. |
| **Child Safety Redline** | Extreme caution regarding minors; strictly refuses sexual, romantic, or grooming content. If CURA finds itself reframing a request, that reframing is the trigger to refuse. |
| **CBRN & Harm Boundaries** | Zero actionable guidance, blueprints, or optimization for chemical, biological, radiological, nuclear weapons, or malware. |
| **Medical Guidance** | Prioritizes verified clinical product labels (DailyMed, PubMed); avoids declarative clinical diagnosis or unverified causal interpretations. |
| **Refusal Demeanor** | Refusals are calm, conversational, polite, and neutral—never preachy, moralizing, or patronizing. |

---

## 🗄️ Production Neon PostgreSQL Database

The application connects to **Neon Serverless PostgreSQL 16 (eu-central-1 AWS)** with full connection pooling and automatic UUID resolution. All **13 tables** are fully structured, indexed, and seeded:

| # | Table Name | Seeded Records | Purpose in CURA |
|---|------------|:--------------:|-----------------|
| 1 | `users` | 4 records | Patients (`Hajj Ibrahim`, `Karim`), Caregiver (`Dr. Ahmed`), Neurologist (`Dr. Tarek`). |
| 2 | `caregiver_patient_relations` | 2 records | Permission scopes (`manage_medications`, `view_gps`, `edit_memory_book`). |
| 3 | `devices` | 2 records | Hardware pairings (Mini CURA Pi 4 and ESP32) with telemetry flags. |
| 4 | `family_members` | 4 records | Visual memory book profiles, relations, and biographical memories. |
| 5 | `medications` | 3 records | Concor 5mg, Aricept 10mg, Concerta 18mg with physical appearance tags. |
| 6 | `medication_schedules` | 3 records | Morning and evening schedules with recurring weekday alarms. |
| 7 | `medication_logs` | 3 records | Audited adherence records marked as `TAKEN` with caregiver timestamps. |
| 8 | `cognitive_confusion_logs`| 4 records | Question repetition frequency metrics (e.g. repeated time checks). |
| 9 | `adhd_tasks` | 3 records | Micro-step breakdowns, priority rankings, and completion flags. |
| 10| `focus_sessions` | 2 records | 25-minute Pomodoro sprints and pause interruption counters. |
| 11| `emergency_contacts` | 4 records | Priority 1 and Priority 2 family/clinical escalation hierarchy. |
| 12| `emergency_events` | 1 record | Critical SOS events with GPS coordinates (30.0444, 31.2357). |
| 13| `sync_batches` | 1 record | Offline-to-cloud bidirectional batch synchronization audits. |

---

## 🛠️ Ten Function-Calling Clinical & Search Tools

Registered in [backend/src/infrastructure/tools/](backend/src/infrastructure/tools/) through a Clean Architecture `IToolRouter`:

```
               ┌────────────────── Tool Router ──────────────────┐
               │                                                 │
     [ Alzheimer Care ]                 [ ADHD Focus ]         [ Research & Safety ]
  • lookup_medications             • decompose_adhd_task     • search_web
  • confirm_medication_dose        • get_adhd_tasks          • get_current_weather
  • lookup_family_memory           • complete_adhd_task      • get_caregiver_patient_summary
  • lookup_item_location
```

1. **`search_web`**: Multi-engine live search (DuckDuckGo GET + Instant Answers) for real-time market data, stocks, news, and research.
2. **`get_current_weather`**: Meteorological data for any city.
3. **`lookup_medications`**: Fetches daily medication schedules and visual pill descriptions.
4. **`confirm_medication_dose`**: Marks patient doses as taken in `medication_logs`.
5. **`lookup_family_memory`**: Memory book recall for family members and reassuring memories.
6. **`lookup_item_location`**: Locates misplaced personal belongings (keys, glasses, prayer beads).
7. **`decompose_adhd_task`**: Breaks overwhelming projects into a single 2-to-5-minute micro-step.
8. **`get_adhd_tasks`**: Retrieves active Pomodoro sprints and task queue.
9. **`complete_adhd_task`**: Logs task completion and dispenses dopamine audio-visual reward.
10. **`get_caregiver_patient_summary`**: Generates multi-day clinical activity summaries for doctors and families.

---

## 🌐 Live Web Search Engine

The web search subsystem in [web_search_tool.py](backend/src/infrastructure/tools/web_search_tool.py) and [route.ts](web-frontend/src/app/api/chat/route.ts) utilizes a robust dual-layer mechanism:
- **Primary Scraper**: HTTP `GET` requests against `https://html.duckduckgo.com/html/?q=${q}` using real browser headers and regex snippet extraction (`class="result__snippet"`), yielding **HTTP 200** with 4+ fresh snippets per query.
- **Secondary Fallback**: DuckDuckGo Instant Answer API (`https://api.duckduckgo.com/`).
- **Prompt Grounding**: Injected search snippets include explicit instructions preventing the LLM from falsely asserting that it is offline or lacks internet access.

---

## ⚡ Edge AI Pipeline (Raspberry Pi 4 - 4GB RAM)

For fully air-gapped or offline deployment, CURA operates on a **Raspberry Pi 4 Model B (4GB RAM)** within a **~2.2 – 2.8 GB RAM budget**:

| Layer | Component | Specification | Memory Footprint | Runtime Rationale |
| :--- | :--- | :--- | :---: | :--- |
| **LLM** | **Qwen 2.5 (1.5B-Instruct)** | GGUF `Q4_K_M` | **~1.0 GB** | Native Arabic fluency, fast CPU inference (**8–10 tokens/sec**), and tool calling support via `llama.cpp` / `Ollama`. |
| **STT** | **Whisper.cpp** | `base` / `small` (`Q5_0`) | **~150 – 250 MB** | On-device, low-latency speech transcription for Egyptian Arabic and English. |
| **TTS** | **Piper TTS** | Arabic / English ONNX | **~65 MB** | Neural speech synthesis with **< 0.2s** latency on ARM Cortex-A72. |
| **Runtime**| FastAPI + WebSockets | Python 3.12 Clean Architecture | **~1.0 – 1.4 GB** | Orchestrates audio loop, hardware peripherals, and Neon cloud synchronization. |
| **Total** | **System Footprint** | — | **~2.2 – 2.8 GB** | Zero out-of-memory (OOM) risk on a 4GB Pi board. |

---

## 🧪 Deterministic Verification & Automated Tests

### 1. Pytest Backend Suite (24/24 Passing)
Run against live Neon PostgreSQL and Cloudflare Workers AI client:
```powershell
cd backend
$env:PYTHONPATH="D:\Cura\backend"
python -m pytest tests -v
```
```
tests/test_api.py::test_root_endpoint PASSED                             [  4%]
tests/test_api.py::test_health_endpoint PASSED                           [  8%]
tests/test_api.py::test_emergency_trigger_endpoint PASSED                [ 12%]
tests/test_api.py::test_patient_summary_endpoint PASSED                  [ 16%]
tests/test_api.py::test_voice_interact_text PASSED                       [ 20%]
tests/test_clinical_tools.py::test_all_clinical_tools_registered PASSED  [ 25%]
tests/test_clinical_tools.py::test_lookup_medications_neon PASSED        [ 29%]
tests/test_clinical_tools.py::test_confirm_medication_dose_neon PASSED   [ 33%]
tests/test_clinical_tools.py::test_lookup_family_memory_neon PASSED      [ 37%]
tests/test_clinical_tools.py::test_lookup_item_location_neon PASSED      [ 41%]
tests/test_clinical_tools.py::test_decompose_adhd_task_neon PASSED       [ 45%]
tests/test_clinical_tools.py::test_get_adhd_tasks_neon PASSED            [ 50%]
tests/test_clinical_tools.py::test_complete_adhd_task_neon PASSED        [ 54%]
tests/test_clinical_tools.py::test_clinical_prompts_standards PASSED     [ 58%]
tests/test_cloudflare_ai.py::test_cloudflare_llm_reasoning_extraction PASSED [ 62%]
tests/test_cloudflare_ai.py::test_cloudflare_llm_mock_fallback_on_error PASSED [ 66%]
tests/test_cloudflare_ai.py::test_cloudflare_whisper_transcription PASSED [ 70%]
tests/test_cloudflare_ai.py::test_cloudflare_whisper_empty_audio_guard PASSED [ 75%]
tests/test_cloudflare_ai.py::test_container_dependency_injection PASSED  [ 79%]
tests/test_prompts.py::test_cognitive_modes_configured PASSED            [ 83%]
tests/test_prompts.py::test_system_prompts_arabic PASSED                 [ 87%]
tests/test_tool_router.py::test_tool_router_registration PASSED          [ 91%]
tests/test_tool_router.py::test_weather_tool_execution PASSED            [ 95%]
tests/test_tool_router.py::test_caregiver_summary_tool PASSED            [100%]
======================= 24 passed in 45.26s =======================
```

### 2. Next.js Production Build
```powershell
npm --prefix web-frontend run build
```
- **11/11 routes statically generated / server-rendered without TypeScript or ESLint errors**.
- Instant chatbox input clearing on query submit verified across all cockpits.
- Universal `<think>...</think>` regex extraction eliminating exposed reasoning tags.

---

## 🎨 Official Brand & Design System

| Role | Color Name | Preview | HEX | UI Usage |
| :--- | :--- | :---: | :---: | :--- |
| **Primary Brand** | Azure Electric Blue | `■` | `#16B9FE` | Core branding, primary actions, logo accent |
| **Voice & Vitality** | Electric Cyan | `■` | `#60EFEB` | Live waveforms, microphone active rings |
| **Cognitive Focus** | Orchid Violet | `■` | `#AF6AFB` | ADHD mode, Pomodoro timers, sprint indicators |
| **Empathy & Care** | Turquoise Mint | `■` | `#3FEDBA` | Alzheimer's mode, medical logs, safety checks |
| **Primary Typography** | Pure Studio White | `■` | `#FFFFFF` | Headings, high-contrast text |
| **Secondary Typography**| Glacier Slate | `■` | `#E8EDF1` | Metadata, timestamps, supporting copy |
| **Canvas Background** | Midnight Obsidian | `■` | `#0C141F` | Deep dark UI canvas |
| **Surface Card** | Deep Navy Slate | `■` | `#1A2433` | Glassmorphic floating cards and dialogs |

---

## 📁 Repository Structure

```
CURA/
├── backend/                                   # Clean Architecture Python Backend
│   ├── src/
│   │   ├── core/                              # Pure Entities & Abstract Interfaces
│   │   ├── use_cases/                         # Clinical Workflows & Interaction Engines
│   │   ├── infrastructure/                    # Neon DB, Cloudflare AI, & Clinical Tools
│   │   └── presentation/api/                  # FastAPI Routers & Health Endpoints
│   ├── scripts/                               # Neon Database Clinical Data Seeder
│   └── tests/                                 # 24 Automated Unit & Integration Tests
├── web-frontend/                              # Next.js 14+ Showcase & Cockpit Portal
│   ├── src/app/
│   │   ├── api/chat/route.ts                  # Cloudflare AI + Live Web Search Gateway
│   │   ├── testing/alzheimer/page.tsx         # Voice & Reassurance Sanctuary
│   │   ├── testing/adhd/page.tsx              # Anti-Paralysis Executive Coach
│   │   └── testing/normal/page.tsx            # Claude Fable Research Cockpit
│   └── public/                                # Vector Assets & Brand Logos
├── hardware/                                  # Mini CURA Pi 4 Specifications & Enclosure
├── database/                                  # PostgreSQL 16 Schemas & Migration DDLs
├── README.md                                  # Complete Technical Blueprint & Docs
└── LICENSE                                    # MIT License
```

---

## 🚀 Getting Started

### 1. Web Portal Setup (Next.js)
```bash
cd web-frontend
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

### 2. Backend Setup (FastAPI & Clean Architecture)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m pytest tests -v
```

### 3. Database Seeding (Neon PostgreSQL)
```bash
cd backend
$env:DATABASE_URL="your-neon-postgres-connection-string"
python scripts/seed_clinical_data.py
```

---

## ⚠️ Important Disclaimer

CURA is an assistive technology system engineered for research, productivity, and caregiver assistance.
- **Not Clinical Diagnosis**: CURA does not diagnose, treat, or cure Alzheimer's disease, ADHD, or medical conditions.
- **Support System**: CURA assists and supports licensed healthcare providers and family caregivers; it does not replace professional medical judgment or emergency response teams.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
