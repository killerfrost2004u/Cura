// CURA Multimodal Speech Synthesis Engine
// Combines Azure Neural Edge TTS (/api/tts) with browser Web Speech API fallback

export function isArabicText(text: string): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
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
 * Uses /api/tts (Azure Neural ar-EG-SalmaNeural for Egyptian Arabic & en-US-JennyNeural for English).
 * Gracefully falls back to browser SpeechSynthesis if offline.
 */
export async function speakNaturalText(text: string, options: SpeakOptions = {}): Promise<void> {
  stopSpeaking();

  if (!text || !text.trim()) {
    return;
  }

  const isArabic = isArabicText(text);

  // Default to SalmaNeural for Egyptian Arabic, JennyNeural for English
  const defaultVoice = isArabic ? "ar-EG-SalmaNeural" : "en-US-JennyNeural";
  const selectedVoice = options.voice || defaultVoice;

  try {
    options.onStart?.();

    // 1. Attempt High-Fidelity Server Neural TTS
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voice: selectedVoice,
        rate: options.rate || 1.0,
      }),
    });

    if (res.ok) {
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
        fallbackWebSpeech(text, isArabic, options);
      };

      await audio.play();
      return;
    } else {
      console.warn("Server TTS failed with status:", res.status, "Falling back to Web Speech.");
    }
  } catch (err) {
    console.warn("Server TTS fetch error, falling back to Web Speech:", err);
  }

  // 2. Client Web Speech Synthesis Fallback
  fallbackWebSpeech(text, isArabic, options);
}

function fallbackWebSpeech(text: string, isArabic: boolean, options: SpeakOptions) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (isArabic) {
      const arVoice = voices.find(
        (v) =>
          (v.lang.startsWith("ar") || v.lang === "ar-EG") &&
          (v.name.includes("Salma") || v.name.includes("Shakir") || v.name.includes("Natural"))
      ) || voices.find((v) => v.lang.startsWith("ar"));
      if (arVoice) utterance.voice = arVoice;
      utterance.lang = "ar-EG";
      utterance.rate = options.rate || 0.9;
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
  } catch (e) {
    options.onError?.(e);
    options.onEnd?.();
  }
}
