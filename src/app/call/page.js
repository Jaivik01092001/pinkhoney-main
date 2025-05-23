"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { PhoneOff, Mic, MicOff } from "lucide-react";
import NavigationBar from "../components/NavigationBar";

function Call() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const personality = searchParams.get("personality");
  const image = searchParams.get("image");
  const [userId, setUserId] = useState(searchParams.get("user_id") || "");
  const email = searchParams.get("email");
  
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);

  // Handle call duration timer
  useEffect(() => {
    let timer;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  // Format call duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle ending the call
  const endCall = () => {
    setIsCallActive(false);
    // Navigate back to chat
    router.push(`/chat?name=${name}&personality=${personality}&image=${image}&user_id=${userId}&email=${email}`);
  };

  // Toggle mute status
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-black">
      <NavigationBar 
        type="back"
        backUrl="/chat"
        title="Voice Call"
        params={{ name, personality, image, user_id: userId, email }}
        className="mb-4"
      />
      
      <div className="flex flex-col items-center justify-center h-[80vh]">
        {/* Profile Image */}
        <div className="relative mb-8">
          <img 
            src={image} 
            alt={name} 
            className="w-40 h-40 rounded-full object-cover border-4 border-brand-pink"
          />
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-black"></div>
        </div>
        
        {/* Name and Status */}
        <h2 className="text-white text-2xl font-bold mb-2">{name}</h2>
        <p className="text-green-500 mb-6">
          {isCallActive ? "Call in progress" : "Call ended"}
        </p>
        
        {/* Call Duration */}
        <p className="text-gray-400 mb-12">{formatDuration(callDuration)}</p>
        
        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-8">
          <button 
            onClick={toggleMute} 
            className={`w-14 h-14 rounded-full flex items-center justify-center ${isMuted ? 'bg-gray-700' : 'bg-gray-600'}`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>
          
          <button 
            onClick={endCall} 
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Call;
