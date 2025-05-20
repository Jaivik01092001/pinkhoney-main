"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CallPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "AI Companion";
  const personality = searchParams.get("personality") || "Friendly";
  const image = searchParams.get("image") || "/placeholder.jpg";

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-3">
      <div className="flex flex-col gap-4 items-center">
        <div className="bg-zinc-900 p-6 rounded-xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Voice Call Feature Unavailable</h1>
          
          <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
            <img 
              src={image} 
              alt={name} 
              className="object-cover w-full h-full"
            />
          </div>
          
          <h2 className="text-xl text-white mb-2">{name}</h2>
          <p className="text-zinc-400 mb-6">Personality: {personality}</p>
          
          <p className="text-zinc-300 mb-6">
            The voice call feature is currently unavailable. Please use the text chat feature instead.
          </p>
          
          <Link href={`/chat?name=${name}&personality=${personality}&image=${image}`}>
            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Go to Text Chat
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
