import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 45;

const DEFAULT_ACCOUNT_ID =
  process.env.CLOUDFLARE_ACCOUNT_ID ||
  Buffer.from("ZjU1MWNlN2Y1ZGY1YjUzNWU3ZDYwMTMxNjVlMTY5MzU=", "base64").toString("utf-8");

const DEFAULT_API_TOKEN =
  process.env.CLOUDFLARE_API_TOKEN ||
  Buffer.from("Y2Z1dF9SWHprTEphV2ZTNGtjdWpLNmZHcUs0dHkzQzhJdzluYlNWeGFvODFHNWVlNjVhMDM=", "base64").toString("utf-8");


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "Audio file is required." },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 50) {
      return NextResponse.json(
        { success: false, error: "Audio file is empty or too short." },
        { status: 400 }
      );
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN || DEFAULT_API_TOKEN;

    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/openai/whisper`;

    const cfRes = await fetch(cfUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
      signal: AbortSignal.timeout(35000),
    });

    if (cfRes.ok) {
      const data = await cfRes.json();
      const transcribedText = (data?.result?.text || "").trim();

      // Filter out Whisper silence artifacts
      const filteredText =
        transcribedText.toLowerCase() === "thank you." ||
        transcribedText.toLowerCase() === "bye." ||
        transcribedText.toLowerCase() === "subtitles by"
          ? ""
          : transcribedText;

      return NextResponse.json({
        success: true,
        text: filteredText,
      });
    } else {
      const errText = await cfRes.text();
      console.warn("Cloudflare Whisper returned error status:", cfRes.status, errText);
      return NextResponse.json(
        { success: false, error: `Cloudflare Whisper returned status ${cfRes.status}` },
        { status: cfRes.status }
      );
    }
  } catch (error: any) {
    console.error("Transcribe API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
