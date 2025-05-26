"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FaPaperPlane } from "react-icons/fa";
import { apiPost, apiGet } from "@/services/api";
import NavigationBar from "../components/NavigationBar";

function Chat() {
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
  const [userName, setUserName] = useState(""); // Store user's name for personalization

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

  // Fetch user data to personalize greetings
  const fetchUserData = async () => {
    if (!email) return;

    try {
      const data = await apiPost("api/clerk_sync", { email });
      if (data.user_id) {
        // Try to get user's first name from the response
        // Note: The current API doesn't return firstName, but we can enhance it later
        // For now, we'll extract name from email if available
        // const emailName = email.split('@')[0];
        const capitalizedName = data.firstName
        setUserName(capitalizedName);
        return capitalizedName;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    return null;
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
        };

        setMessages((prevMessages) => [...prevMessages, botMessage]);

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
          console.log("No chat history found or empty history - generating welcome message");
          // Generate welcome message for new conversations
          await generateWelcomeMessage();
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, [userId, name]);

  // Generate simple welcome message for new conversations with typing simulation
  const generateWelcomeMessage = async () => {
    if (!userId || !name) return;

    try {
      console.log("Generating simple welcome message for", userName);

      // Fetch user data for personalization
      const fetchedName = await fetchUserData();

      // Brief pause before starting to type (makes it feel more natural)
      await simulateBriefPause();

      // Generate random delay for the welcome message (2-5 seconds)
      const typingDelay = getRandomTypingDelay();

      // Show typing indicator with animated dots
      await simulateTyping(typingDelay);


      // Create a personalized welcome message
      const greeting = fetchedName ? `Hey ${fetchedName}!` : "Hey!";
      const welcomeMessage = {
        text: `${greeting} How are you doing today?`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: "bot",
      };

      setMessages([welcomeMessage]);

      // Save the welcome message to database for persistence
      try {
        await apiPost("api/save_bot_message", {
          message_text: welcomeMessage.text,
          name: name,
          personality: personality || "friendly",
          user_id: userId,
          image: image,
        });
        console.log("Welcome message saved to database successfully");
      } catch (saveError) {
        console.error("Error saving welcome message to database:", saveError);
        // Continue even if saving fails - user still sees the message
      }

    } catch (error) {
      console.error("Error generating welcome message:", error);
      setIsTyping(false);
      setTypingDots("");

      // Add a fallback welcome message with typing simulation
      await simulateBriefPause();
      const typingDelay = getRandomTypingDelay();
      await simulateTyping(typingDelay);

      const greeting = userName ? `Hey ${userName}!` : "Hey!";
      const fallbackMessage = {
        text: `${greeting} How are you doing today?`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: "bot",
      };
      setMessages([fallbackMessage]);

      // Save the fallback welcome message to database for persistence
      try {
        await apiPost("api/save_bot_message", {
          message_text: fallbackMessage.text,
          name: name,
          personality: personality || "friendly",
          user_id: userId,
          image: image,
        });
        console.log("Fallback welcome message saved to database successfully");
      } catch (saveError) {
        console.error("Error saving fallback welcome message to database:", saveError);
        // Continue even if saving fails - user still sees the message
      }
    }
  };

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
          <NavigationBar
            type="breadcrumbs"
            breadcrumbs={[
              { label: "Matches", url: "/home" },
              { label: name, url: "" }
            ]}
            params={{ user_id: userId, email: email }}
          />
          <div className="bg-black p-2 flex items-center border-b border-gray-800">
            <img
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}${image}`}
              alt="User profile"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <div className="text-white font-bold text-lg">{name}</div>
              <div className="text-green-500 text-sm">Online</div>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
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

            {/* Enhanced Typing Indicator for message composition */}
            {isTyping && (
              <div className="flex justify-start items-center mb-4">
                <div className="bg-gray-800 text-white p-3 rounded-lg max-w-xs flex items-center">
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
          <div className="bg-black p-4 flex items-center sticky bottom-14 mt-9">
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
