// CURA Multilingual Natural Voice & BiDi Synthesis Engine
// Prioritizes Egyptian Arabic (ar-EG: Salma, Shakir) and Natural English (Jenny, Guy, Google)

export function isArabicText(text: string): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  preferEgyptian?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  if (cachedVoices.length > 0) return cachedVoices;
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return voices;
}

// Selects highest fidelity natural voice with strict Egyptian Arabic prioritization
export function selectBestVoice(isArabic: boolean, preferEgyptian = true): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  if (isArabic) {
    // 1. Egyptian Arabic Natural Neural (Microsoft Salma, Shakir Online)
    const egNatural = voices.find(
      (v) =>
        (v.lang === "ar-EG" || v.lang.startsWith("ar")) &&
        (v.name.includes("Shakir") || v.name.includes("Salma") || v.name.includes("Egypt")) &&
        (v.name.includes("Natural") || v.name.includes("Online"))
    );
    if (egNatural) return egNatural;

    // 2. Any Egyptian Arabic voice (e.g. Google ar-EG, Hoda)
    const egVoice = voices.find(
      (v) => (v.lang === "ar-EG" || v.name.toLowerCase().includes("egypt"))
    );
    if (egVoice) return egVoice;

    // 3. Any Natural/Online Arabic voice (e.g. Hamed, Zariyah)
    const arNatural = voices.find(
      (v) => v.lang.startsWith("ar") && (v.name.includes("Natural") || v.name.includes("Online"))
    );
    if (arNatural) return arNatural;

    // 4. Any Arabic voice
    const anyAr = voices.find((v) => v.lang.startsWith("ar") || v.lang.includes("ar"));
    if (anyAr) return anyAr;
  } else {
    // 1. Natural Neural English (Microsoft Jenny, Guy, Aria, Google US)
    const enNatural = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Neural"))
    );
    if (enNatural) return enNatural;

    // 2. Google US English
    const googleEn = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Google")
    );
    if (googleEn) return googleEn;

    // 3. Any English voice
    const anyEn = voices.find((v) => v.lang.startsWith("en"));
    if (anyEn) return anyEn;
  }

  return voices[0] || null;
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakNaturalText(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    if (!text || !text.trim()) {
      resolve();
      return;
    }

    const isArabic = isArabicText(text);

    const executeSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = selectBestVoice(isArabic, options.preferEgyptian ?? true);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = isArabic ? "ar-EG" : "en-US";
      }

      // Smooth human pacing: 0.92 for warm natural Egyptian cadence
      utterance.rate = options.rate ?? (isArabic ? 0.92 : 1.0);
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        options.onError?.(e);
        resolve(); // Don't reject to keep UI flowing
      };

      window.speechSynthesis.speak(utterance);
    };

    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices && currentVoices.length > 0) {
      cachedVoices = currentVoices;
      executeSpeak();
    } else {
      // Wait for voices to load in browser
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
        executeSpeak();
      };
      // Fallback timeout in case onvoiceschanged does not fire
      setTimeout(executeSpeak, 100);
    }
  });
}
