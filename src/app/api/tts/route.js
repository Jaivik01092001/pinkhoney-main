import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { text, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
    }

    // Use a female voice (alloy, nova, shimmer are female voices)
    const voice = voiceId || "nova"; // Default to nova (female voice) if not specified

    try {
      // Use OpenAI TTS
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice,
        input: text,
      });

      // Get the audio data as an ArrayBuffer
      const buffer = await response.arrayBuffer();

      // Return the audio data with appropriate headers
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": buffer.byteLength.toString(),
        },
      });
    } catch (error) {
      console.error("Error with OpenAI TTS:", error);
      // Return error and indicate client should use browser TTS
      return NextResponse.json(
        {
          error: "Failed to generate speech with OpenAI TTS",
          useBrowserTTS: true,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
