# Egyptian Arabic Speech Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable CURA to consistently speak and interact in authentic Egyptian Arabic (العامية المصرية) when the user clicks the microphone button or triggers the speech function, combining Cloudflare Workers AI Whisper STT, LLM dialect grounding, and ElevenLabs Multilingual TTS with native Egyptian fallbacks.

**Architecture:**
- **STT Pipeline:** Upgrade `/api/transcribe` to Cloudflare `@cf/openai/whisper-large-v3-turbo` with Arabic speech parameter hints.
- **Cognitive Dialect Engine:** `/api/chat` receives `spoken_mode: true` / `prefer_dialect: "egyptian_arabic"` and enforces warm, authentic Egyptian Arabic responses across all clinical modes (`normal`, `alzheimer`, `adhd`).
- **TTS Synthesis Engine:** `/api/tts` uses ElevenLabs SDK with `eleven_multilingual_v2`, `language_code: "ar"`, and configurable `ELEVENLABS_ARABIC_VOICE_ID`, backed by seamless `ar-EG` neural fallback.
- **Client Audio Layer:** `speech.ts` cleans markdown tokens before speech synthesis and prioritizes Egyptian Arabic neural voices (`ar-EG-SalmaNeural` / `ar-EG-ShakirNeural`).

**Tech Stack:** Next.js 14 (App Router), Cloudflare Workers AI (`@cf/openai/whisper-large-v3-turbo`), `@elevenlabs/elevenlabs-js`, Microsoft Edge Neural TTS / Web Speech API (`ar-EG`).

---

## Tasks

### Task 1: Upgrade Cloudflare Workers AI Whisper STT
**Files:**
- Modify: `web-frontend/src/app/api/transcribe/route.ts`

- [ ] Step 1: Update API call to use `@cf/openai/whisper-large-v3-turbo` with graceful fallback to `@cf/openai/whisper`.
- [ ] Step 2: Expand noise/hallucination filter for Arabic silence artifacts.
- [ ] Step 3: Verify with test script.

### Task 2: Ground LLM Responses in Egyptian Arabic on Voice Input
**Files:**
- Modify: `web-frontend/src/app/api/chat/route.ts`

- [ ] Step 1: Add `spoken_mode?: boolean` and `prefer_dialect?: "egyptian_arabic"` to `ChatRequestBody`.
- [ ] Step 2: Inject Egyptian Arabic conversational rules into system prompts for `alzheimer`, `adhd`, and `normal` modes when `spoken_mode` is enabled.
- [ ] Step 3: Verify dialect output via API call test.

### Task 3: Enhance ElevenLabs and Fallback TTS Engine
**Files:**
- Modify: `web-frontend/src/app/api/tts/route.ts`

- [ ] Step 1: Add support for `ELEVENLABS_ARABIC_VOICE_ID` and pass `language_code: "ar"` to `elevenlabs.textToSpeech.convert`.
- [ ] Step 2: Tune audio synthesis parameters and ensure robust fallback.
- [ ] Step 3: Test synthesis stream via API test.

### Task 4: Polish Client Speech Synthesis & Clean Markdown
**Files:**
- Modify: `web-frontend/src/app/testing/utils/speech.ts`
- Modify: `web-frontend/src/app/testing/components/VoiceMicButton.tsx`

- [ ] Step 1: Implement `cleanTextForSpeech` to strip `<think>`, asterisks, headers, and emojis before synthesis.
- [ ] Step 2: Configure `ar-EG` priority voices in Web Speech fallback.
- [ ] Step 3: Pass `spoken_mode: true` from `VoiceMicButton` callbacks.

### Task 5: End-to-End Integration Across Cockpit Testing Pages
**Files:**
- Modify: `web-frontend/src/app/testing/page.tsx`
- Modify: `web-frontend/src/app/testing/alzheimer/page.tsx`
- Modify: `web-frontend/src/app/testing/adhd/page.tsx`
- Modify: `web-frontend/src/app/testing/normal/page.tsx`

- [ ] Step 1: Wire up mic inputs and speak buttons to pass `spoken_mode: true` to `/api/chat`.
- [ ] Step 2: Verify build and test flow in dev environment.
