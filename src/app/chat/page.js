"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaPaperPlane } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { apiPost, apiGet } from "@/services/api";

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

  const handleSendMessage = async () => {
    // Use the processMessage function to handle the input
    if (input.trim() !== "") {
      await processMessage(input);
    }
  };



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
      const data = await apiPost("api/get_ai_response", {
        message: messageText,
        name: name,
        personality: personality,
        user_id: userId,
        image: image,
      });

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
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      setWaitingForNext(false);
    }
  };



  // Fetch user_id if missing but email is available
  useEffect(() => {
    const fetchUserIdIfMissing = async () => {
      if (!userId && email) {
        try {
          console.log("Fetching user_id for email:", email);
          const data = await apiPost("api/clerk_sync", { email });
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
        const data = await apiGet(`api/get_chat_history?user_id=${userId}&companion_name=${name}`);
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

          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === "user" ? "justify-end" : ""
                  } mb-4`}
              >
                <div
                  className={`${message.sender === "user" ? "bg-pink-500" : "bg-gray-800"
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
