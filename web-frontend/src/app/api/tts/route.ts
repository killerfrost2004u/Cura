import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

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

    // Default to natural Egyptian Arabic voice for Arabic, and natural US voice for English
    // ar-EG-SalmaNeural is Microsoft's premier natural Egyptian Arabic voice
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
