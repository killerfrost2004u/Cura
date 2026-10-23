import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const runtime = "nodejs";
export const maxDuration = 30;

function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = (body.text || "").trim();
    const requestedVoice = body.voice;
    const isArabic = isArabicText(text);

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text is required for speech synthesis." },
        { status: 400 }
      );
    }

    // 1. Attempt ElevenLabs Multilingual Neural Synthesis if key is present
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const elevenlabs = new ElevenLabsClient();
        // Sarah (EXAVITQu4vr4xnSDxMaL) or Rachel (21m00Tcm4TlvDq8ikWAM)
        const voiceId = requestedVoice && requestedVoice.length > 15
          ? requestedVoice
          : "EXAVITQu4vr4xnSDxMaL";

        const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
          text,
          modelId: "eleven_multilingual_v2",
        });

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
            "X-TTS-Engine": "ElevenLabs-Multilingual-v2",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      } catch (elevenErr) {
        console.warn("ElevenLabs TTS fallback to Edge TTS:", elevenErr);
      }
    }

    // 2. High-Fidelity Azure Neural Edge Voice (ar-EG-SalmaNeural for Egyptian Arabic)
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
  } catch (error: any) {
    console.error("TTS generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate speech audio" },
      { status: 500 }
    );
  }
}
