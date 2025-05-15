"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaPaperPlane } from "react-icons/fa";
import { useRouter } from "next/navigation";

function Chat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const personality = searchParams.get("personality");
  const image = searchParams.get("image");
  const user_id = searchParams.get("user_id");
  const email = searchParams.get("email");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false); // State for delay effect

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const newMessage = {
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sender: "user",
    };
    setMessages([...messages, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8080/get_ai_response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input, name: name, personality: personality }),
      });

      const data = await response.json();
      setLoading(false);

      for (let i = 0; i < data.llm_ans.length; i++) {
        setWaitingForNext(true); // Show "..." while waiting for the next message

        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay

        const botMessage = {
          text: data.llm_ans[i],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sender: "bot",
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setWaitingForNext(false); // Hide "..." after message appears
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      setWaitingForNext(false);
    }
  };

  function handle_call() {
    router.push(`/call?name=${name}&personality=${personality}&image=${image}`);
  }

  function go_to_home() {
    router.push(`/home?user_id=${user_id}&email=${email}`);
  }

  return (
    <>
      <div className="min-h-screen">
        <div className="flex flex-col h-screen">
          <div className="bg-black p-4 flex items-center">
            <button onClick={go_to_home} className="text-white text-2xl mr-4">
              {/* Back button SVG */}
            </button>
            <img src={image} alt="User profile" className="w-12 h-12 rounded-full mr-4" />
            <div>
              <div className="text-white font-bold text-lg">{name}</div>
              <div className="text-green-500 text-sm">Online</div>
            </div>
            <button className="ml-4" onClick={handle_call}>
              {/* Call button SVG */}
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : ""} mb-4`}>
                <div className={`${message.sender === "user" ? "bg-pink-500" : "bg-gray-800"} text-white p-3 rounded-lg max-w-xs`}>
                  {message.text}
                </div>
                <div className="text-gray-500 text-xs ml-2 self-end">{message.time}</div>
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
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button className="text-green-500 text-2xl" onClick={handleSendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
