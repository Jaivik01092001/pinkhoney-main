// [POST] /api
export async function POST(request: Request) {
  const { services, config } = await request.json();
  console.log(services);
  console.log(config);

  if (!services || !config || !process.env.CARTESIA_API_KEY) {
    return Response.json("Services or config not found on request body", {
      status: 400,
    });
  }

  const payload = {
    bot_profile: "voice_2024_10",
    max_duration: 600,
    services,
    api_keys: {
      // Optional API keys here (e.g. OpenAI GPT-4 etc)
    },
    config,
  };

  const req = await fetch(`${process.env.CARTESIA_URL}/tts/bytes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cartesia-Version": "2024-06-10",
      "X-API-Key": process.env.CARTESIA_API_KEY,
    },
    body: JSON.stringify({
      model_id: "sonic-2",
      transcript: payload.config?.text || "Hello, how can I help you today?",
      voice: {
        mode: "id",
        id: "bf0a246a-8642-498a-9950-80c35e9276b5",
      },
      output_format: {
        container: "wav",
        encoding: "pcm_f32le",
        sample_rate: 44100,
      },
      language: "en",
    }),
  });

  const res = await req.json();

  if (req.status !== 200) {
    return Response.json(res, { status: req.status });
  }

  return Response.json(res);
}
