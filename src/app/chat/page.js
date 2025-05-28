"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaPaperPlane } from "react-icons/fa";
import { apiPost, apiGet } from "@/services/api";
import NavigationBar from "../components/NavigationBar";

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
  const [isTyping, setIsTyping] = useState(false); // Enhanced typing indicator
  const [typingDots, setTypingDots] = useState(""); // Animated typing dots

  // Reference to the chat container for auto-scrolling
  const chatContainerRef = useRef(null);

  // Function to scroll to the bottom of the chat with smooth behavior
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      // Use smooth scrolling for a better user experience
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Utility function to generate random delay between 2-5 seconds
  const getRandomTypingDelay = () => {
    return Math.floor(Math.random() * 3000) + 2000; // 2000-5000ms (2-5 seconds)
  };

  // Enhanced typing simulation with realistic delays
  const simulateTyping = async (duration) => {
    setIsTyping(true);

    // Animate typing dots during the delay
    const dotInterval = setInterval(() => {
      setTypingDots(prev => {
        if (prev === "") return ".";
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return "";
      });
    }, 500); // Change dots every 500ms

    // Wait for the specified duration
    await new Promise(resolve => setTimeout(resolve, duration));

    // Clean up
    clearInterval(dotInterval);
    setIsTyping(false);
    setTypingDots("");
  };

  // Simulate a brief pause to make the conversation feel more natural
  const simulateBriefPause = async () => {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400)); // 300-700ms
  };



  const handleSendMessage = async () => {
    // Use the processMessage function to handle the input
    if (input.trim() !== "") {
      await processMessage(input);
    }
  };

  // Process a message with enhanced typing simulation
  const processMessage = async (messageText) => {
    if (!messageText || messageText.trim() === "") return;

    const newMessage = {
      text: messageText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "user",
      read: false, // User messages start as unread until AI responds
      delivered: true, // User messages are always delivered
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

      // Process each AI response with realistic typing simulation
      for (let i = 0; i < data.llm_ans.length; i++) {
        // Brief pause before starting to type (makes it feel more natural)
        await simulateBriefPause();

        // Generate random delay for this message (2-5 seconds)
        const typingDelay = getRandomTypingDelay();

        // Show typing indicator with animated dots
        await simulateTyping(typingDelay);

        // Add the message after typing simulation
        const botMessage = {
          text: data.llm_ans[i],
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: "bot",
          read: true, // Bot messages are automatically read when received
          delivered: true,
        };

        setMessages((prevMessages) => {
          // Mark the last user message as read when AI responds
          const updatedMessages = prevMessages.map((msg, index) => {
            if (index === prevMessages.length - 1 && msg.sender === "user") {
              return { ...msg, read: true };
            }
            return msg;
          });
          return [...updatedMessages, botMessage];
        });

        // Small pause between messages if there are multiple responses
        if (i < data.llm_ans.length - 1) {
          await simulateBriefPause();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      setIsTyping(false);
      setTypingDots("");
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

        // Mark messages as read when opening chat
        try {
          await apiPost("api/mark_as_read", {
            user_id: userId,
            companion_name: name
          });
          console.log("Messages marked as read");
        } catch (readError) {
          console.error("Error marking messages as read:", readError);
        }

        const data = await apiGet(`api/get_chat_history?user_id=${userId}&companion_name=${name}`);
        if (data.success && data.messages && data.messages.length > 0) {
          console.log(
            "Chat history loaded:",
            data.messages.length,
            "messages"
          );
          setMessages(data.messages);
          // We'll scroll to bottom after messages are loaded in a separate useEffect
        } else {
          console.log("No chat history found - starting with empty chat");
          // Start with empty messages array for new conversations
          setMessages([]);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        // Start with empty messages on error
        setMessages([]);
      }
    };

    loadChatHistory();
  }, [userId, name]);



  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll to bottom when typing state changes
  useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    }
  }, [isTyping]);

  // Auto-scroll to bottom when component mounts
  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <>
      <div className="min-h-screen">
        <div className="flex flex-col h-screen">
          {/* Header with back button, profile, and status */}
          <div className="bg-black p-4 flex items-center border-b border-gray-800">
            <button
              onClick={() => router.back()}
              className="mr-3 text-white hover:text-gray-300 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <img
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}${image}`}
              alt="User profile"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1">
              <div className="text-white font-semibold text-lg">{name}</div>
              <div className="text-green-500 text-sm flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Online
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 bg-black">
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-6 mt-4">
              <hr className="flex-grow border-gray-600" />
              <span className="mx-4 text-gray-400 text-sm font-medium">Today</span>
              <hr className="flex-grow border-gray-600" />
            </div>

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                  } mb-3`}
              >
                <div className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"} max-w-xs`}>
                  <div
                    className={`${
                      message.sender === "user"
                        ? "bg-pink-500 rounded-t-2xl rounded-bl-2xl rounded-br-md"
                        : "bg-gray-700 rounded-t-2xl rounded-br-2xl rounded-bl-md"
                    } text-white p-3 shadow-sm relative`}
                  >
                    {message.text}
                  </div>

                  {/* Time and Read Status */}
                  <div className={`flex items-center mt-1 px-1 ${message.sender === "user" ? "flex-row" : "flex-row"}`}>
                    <span className="text-gray-400 text-xs">
                      {message.time}
                    </span>

                    {/* Read marks for user messages */}
                    {message.sender === "user" && (
                      <div className="ml-2 flex items-center">
                        {message.delivered && (
                          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 6L5 10L15 1" stroke={message.read ? "#10B981" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            {message.read && (
                              <path d="M4 6L8 10L18 1" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            )}
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Enhanced Typing Indicator for message composition */}
            {isTyping && (
              <div className="flex justify-start items-center mb-4">
                <div className="bg-gray-700 text-white p-3 rounded-t-2xl rounded-br-2xl rounded-bl-md max-w-xs flex items-center shadow-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse delay-300"></div>
                    <span className="text-sm">
                      {name} is typing{typingDots}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="bg-black p-4 flex items-center border-t border-gray-800">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-grow bg-gray-800 text-white p-3 rounded-full mr-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />

            {/* Send Button */}
            <button
              className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSendMessage}
              disabled={input.trim() === ""}
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
