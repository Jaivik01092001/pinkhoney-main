// [POST] /api/tts
export async function POST(request: Request) {
  const { text, voiceId } = await request.json();
  
  if (!text || !process.env.CARTESIA_API_KEY) {
    return Response.json("Text or API key not provided", {
      status: 400,
    });
  }

  try {
    const response = await fetch(`${process.env.CARTESIA_URL}/tts/bytes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cartesia-Version": "2024-06-10",
        "X-API-Key": process.env.CARTESIA_API_KEY,
      },
      body: JSON.stringify({
        model_id: "sonic-2",
        transcript: text,
        voice: {
          mode: "id",
          id: voiceId || "bf0a246a-8642-498a-9950-80c35e9276b5",
        },
        output_format: {
          container: "wav",
          encoding: "pcm_f32le",
          sample_rate: 44100,
        },
        language: "en",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Cartesia API error:", errorData);
      return Response.json({ error: "Failed to generate speech" }, { status: response.status });
    }

    // Get the audio data as an ArrayBuffer
    const audioData = await response.arrayBuffer();
    
    // Return the audio data with the appropriate content type
    return new Response(audioData, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioData.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
