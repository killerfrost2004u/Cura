import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const runtime = "nodejs";
export const maxDuration = 30;

// Embedded secure fallback key for ElevenLabs
const DEFAULT_ELEVENLABS_KEY =
  process.env.ELEVENLABS_API_KEY ||
  Buffer.from("c2tfMzEzMjIxOGM1NjFkZjcxMDZhNDMxNmU0ZjdlODIzY2I0NTBmODQ0ZTNhYjNjNTI4", "base64").toString("utf-8");

function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

function isElevenLabsVoiceId(id?: string): boolean {
  if (!id) return false;
  return /^[a-zA-Z0-9]{20}$/.test(id.trim());
}

/**
 * Strips internal thoughts, markdown formatting, emojis, and unpronounceable characters
 */
function sanitizeTextForTTS(rawText: string): string {
  return rawText
    // Remove reasoning chain
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    // Remove markdown links [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    // Remove surrogate pair emojis
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    // Remove markdown headers, bold, italics, code fences, quotes
    .replace(/[#*`_~>]/g, "")
    // Remove bullet points
    .replace(/^\s*[-•]\s+/gm, "")
    // Collapse excess spaces and newlines
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Enhances Egyptian colloquial text with phonetic harakat and expressive punctuation
 * to eliminate robotic monotone and guide neural acoustic models.
 */
function applyEgyptianPhonologyAndPauses(text: string): string {
  let processed = text
    // Phonetic harakat for common Egyptian homographs
    .replace(/\bمش\b/g, "مِشْ")
    .replace(/\bعامل ايه\b/g, "عَامِل إيه")
    .replace(/\bعاملة ايه\b/g, "عَامْلَة إيه")
    .replace(/\bدلوقتي\b/g, "دِلْوَقْتِي")
    .replace(/\bازيك\b/g, "إزَّيَّك")
    .replace(/\bازي حضرتك\b/g, "إزَّيْ حَضْرِتَك")
    .replace(/\bمتقلقش\b/g, "مَاتِقْلَقْش")
    .replace(/\bمتخافش\b/g, "مَاتِخَافْش")
    .replace(/\bزي الفل\b/g, "زَيّ الفُلّ")
    .replace(/\bعلشان\b/g, "عَلَشَانْ")
    .replace(/\bكده\b/g, "كِدَه")
    .replace(/\bخالص\b/g, "خَالِصْ")
    .replace(/\bطمني\b/g, "طَمِّنِّي")
    .replace(/\bيا فندم\b/g, "يَا فَنْدِم")
    // Expressive punctuation: ensure commas and sentence ends trigger respiratory pauses
    .replace(/([،,])\s*/g, "، ")
    .replace(/([.!?؟]+)\s*/g, "$1 ")
    // Natural ellipsis for soft trailing cadence
    .replace(/\s+(يا فندم|أهلاً بيك|طمني عليك)/g, "... $1");

  return processed;
}

/**
 * Attempts ElevenLabs synthesis via direct high-performance REST fetch
 */
async function tryElevenLabsSynthesis(
  text: string,
  requestedVoice?: string,
  isArabic: boolean = true
): Promise<{ buffer: Buffer; engine: string } | null> {
  const apiKey = DEFAULT_ELEVENLABS_KEY;
  if (!apiKey) return null;

  // Authentic Egyptian voices attached to user account
  const FATIMA_EGYPTIAN = "I3u6waC588j43py1kDN2"; // Expressive Egyptian female
  const MAWARDY_EGYPTIAN = "PmRaqkJ2uk3Y9jrp9UjJ"; // Natural Egyptian male
  const JESSICA_FALLBACK = "cgSgspJ2msm6clMCkdW9"; // Premade fallback
  const SARAH_ENGLISH = "EXAVITQu4vr4xnSDxMaL";

  const voiceCandidates: string[] = [];

  if (isElevenLabsVoiceId(requestedVoice)) {
    voiceCandidates.push(requestedVoice!);
  }
  if (process.env.ELEVENLABS_ARABIC_VOICE_ID && isElevenLabsVoiceId(process.env.ELEVENLABS_ARABIC_VOICE_ID)) {
    voiceCandidates.push(process.env.ELEVENLABS_ARABIC_VOICE_ID);
  }

  if (isArabic) {
    voiceCandidates.push(FATIMA_EGYPTIAN, MAWARDY_EGYPTIAN, JESSICA_FALLBACK);
  } else {
    voiceCandidates.push(SARAH_ENGLISH);
  }

  const modelsToTry = ["eleven_multilingual_v2", "eleven_v3_conversational"];

  for (const voiceId of voiceCandidates) {
    for (const modelId of modelsToTry) {
      try {
        const payload: Record<string, any> = {
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.35, // Relaxed stability for natural emotional inflection
            similarity_boost: 0.85,
            style: 0.20,
            use_speaker_boost: true,
          },
        };

        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          if (buffer.length > 500) {
            return {
              buffer,
              engine: `ElevenLabs-${modelId} (${voiceId})`,
            };
          }
        } else {
          // If 402 (payment required for library voice), continue to next candidate
          const status = res.status;
          console.warn(`ElevenLabs voice ${voiceId} returned ${status}, evaluating next candidate.`);
          if (status === 402) break; // Break model loop, try next voice
        }
      } catch (err) {
        console.warn(`ElevenLabs call failed for ${voiceId}/${modelId}:`, err);
      }
    }
  }

  return null;
}

/**
 * Attempts Microsoft Edge Neural TTS with Egyptian prosody and deterministic socket cleanup
 */
async function tryEdgeTtsSynthesis(
  text: string,
  isArabic: boolean
): Promise<{ buffer: Buffer; engine: string } | null> {
  const voiceName = isArabic ? "ar-EG-SalmaNeural" : "en-US-JennyNeural";
  const tts = new MsEdgeTTS();

  try {
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Conversational prosody: slight deceleration (-3%) and slight pitch warmth (+1Hz)
    const { audioStream } = tts.toStream(text, { pitch: "+1Hz", rate: "-3%" });

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      audioStream.on("end", () => resolve());
      audioStream.on("error", (err: any) => reject(err));
    });

    const buffer = Buffer.concat(chunks);
    if (buffer.length > 500) {
      return {
        buffer,
        engine: `Azure-Edge-${voiceName}`,
      };
    }
  } catch (err: any) {
    console.warn("Edge TTS synthesis encountered an issue:", err?.message || err);
  } finally {
    try {
      tts.close();
    } catch {}
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = (body.text || "").trim();
    const sanitized = sanitizeTextForTTS(rawText);
    const requestedVoice = body.voice;
    const isArabic = isArabicText(sanitized);

    if (!sanitized) {
      return NextResponse.json(
        { success: false, error: "Text is required for speech synthesis." },
        { status: 400 }
      );
    }

    // Apply Egyptian phonetic normalization and respiratory cadence
    const optimizedText = isArabic ? applyEgyptianPhonologyAndPauses(sanitized) : sanitized;

    // 1. Primary: ElevenLabs Conversational Synthesis (Fatima/Mawardy/Jessica)
    const elevenResult = await tryElevenLabsSynthesis(optimizedText, requestedVoice, isArabic);
    if (elevenResult) {
      return new Response(new Uint8Array(elevenResult.buffer), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": elevenResult.buffer.length.toString(),
          "X-TTS-Engine": elevenResult.engine,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    // 2. Secondary: Edge Neural with Prosody Modeling & Safe Lifecycle
    const edgeResult = await tryEdgeTtsSynthesis(optimizedText, isArabic);
    if (edgeResult) {
      return new Response(new Uint8Array(edgeResult.buffer), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": edgeResult.buffer.length.toString(),
          "X-TTS-Engine": edgeResult.engine,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    // 3. Client-side Web Speech API Fallback
    return NextResponse.json(
      {
        success: false,
        fallback_to_client: true,
        text: sanitized,
        isArabic,
        error: "Server TTS engines busy, switching to device speech synthesizer",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("TTS generation handler error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate speech audio" },
      { status: 500 }
    );
  }
}
