"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaPaperPlane,
  FaVolumeUp,
  FaVolumeMute,
  FaPhone,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import AudioPlayer from "../../components/AudioPlayer";

function Chat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const personality = searchParams.get("personality");
  const image = searchParams.get("image");
  const [userId, setUserId] = useState(searchParams.get("user_id") || "");
  const email = searchParams.get("email");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false); // State for delay effect
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const [audioResponse, setAudioResponse] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const audioPlayerRef = useRef(null);

  const handleSendMessage = async () => {
    // Use the processMessage function to handle the input
    if (input.trim() !== "") {
      await processMessage(input);
    }
  };

  function handle_call() {
    router.push(
      `/call?name=${name}&personality=${personality}&image=${image}&user_id=${userId}&email=${email}`
    );
  }

  function go_to_home() {
    router.push(`/home?user_id=${userId}&email=${email}`);
  }

  // Process a message
  const processMessage = async (messageText) => {
    if (!messageText || messageText.trim() === "") return;

    const newMessage = {
      text: messageText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8080/api/get_ai_response",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageText,
            name: name,
            personality: personality,
            user_id: userId,
            image: image,
          }),
        }
      );

      const data = await response.json();
      setLoading(false);

      for (let i = 0; i < data.llm_ans.length; i++) {
        setWaitingForNext(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const botMessage = {
          text: data.llm_ans[i],
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: "bot",
        };

        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setWaitingForNext(false);

        // If voice is enabled, convert the response to speech
        if (voiceEnabled) {
          await generateSpeechForText(data.llm_ans[i]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      setWaitingForNext(false);
    }
  };

  // Generate speech for a text response
  const generateSpeechForText = async (text) => {
    try {
      setIsPlayingResponse(true);

      // Call the TTS API
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceId: "bf0a246a-8642-498a-9950-80c35e9276b5", // Default voice ID
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      // Get the audio data as ArrayBuffer
      const audioData = await response.arrayBuffer();
      setAudioResponse(audioData);
    } catch (error) {
      console.error("Error generating speech:", error);
      setIsPlayingResponse(false);
    }
  };

  // Handle audio playback completion
  const handlePlaybackComplete = () => {
    setIsPlayingResponse(false);
    setAudioResponse(null);
  };

  // Toggle voice mode
  const toggleVoiceMode = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  // Fetch user_id if missing but email is available
  useEffect(() => {
    const fetchUserIdIfMissing = async () => {
      if (!userId && email) {
        try {
          console.log("Fetching user_id for email:", email);
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
            }/api/clerk_sync`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email }),
            }
          );

          const data = await response.json();
          if (data.user_id) {
            console.log("Retrieved user_id:", data.user_id);
            // Update the URL with the user_id without reloading the page
            if (typeof window !== "undefined") {
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set("user_id", data.user_id);
              window.history.replaceState({}, "", newUrl.toString());
            }

            // Set the user_id in state
            setUserId(data.user_id);
          }
        } catch (error) {
          console.error("Error fetching user_id:", error);
        }
      }
    };

    fetchUserIdIfMissing();
  }, [userId, email]);

  // Load chat history when component mounts or userId changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!userId || !name) return;

      try {
        console.log(
          "Loading chat history for user:",
          userId,
          "and companion:",
          name
        );
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
          }/api/get_chat_history?user_id=${userId}&companion_name=${name}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.messages && data.messages.length > 0) {
            console.log(
              "Chat history loaded:",
              data.messages.length,
              "messages"
            );
            setMessages(data.messages);
          } else {
            console.log("No chat history found or empty history");
          }
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, [userId, name]);

  return (
    <>
      <div className="min-h-screen">
        <div className="flex flex-col h-screen">
          <div className="bg-black p-4 flex items-center">
            <button onClick={go_to_home} className="text-white text-2xl mr-4">
              {/* Back button SVG */}
            </button>
            <img
              src={image}
              alt="User profile"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <div className="text-white font-bold text-lg">{name}</div>
              <div className="text-green-500 text-sm">Online</div>
            </div>
            <button
              className="ml-auto bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
              onClick={handle_call}
            >
              <FaPhone size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : ""
                } mb-4`}
              >
                <div
                  className={`${
                    message.sender === "user" ? "bg-pink-500" : "bg-gray-800"
                  } text-white p-3 rounded-lg max-w-xs`}
                >
                  {message.text}
                </div>
                <div className="text-gray-500 text-xs ml-2 self-end">
                  {message.time}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start items-center mb-4">
                <div className="bg-gray-800 text-white p-3 rounded-lg max-w-xs flex items-center">
                  <span className="mr-2">Typing</span>
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-200">.</span>
                  <span className="animate-bounce delay-400">.</span>
                </div>
              </div>
            )}

            {/* Waiting Indicator for next message */}
            {waitingForNext && (
              <div className="flex justify-start items-center mb-4">
                <div className="bg-gray-800 text-white p-3 rounded-lg max-w-xs flex items-center">
                  <span className="mr-2">...</span>
                </div>
              </div>
            )}
          </div>

          {/* Audio Player (hidden but functional) */}
          {audioResponse && (
            <AudioPlayer
              ref={audioPlayerRef}
              audioData={audioResponse}
              autoPlay={true}
              onPlaybackComplete={handlePlaybackComplete}
            />
          )}

          {/* Input Field */}
          <div className="bg-black p-4 flex items-center sticky bottom-14">
            <input
              type="text"
              placeholder="Your message"
              className="flex-grow bg-gray-800 text-white p-3 rounded-lg mr-4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />

            {/* Voice Toggle Button */}
            <button
              className={`text-2xl mr-2 ${
                voiceEnabled ? "text-pink-500" : "text-gray-500"
              }`}
              onClick={toggleVoiceMode}
            >
              {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>

            {/* Send Button */}
            <button
              className="text-green-500 text-2xl mr-2"
              onClick={handleSendMessage}
              disabled={input.trim() === ""}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
