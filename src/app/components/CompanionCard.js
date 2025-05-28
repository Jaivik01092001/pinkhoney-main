"use client";

import React from "react";
import { useRouter } from "next/navigation";

const CompanionCard = ({ 
  companion, 
  user_id, 
  email, 
  onClick, 
  showDetailButton = true,
  className = "",
  children 
}) => {
  const router = useRouter();

  const handleDetailClick = (e) => {
    e.stopPropagation(); // Prevent triggering parent onClick
    
    const queryParams = new URLSearchParams();
    if (user_id) queryParams.append("user_id", user_id);
    if (email) queryParams.append("email", email);
    queryParams.append("returnUrl", window.location.pathname);
    
    const queryString = queryParams.toString();
    const detailUrl = queryString 
      ? `/companion/${companion._id}?${queryString}` 
      : `/companion/${companion._id}`;
    
    router.push(detailUrl);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(companion);
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      onClick={handleCardClick}
    >
      {/* Card Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        {/* Image */}
        <img
          src={`${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
          }${companion.imageUrl || companion.image}`}
          alt={`${companion.name}'s profile`}
          className="w-full h-[600px] object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent">
          {/* Name and Age */}
          <div className="absolute bottom-20 left-4 right-4">
            <h2 className="text-white text-2xl font-semibold">
              {companion.name}
              {companion.age && (
                <span className="text-lg font-normal text-gray-300 ml-2">
                  {companion.age}
                </span>
              )}
            </h2>
            
            {/* Bio Preview */}
            {companion.bio && (
              <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                {companion.bio}
              </p>
            )}
          </div>

          {/* Detail Button */}
          {showDetailButton && (
            <button
              onClick={handleDetailClick}
              className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
            >
              View Details
            </button>
          )}
        </div>

        {/* Info Icon for Detail View */}
        {showDetailButton && (
          <button
            onClick={handleDetailClick}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Children (for action buttons, etc.) */}
      {children}
    </div>
  );
};

export default CompanionCard;
