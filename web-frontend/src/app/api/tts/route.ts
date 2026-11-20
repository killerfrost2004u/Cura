import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const runtime = "nodejs";
export const maxDuration = 30;

function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

function sanitizeTextForTTS(rawText: string): string {
  return rawText
    // Remove reasoning chain
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    // Remove markdown links [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    // Remove markdown headers, bold, italics, code fences, quotes
    .replace(/[#*`_~>]/g, "")
    // Remove bullet points
    .replace(/^\s*[-•]\s+/gm, "")
    // Collapse excess spaces and newlines
    .replace(/\n{2,}/g, " ")
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

    // 1. Attempt ElevenLabs Multilingual Neural Synthesis
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const elevenlabs = new ElevenLabsClient();
        // Priority: custom ELEVENLABS_ARABIC_VOICE_ID -> requestedVoice -> default Sarah
        const customArabicVoice = process.env.ELEVENLABS_ARABIC_VOICE_ID;
        const defaultVoice = isArabic
          ? (customArabicVoice || "EXAVITQu4vr4xnSDxMaL")
          : "EXAVITQu4vr4xnSDxMaL";

        const voiceId = requestedVoice && requestedVoice.length > 15
          ? requestedVoice
          : defaultVoice;

        const convertOptions: any = {
          text,
          modelId: "eleven_multilingual_v2",
          voiceSettings: {
            stability: 0.45,
            similarityBoost: 0.85,
            style: 0.15,
            useSpeakerBoost: true,
          },
        };

        if (isArabic) {
          convertOptions.languageCode = "ar";
        }

        const audioStream = await elevenlabs.textToSpeech.convert(voiceId, convertOptions);

        // Web ReadableStream to Node Buffer
        const reader = audioStream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }

        const audioBuffer = Buffer.concat(chunks);
        return new Response(audioBuffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.length.toString(),
            "X-TTS-Engine": `ElevenLabs-Multilingual-v2 (${voiceId})`,
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      } catch (elevenErr) {
        console.warn("ElevenLabs TTS failed, attempting fallback:", elevenErr);
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

      return new Response(audioBuffer, {
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
