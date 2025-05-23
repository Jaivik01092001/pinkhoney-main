"use client";

import React from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaPaperPlane } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { apiPost } from "@/services/api";

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

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const newMessage = {
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "user",
    };
    setMessages([...messages, newMessage]);
    setInput("");

    try {
      // Use the centralized API service
      const data = await apiPost("api/get_ai_response", {
        message: input,
        name: name,
        personality: personality,
      });

      for (let i = 0; i < data.llm_ans.length; i++) {
        console.log("Message:", data.llm_ans[i]);
        const botMessage = {
          text: data.llm_ans[i],
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: "bot",
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }

      // const botMessage = { text: data.llm_ans, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sender: "bot" };
      // setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
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
              <svg
                width="52"
                height="52"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="51"
                  height="51"
                  rx="14.5"
                  stroke="#FE506B"
                />
                <path
                  fillRule="evenodd"
                  clip-rule="evenodd"
                  d="M29.2071 31.7071C28.8166 32.0976 28.1834 32.0976 27.7929 31.7071L21.7929 25.7071C21.4024 25.3166 21.4024 24.6834 21.7929 24.2929L27.7929 18.2929C28.1834 17.9024 28.8166 17.9024 29.2071 18.2929C29.5976 18.6834 29.5976 19.3166 29.2071 19.7071L23.9142 25L29.2071 30.2929C29.5976 30.6834 29.5976 31.3166 29.2071 31.7071Z"
                  fill="#FE506B"
                />
              </svg>
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
            <button className="ml-4" onClick={handle_call}>
              <svg
                width="48"
                height="49"
                viewBox="0 0 48 49"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.5"
                  y="0.893555"
                  width="47"
                  height="47.313"
                  rx="14.5"
                  stroke="#E8E6EA"
                />
                <g clip-path="url(#clip0_0_2388)">
                  <path
                    fillRule="evenodd"
                    clip-rule="evenodd"
                    d="M16.3564 15.6386C16.5751 15.4202 16.8377 15.2508 17.1268 15.1416C17.416 15.0324 17.725 14.9859 18.0335 15.0051C18.342 15.0244 18.6429 15.109 18.9162 15.2533C19.1895 15.3977 19.429 15.5984 19.6189 15.8423L21.8626 18.7248C22.2739 19.2536 22.4189 19.9423 22.2564 20.5923L21.5726 23.3298C21.5375 23.4716 21.5395 23.6201 21.5785 23.7609C21.6175 23.9017 21.6921 24.03 21.7951 24.1336L24.8664 27.2048C24.97 27.3081 25.0986 27.3828 25.2396 27.4218C25.3807 27.4608 25.5294 27.4627 25.6714 27.4273L28.4076 26.7436C28.7284 26.6639 29.0631 26.6579 29.3866 26.7261C29.71 26.7943 30.0138 26.9349 30.2751 27.1373L33.1576 29.3798C34.1939 30.1861 34.2889 31.7173 33.3614 32.6436L32.0689 33.9361C31.1439 34.8611 29.7614 35.2673 28.4726 34.8136C25.1734 33.6543 22.1783 31.7658 19.7101 29.2886C17.2331 26.8208 15.3445 23.8261 14.1851 20.5273C13.7326 19.2398 14.1389 17.8561 15.0639 16.9311L16.3564 15.6386Z"
                    fill="#319F43"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_0_2388">
                    <rect
                      width="20"
                      height="20"
                      fill="white"
                      transform="translate(14 15.0001)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>
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
            {/* <div className="flex justify-center items-center mb-4">
                            <hr className="flex-grow border-gray-600" />
                            <span className="mx-4 text-gray-500">Today</span>
                            <hr className="flex-grow border-gray-600" />
                        </div> */}
          </div>
          <div className="bg-black p-4 flex items-center sticky bottom-14">
            <input
              type="text"
              placeholder="Your message"
              className="flex-grow bg-gray-800 text-white p-3 rounded-lg mr-4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              className="text-green-500 text-2xl"
              onClick={handleSendMessage}
            >
              <FaPaperPlane />
            </button>
          </div>

          <div className="sticky bottom-2 left-0 right-0 flex justify-center items-center gap-6">
            {/* Dislike Button */}
            <button className="w-14 h-14 flex items-center justify-center rounded-full  shadow-lg hover:bg-gray-100 transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="9.49902"
                  y="4.49756"
                  width="13"
                  height="18"
                  rx="2"
                  fill="#E94057"
                  stroke="#F3F3F3"
                />
                <rect
                  x="0.391602"
                  y="4.48901"
                  width="13"
                  height="18"
                  rx="2"
                  transform="rotate(-15 0.391602 4.48901)"
                  fill="#E94057"
                  stroke="#F3F3F3"
                />
              </svg>

              {/* <X className="w-8 h-8 text-gray-600" /> */}
            </button>

            {/* Like Button */}
            <button className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-100 transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 12C22 17.5229 17.5229 22 12 22C9.01325 22 2 22 2 22C2 22 2 14.5361 2 12C2 6.47715 6.47715 2 12 2C17.5229 2 22 6.47715 22 12Z"
                  fill="#ADAFBB"
                  stroke="#ADAFBB"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7 9H16"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7 13H16"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7 17H12"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              {/* <Heart className="w-8 h-8 text-pink-500" /> */}
            </button>

            {/* Favorite Button */}
            <button className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-100 transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 10C13.933 10 15.5 8.433 15.5 6.5C15.5 4.56701 13.933 3 12 3C10.067 3 8.5 4.56701 8.5 6.5C8.5 8.433 10.067 10 12 10Z"
                  fill="#ADAFBB"
                  stroke="#ADAFBB"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3 20.4V21H21V20.4C21 18.1598 21 17.0397 20.5641 16.184C20.1806 15.4314 19.5686 14.8195 18.816 14.436C17.9603 14 16.8402 14 14.6 14H9.4C7.1598 14 6.0397 14 5.18405 14.436C4.43139 14.8195 3.81947 15.4314 3.43598 16.184C3 17.0397 3 18.1598 3 20.4Z"
                  fill="#ADAFBB"
                  stroke="#ADAFBB"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              {/* <Star className="w-8 h-8 text-purple-500" /> */}
            </button>

            <button className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-100 transition-colors">
              <svg
                width="72"
                height="48"
                viewBox="0 0 72 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="72"
                  height="48"
                  rx="6"
                  fill="url(#paint0_linear_11_1446)"
                />
                <path
                  d="M42.2152 14.5714C42.3169 14.5714 42.4172 14.5954 42.5077 14.6416C42.5983 14.6878 42.6767 14.7548 42.7363 14.8372L42.7826 14.9117L46.2172 21.3514L46.2541 21.4389L46.2635 21.4714L46.2781 21.5374L46.2866 21.6129L46.2849 21.6986L46.2866 21.6429C46.2858 21.7299 46.2683 21.816 46.2352 21.8966L46.2095 21.948L46.1752 22.0046L46.1306 22.0637L36.5143 33.1757C36.432 33.2857 36.3157 33.3655 36.1835 33.4029L36.1338 33.4149L36.0506 33.4269L36.0001 33.4286L35.9143 33.4226L35.8406 33.4089L35.7523 33.3797L35.7301 33.3694C35.6507 33.3342 35.5799 33.2821 35.5226 33.2169L25.8618 22.0517L25.8086 21.9772L25.7675 21.8974L25.7375 21.8117L25.7178 21.7003V21.5906L25.7306 21.5057L25.7392 21.4714L25.7675 21.39L25.7915 21.3412L29.2201 14.9126C29.2678 14.823 29.3362 14.746 29.4195 14.6879C29.5027 14.6298 29.5986 14.5922 29.6992 14.5783L29.7858 14.5714H42.2152ZM39.3489 22.2857H32.6503L36.0018 30.9943L39.3489 22.2857ZM31.2746 22.2857H27.7629L34.0826 29.5869L31.2746 22.2857ZM44.2363 22.2857H40.7281L37.9226 29.5809L44.2363 22.2857ZM32.5929 15.8563H30.1715L27.4286 21H31.2206L32.5929 15.8563ZM38.0786 15.8563H33.9232L32.5518 21H39.4492L38.0786 15.8563ZM41.8295 15.8563H39.4081L40.7803 21H44.5715L41.8295 15.8563Z"
                  fill="white"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_11_1446"
                    x1="36"
                    y1="0"
                    x2="36"
                    y2="48"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0.305"
                      stopColor="#121212"
                      stopOpacity="0.52"
                    />
                    <stop offset="1" stopColor="#FE506B" stopOpacity="0.45" />
                  </linearGradient>
                </defs>
              </svg>

              {/* <Star className="w-8 h-8 text-purple-500" /> */}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
