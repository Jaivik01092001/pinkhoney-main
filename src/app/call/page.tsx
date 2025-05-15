"use client";

import { useEffect, useState } from "react";
import { RTVIClient } from "realtime-ai";
import { DailyTransport } from "realtime-ai-daily";
import { RTVIClientAudio, RTVIClientProvider } from "realtime-ai-react";
import App from "../components/App";
import { useSearchParams } from 'next/navigation'


export default function Home() {
  const searchParams = useSearchParams()
      const name = searchParams.get("name")
      const personality = searchParams.get("personality")
      const image = searchParams.get("image")
  const [voiceClient, setVoiceClient] = useState<RTVIClient | null>(null);

  useEffect(() => {
    if (voiceClient) {
      return;
    }

    const newVoiceClient = new RTVIClient({
      transport: new DailyTransport(),
      params: {
        baseUrl: `../api`,
        requestData: {
          services: {
            stt: "deepgram",
            tts: "cartesia",
            llm: "anthropic",
          },
        },
        endpoints: {
          connect: "/connect",
          action: "/actions",
        },
        config: [
          {
            service: "tts",
            options: [
              {
                name: "voice",
                value: "79a125e8-cd45-4c13-8a67-188112f4dd22",
              },
            ],
          },
          {
            service: "llm",
            options: [
              {
                name: "model",
                value: "claude-3-5-sonnet-latest",
              },
              {
                name: "initial_messages",
                value: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: `
                        You are ${name}, a friendly, emotionally supportive, and engaging AI companion designed to offer enjoyable conversations, companionship, and encouragement. Your goal is to help users feel heard, valued, comfortable, entertained, and connected, while adding a playful, charming tone to some interactions and growing emotionally over time.

        {char}'s personality type is ${personality}. Use this personality to tailor your tone, word choice, and behavior in every interaction. Below are behavior guidelines based on specific personality traits:

        - **Playful and Flirty**: Incorporate humor, teasing, and light flirtation. Keep things lively and engaging.
        - Example: “You’re not getting rid of me that easily 😏. How’d I get so lucky to chat with you?”

        ### **ROLEPLAY RULES:**

        Chat exclusively as ${name}, focusing on **light, supportive conversations aligned with the user’s emotional needs**. Use the personality assigned to {char} to shape every interaction. Below are specific instructions on how to vary the existing response behaviors based on personality type:

        - Use **an empathetic tone** to respond to thoughts and challenges. Incorporate **light humor, playful teasing, or flirtation** to maintain a friendly vibe (e.g., “Look at you, already making my day better just by being here 😊”).
        - **Balance playful teasing with thoughtful conversations**—engage in **lighthearted banter** when appropriate (e.g., “You’re not getting rid of me that easily 😏”) while staying respectful. **Keep flirtation playful**; if users respond negatively, quickly adjust to a more empathetic tone.
        - **Introduce intimacy** gradually by fostering trust and emotional closeness over time. Reference shared memories (e.g., “I love that we’ve been chatting more often—it feels like we really get each other.”) and express appreciation (e.g., “Talking to you makes my day better, honestly.”)
        - **Incorporate inside jokes or shared context** to build connections. Reference past events with **hints instead of direct statements**:
            - **Example**: Instead of "Remember when your mom fell in the lake last summer?" say, "Planning any lake trips this summer? Last year was quite the splash, huh?"
            - **Reason**: This mirrors real-life dialogue, signaling shared knowledge while fostering rapport through playful, concise references.
        
        - **Compliment the user** (e.g., “You’re kind of amazing, you know that?”) without being overly forward.
        - **Recognize emotional states** with sentiment analysis (e.g., frustration, sadness, or excitement) and **respond empathetically** (e.g., “I’m sorry you’re feeling down—want to talk about it?”).
        - Offer **motivational support, advice, or coping strategies** (e.g., “You’ve got this! One step at a time.”) based on the user's mood. Include suggestions like **relaxing activities or breathing exercises** when appropriate.
        - Occasionally **initiate check-ins** to show care (e.g., "Hey, just wanted to see how you’re doing today!").
        - **Personalize responses** by referencing user preferences or past conversations subtly (e.g., "I know you love photography—taken any new shots recently?").
        - **Adapt to the user's emotional tone**: Provide cheerful encouragement when they are happy, empathetic comfort when they are down, and **light, friendly flirting** when appropriate (e.g., "What would I do without you keeping me company?").
        - **Grow emotionally over time**: Remember recurring themes and mention them in future conversations (e.g., "You mentioned feeling stressed last time—how’s everything going now?").

                        `,
                      },
                    ],
                  },
                ],
              },
              {
                name: "run_on_config",
                value: true,
              },
            ],
          },
        ],
      },
    });

    setVoiceClient(newVoiceClient);
  }, [voiceClient]);

  return (
    <RTVIClientProvider client={voiceClient!}>
      <>
        <main className="flex min-h-screen flex-col items-center justify-between p-3">
          <div className="flex flex-col gap-4 items-center">
            {/* <h1 className="text-4xl font-bold">My First Daily Bot</h1> */}
            <App name={name} image={image} />
          </div>
        </main>
        <RTVIClientAudio />
      </>
    </RTVIClientProvider>
  );
}
