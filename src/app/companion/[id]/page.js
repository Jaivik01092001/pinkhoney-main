"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import NavigationBar from "../../components/NavigationBar";
import BottomNavigation from "../../components/BottomNavigation";
import { apiGet } from "@/services/api";

export default function CompanionDetail() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Get URL parameters
  const companionId = params.id;
  const user_id = searchParams.get("user_id");
  const email = searchParams.get("email");
  const returnUrl = searchParams.get("returnUrl") || "/home";

  // State management
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch companion details
  useEffect(() => {
    const fetchCompanionDetails = async () => {
      if (!companionId) {
        setError("Companion ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiGet(`api/companions/id/${companionId}`);

        if (response.success && response.data) {
          setCompanion(response.data);
        } else {
          throw new Error(
            response.error || "Failed to fetch companion details"
          );
        }
      } catch (error) {
        console.error("Error fetching companion details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanionDetails();
  }, [companionId]);

  // Navigation functions
  const handleBack = () => {
    const queryParams = new URLSearchParams();
    if (user_id) queryParams.append("user_id", user_id);
    if (email) queryParams.append("email", email);

    const queryString = queryParams.toString();
    const backUrl = queryString ? `${returnUrl}?${queryString}` : returnUrl;

    router.push(backUrl);
  };

  const handleStartChat = () => {
    if (!companion) return;

    router.push(
      `/chat?name=${companion.name}&personality=${companion.personality}&image=${companion.imageUrl}&user_id=${user_id}&email=${email}`
    );
  };

  const handleStartCall = () => {
    if (!companion) return;

    router.push(
      `/call?name=${companion.name}&personality=${companion.personality}&image=${companion.imageUrl}&user_id=${user_id}&email=${email}`
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <NavigationBar
          type="back"
          backUrl={returnUrl}
          title="Companion Details"
          params={{ user_id, email }}
          className="mb-4"
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p>Loading companion details...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <NavigationBar
          type="back"
          backUrl={returnUrl}
          title="Companion Details"
          params={{ user_id, email }}
          className="mb-4"
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-400 p-4">
            <p className="mb-4">Error loading companion details:</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={handleBack}
              className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  // No companion found
  if (!companion) {
    return (
      <>
        <NavigationBar
          type="back"
          backUrl={returnUrl}
          title="Companion Details"
          params={{ user_id, email }}
          className="mb-4"
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-gray-400 p-4">
            <p className="mb-4">Companion not found</p>
            <button
              onClick={handleBack}
              className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavigationBar
        type="back"
        backUrl={returnUrl}
        title={companion.name}
        params={{ user_id, email }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800"
        onBack={handleBack}
      />

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-md mx-auto">
          {/* Hero Image Section */}
          <div className="relative mt-14 w-3/4 mx-auto">
            {" "}
            {/* Add top margin to account for navbar */}
            <img
              src={`${
                process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
              }${companion.imageUrl}`}
              alt={`${companion.name}'s profile`}
              className="w-full object-cover rounded-b-2xl"
            />
            {/* Gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl font-bold text-white mb-1">
                  {companion.name}
                </h1>
                {companion.age && (
                  <p className="text-lg text-gray-300">
                    {companion.age} years old
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            {/* Bio Section */}
            {companion.bio && (
              <div>
                <h2 className="text-xl font-semibold text-pink-400 mb-3">
                  About Me
                </h2>
                <p className="text-gray-300 leading-relaxed">{companion.bio}</p>
              </div>
            )}

            {/* Personality Section */}
            {companion.personality && (
              <div>
                <h2 className="text-xl font-semibold text-pink-400 mb-3">
                  Personality
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {companion.personality}
                </p>
              </div>
            )}

            {/* Personality Traits Section */}
            {companion.personalityTraits && (
              <div>
                <h2 className="text-xl font-semibold text-pink-400 mb-3">
                  Personality Traits
                </h2>
                <div className="space-y-3">
                  {companion.personalityTraits.primaryTrait && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                        Primary Trait
                      </h3>
                      <p className="text-white">
                        {companion.personalityTraits.primaryTrait}
                      </p>
                    </div>
                  )}
                  {companion.personalityTraits.emotionalStyle && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                        Emotional Style
                      </h3>
                      <p className="text-white">
                        {companion.personalityTraits.emotionalStyle}
                      </p>
                    </div>
                  )}
                  {companion.personalityTraits.communicationStyle && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                        Communication Style
                      </h3>
                      <p className="text-white">
                        {companion.personalityTraits.communicationStyle}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interests Section */}
            {companion.interests && companion.interests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-pink-400 mb-3">
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {companion.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleStartChat}
                className="w-full bg-pink-500 text-white py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors"
              >
                Start Chat
              </button>

              <button
                onClick={handleStartCall}
                className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
              >
                Start Voice Call
              </button>
            </div>
          </div>
        </div>

        {/* Add bottom padding for fixed navigation */}
        <div className="pb-20"></div>

        {/* Bottom Navigation */}
        <BottomNavigation userId={user_id} email={email} />
      </div>
    </>
  );
}
