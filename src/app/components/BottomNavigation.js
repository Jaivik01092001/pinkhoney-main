"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

/**
 * BottomNavigation component that provides consistent bottom navigation across the application
 *
 * @param {Object} props - Component props
 * @param {string} props.userId - User ID for navigation
 * @param {string} props.email - User email for navigation
 * @param {Function} props.onMessagesClick - Custom handler for messages button
 * @param {string} props.className - Additional CSS classes
 */
const BottomNavigation = ({
  userId = "",
  email = "",
  onMessagesClick = null,
  className = "",
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Construct URL with parameters
  const constructUrl = (baseUrl) => {
    const queryParams = new URLSearchParams();

    if (userId) queryParams.append("user_id", userId);
    if (email) queryParams.append("email", email);

    const queryString = queryParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Handle messages click
  const handleMessagesClick = () => {
    if (onMessagesClick) {
      onMessagesClick();
    } else {
      router.push(constructUrl("/all_chats"));
    }
  };

  // Handle profile click
  const handleProfileClick = () => {
    router.push(constructUrl("/profile"));
  };

  // Handle home/dislike button click
  const handleHomeClick = () => {
    router.push(constructUrl("/home"));
  };

  // Check if current page is active
  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-black-color border-t border-gray-800 px-4 py-3 flex justify-center items-center gap-6 z-50 ${className}`}
    >
      {/* Home/Dislike Button */}
      <button
        onClick={handleHomeClick}
        className={`w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-100 transition-colors ${
          isActive("/home") ? "bg-brand-pink" : ""
        }`}
      >
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
            fill={isActive("/home") ? "white" : "#E94057"}
            stroke="#F3F3F3"
          />
          <rect
            x="0.391602"
            y="4.48901"
            width="13"
            height="18"
            rx="2"
            transform="rotate(-15 0.391602 4.48901)"
            fill={isActive("/home") ? "white" : "#E94057"}
            stroke="#F3F3F3"
          />
        </svg>
      </button>

      {/* Messages/Chat Button */}
      <button
        onClick={handleMessagesClick}
        className={`w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-100 transition-colors ${
          isActive("/all_chats") ? "bg-brand-pink" : ""
        }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 12C22 17.5229 17.5229 22 12 22C9.01325 22 2 22 2 22C2 22 2 14.5361 2 12C2 6.47715 6.47715 2 12 2C17.5229 2 22 6.47715 22 12Z"
            fill={isActive("/all_chats") ? "white" : "#ADAFBB"}
            stroke={isActive("/all_chats") ? "white" : "#ADAFBB"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 9H16"
            stroke={isActive("/all_chats") ? "#FE506B" : "white"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 13H16"
            stroke={isActive("/all_chats") ? "#FE506B" : "white"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 17H12"
            stroke={isActive("/all_chats") ? "#FE506B" : "white"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Profile Button */}
      <button
        onClick={handleProfileClick}
        className={`w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-100 transition-colors ${
          isActive("/profile") ? "bg-brand-pink" : ""
        }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 10C13.933 10 15.5 8.433 15.5 6.5C15.5 4.56701 13.933 3 12 3C10.067 3 8.5 4.56701 8.5 6.5C8.5 8.433 10.067 10 12 10Z"
            fill={isActive("/profile") ? "white" : "#ADAFBB"}
            stroke={isActive("/profile") ? "white" : "#ADAFBB"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 20.4V21H21V20.4C21 18.1598 21 17.0397 20.5641 16.184C20.1806 15.4314 19.5686 14.8195 18.816 14.436C17.9603 14 16.8402 14 14.6 14H9.4C7.1598 14 6.0397 14 5.18405 14.436C4.43139 14.8195 3.81947 15.4314 3.43598 16.184C3 17.0397 3 18.1598 3 20.4Z"
            fill={isActive("/profile") ? "white" : "#ADAFBB"}
            stroke={isActive("/profile") ? "white" : "#ADAFBB"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Premium/Special Button */}
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
              <stop offset="0.305" stopColor="#121212" stopOpacity="0.52" />
              <stop offset="1" stopColor="#FE506B" stopOpacity="0.45" />
            </linearGradient>
          </defs>
        </svg>
      </button>
    </div>
  );
};

export default BottomNavigation;
