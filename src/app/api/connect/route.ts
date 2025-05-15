// [POST] /api
export async function POST(request: Request) {
    const { services, config } = await request.json();
    console.log(services)
    console.log(config)

  
    if (!services || !config || !process.env.DAILY_BOTS_API_KEY) {
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
  
    const req = await fetch(process.env.DAILY_BOTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_BOTS_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  
    const res = await req.json();
  
    if (req.status !== 200) {
      return Response.json(res, { status: req.status });
    }
  
    return Response.json(res);
  }
  