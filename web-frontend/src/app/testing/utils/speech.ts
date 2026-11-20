// CURA Multimodal Speech Synthesis Engine
// Combines ElevenLabs Multilingual / Edge TTS (/api/tts) with browser Web Speech API (ar-EG) fallback

export function isArabicText(text: string): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

export function cleanTextForSpeech(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#*`_~>•]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
  preferEgyptian?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let activeAudio: HTMLAudioElement | null = null;

export function stopSpeaking(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Synthesizes and plays high-definition neural speech audio.
 * Uses /api/tts (ElevenLabs Multilingual v2 / Azure Neural ar-EG-SalmaNeural).
 * Gracefully falls back to browser SpeechSynthesis (ar-EG) if offline or rate-limited.
 */
export async function speakNaturalText(text: string, options: SpeakOptions = {}): Promise<void> {
  stopSpeaking();

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    options.onEnd?.();
    return;
  }

  const isArabic = isArabicText(clean);

  try {
    options.onStart?.();

    // 1. Attempt High-Fidelity Server Neural TTS (ElevenLabs Conversational / v4)
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: clean,
        voice: options.voice, // Only forward if explicitly provided by caller
        rate: options.rate || 1.0,
      }),
    });

    const contentType = res.headers.get("content-type") || "";

    if (res.ok && contentType.includes("audio")) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      activeAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        activeAudio = null;
        options.onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn("Audio element playback error, falling back to Web Speech:", e);
        URL.revokeObjectURL(audioUrl);
        activeAudio = null;
        fallbackWebSpeech(clean, isArabic, options);
      };

      await audio.play();
      return;
    } else {
      console.warn("Server TTS returned non-audio response, falling back to Web Speech.");
    }
  } catch (err) {
    console.warn("Server TTS fetch error, falling back to Web Speech:", err);
  }

  // 2. Client Web Speech Synthesis Fallback (Native ar-EG Egyptian Arabic)
  fallbackWebSpeech(clean, isArabic, options);
}

function selectEgyptianVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  // 1. Prioritize native Egyptian Arabic voices (ar-EG)
  const egVoice = voices.find(
    (v) =>
      (v.lang === "ar-EG" || v.lang === "ar_EG") &&
      (v.name.includes("Salma") || v.name.includes("Shakir") || v.name.includes("Natural") || v.name.includes("Online"))
  );
  if (egVoice) return egVoice;

  // 2. Any ar-EG voice
  const anyEg = voices.find((v) => v.lang === "ar-EG" || v.lang === "ar_EG");
  if (anyEg) return anyEg;

  // 3. Any high-quality Arabic voice (Google / Microsoft / Apple)
  const arHighQuality = voices.find(
    (v) =>
      v.lang.startsWith("ar") &&
      (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Google") || v.name.includes("Maged"))
  );
  if (arHighQuality) return arHighQuality;

  // 4. Any Arabic voice
  return voices.find((v) => v.lang.startsWith("ar"));
}

function fallbackWebSpeech(cleanText: string, isArabic: boolean, options: SpeakOptions) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const executeSpeak = () => {
      const voices = window.speechSynthesis.getVoices();

      if (isArabic) {
        const arVoice = selectEgyptianVoice(voices);
        if (arVoice) utterance.voice = arVoice;
        utterance.lang = "ar-EG";
        utterance.rate = options.rate || 0.92;
        utterance.pitch = options.pitch || 1.0;
      } else {
        const enVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Jenny"))
        ) || voices.find((v) => v.lang.startsWith("en"));
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = "en-US";
        utterance.rate = options.rate || 1.0;
      }

      utterance.onend = () => {
        options.onEnd?.();
      };

      utterance.onerror = (e) => {
        options.onError?.(e);
        options.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    };

    const currentVoices = window.speechSynthesis.getVoices();
    if (!currentVoices || currentVoices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        executeSpeak();
      };
    } else {
      executeSpeak();
    }
  } catch (e) {
    options.onError?.(e);
    options.onEnd?.();
  }
}
