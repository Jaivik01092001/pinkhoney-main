"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import VoiceCall from '@/components/VoiceCall';
import { Phone } from 'lucide-react';

export default function CallPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name") || "AI Companion";
  const personality = searchParams.get("personality") || "Friendly";
  const image = searchParams.get("image") || "/placeholder.jpg";
  const user_id = searchParams.get("user_id");
  const email = searchParams.get("email");

  const [isCallActive, setIsCallActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);

  // Start the call
  const startCall = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      // Call the API to initialize the call
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companion_name: name,
          personality,
          user_id
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initialize call');
      }

      // Set call as active
      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting call:', error);
      setError(error instanceof Error ? error.message : 'Failed to start call');
    } finally {
      setIsInitializing(false);
    }
  };

  // End the call
  const endCall = () => {
    setIsCallActive(false);
  };

  // Go back to chat
  const goToChat = () => {
    router.push(`/chat?name=${name}&personality=${personality}&image=${image}&user_id=${user_id}&email=${email}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-3 bg-black">
      <div className="flex flex-col gap-4 items-center w-full max-w-md">
        <div className="bg-zinc-900 p-6 rounded-xl shadow-lg w-full">
          {isCallActive ? (
            // Active call view
            <VoiceCall
              name={name}
              personality={personality}
              image={image}
              userId={user_id || undefined}
              onEndCall={endCall}
            />
          ) : (
            // Call initialization view
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Voice Call</h1>

              <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src={image}
                  alt={name}
                  className="object-cover w-full h-full"
                />
              </div>

              <h2 className="text-xl text-white mb-2">{name}</h2>
              <p className="text-zinc-400 mb-6">Personality: {personality}</p>

              {error && (
                <p className="text-red-500 mb-4">
                  {error}
                </p>
              )}

              <div className="flex flex-col space-y-4">
                <button
                  onClick={startCall}
                  disabled={isInitializing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Phone className="mr-2" size={20} />
                  {isInitializing ? 'Connecting...' : 'Start Voice Call'}
                </button>

                <button
                  onClick={goToChat}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Go to Text Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
