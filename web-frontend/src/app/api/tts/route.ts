import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const runtime = "nodejs";
export const maxDuration = 30;

function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

function isElevenLabsVoiceId(id?: string): boolean {
  if (!id) return false;
  return /^[a-zA-Z0-9]{20}$/.test(id.trim());
}

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = (body.text || "").trim();
    const text = sanitizeTextForTTS(rawText);
    const requestedVoice = body.voice;
    const isArabic = isArabicText(text);

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text is required for speech synthesis." },
        { status: 400 }
      );
    }

    // 1. Attempt ElevenLabs Conversational Neural Synthesis
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const elevenlabs = new ElevenLabsClient();
        const customArabicVoice = process.env.ELEVENLABS_ARABIC_VOICE_ID;
        
        let voiceId = "cgSgspJ2msm6clMCkdW9"; // Jessica (Warm, bright, conversational)

        if (isElevenLabsVoiceId(requestedVoice)) {
          voiceId = requestedVoice!;
        } else if (isElevenLabsVoiceId(customArabicVoice)) {
          voiceId = customArabicVoice!;
        } else if (!isArabic) {
          voiceId = "EXAVITQu4vr4xnSDxMaL"; // Sarah for English
        }

        // Use eleven_v3_conversational for fluid human cadence, or fallback to eleven_v4 / eleven_multilingual_v2
        const modelsToTry = ["eleven_v3_conversational", "eleven_v4", "eleven_multilingual_v2"];
        let audioBuffer: Buffer | null = null;
        let successfulModel = "";

        for (const modelId of modelsToTry) {
          try {
            const convertOptions: any = {
              text,
              modelId,
              voiceSettings: {
                stability: 0.35, // lower stability = more human expression and natural inflection
                similarityBoost: 0.85,
                style: 0.20,
                useSpeakerBoost: true,
              },
            };

            if (isArabic) {
              convertOptions.languageCode = "ar";
            }

            const audioStream = await elevenlabs.textToSpeech.convert(voiceId, convertOptions);

            const reader = audioStream.getReader();
            const chunks: Uint8Array[] = [];
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) chunks.push(value);
            }

            if (chunks.length > 0) {
              audioBuffer = Buffer.concat(chunks);
              successfulModel = modelId;
              break;
            }
          } catch (modelErr) {
            console.warn(`ElevenLabs model ${modelId} failed, trying next model:`, modelErr);
          }
        }

        if (audioBuffer && audioBuffer.length > 100) {
          return new Response(new Uint8Array(audioBuffer), {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": audioBuffer.length.toString(),
              "X-TTS-Engine": `ElevenLabs-${successfulModel} (${voiceId})`,
              "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
          });
        }
      } catch (elevenErr) {
        console.warn("ElevenLabs TTS execution failed:", elevenErr);
      }
    }

    // 2. High-Fidelity Azure Neural Edge Voice (ar-EG-SalmaNeural for Egyptian Arabic)
    try {
      const voiceName =
        requestedVoice || (isArabic ? "ar-EG-SalmaNeural" : "en-US-JennyNeural");

      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      const { audioStream } = tts.toStream(text);

      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        audioStream.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });
        audioStream.on("end", () => {
          resolve();
        });
        audioStream.on("error", (err: any) => {
          reject(err);
        });
      });

      const audioBuffer = Buffer.concat(chunks);

      return new Response(new Uint8Array(audioBuffer), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.length.toString(),
          "X-TTS-Engine": "Azure-Neural-Edge",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    } catch (edgeErr: any) {
      console.warn("Edge TTS fallback unavailable (rate limited or offline):", edgeErr?.message);
    }

    // 3. Signal frontend to execute client-side Web Speech API (ar-EG)
    return NextResponse.json(
      {
        success: false,
        fallback_to_client: true,
        text,
        isArabic,
        error: "Server TTS engines unavailable, fallback to Web Speech",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("TTS generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate speech audio" },
      { status: 500 }
    );
  }
}
