"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { apiPost } from "@/services/api";
import NavigationBar from "../components/NavigationBar";
import BottomNavigation from "../components/BottomNavigation";

export default function Profile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  // Get URL parameters
  const email = searchParams.get("email");
  const urlUserId = searchParams.get("user_id");

  // State for user data
  const [userData, setUserData] = useState({
    user_id: urlUserId || "",
    email: email || "",
    firstName: "",
    lastName: "",
    tokens: "0",
    subscribed: "no",
    subscription: {
      plan: "free",
      status: "inactive",
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState({
    email: false,
    password: false,
  });
  const [editValues, setEditValues] = useState({
    email: "",
    password: "",
  });

  // Fetch user data from backend
  const fetchUserData = async (userEmail) => {
    try {
      setLoading(true);
      const response = await apiPost("api/get_user_by_email", {
        email: userEmail,
      });

      if (response.user_id) {
        setUserData((prev) => ({
          ...prev,
          user_id: response.user_id,
          tokens: response.tokens || "0",
          subscribed: response.subscribed || "no",
          firstName: response.firstName || "",
          lastName: response.lastName || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    if (isLoaded && user) {
      const userEmail = user.primaryEmailAddress?.emailAddress;
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";

      setUserData((prev) => ({
        ...prev,
        email: userEmail || email || "",
        firstName: firstName,
        lastName: lastName,
      }));

      // Initialize edit values
      setEditValues((prev) => ({
        ...prev,
        email: userEmail || email || "",
      }));

      if (userEmail) {
        fetchUserData(userEmail);
      }
    } else if (email && !user) {
      // Fallback if no Clerk user but email in URL
      fetchUserData(email);
    }
  }, [isLoaded, user, email]);

  // Handle billing button click
  const handleBillingClick = () => {
    router.push(`/pricing?user_id=${userData.user_id}&email=${userData.email}`);
  };

  // Check if user signed in with Google (has external account)
  const isGoogleSignIn = () => {
    return (
      user?.externalAccounts?.some(
        (account) => account.provider === "google"
      ) || false
    );
  };

  // Save profile changes to backend
  const saveProfileChanges = async (field, value) => {
    try {
      // Here you would call your backend API to update the user profile
      // For now, we'll just update the local state
      console.log(`Saving ${field}:`, value);

      if (field === "email") {
        setUserData((prev) => ({ ...prev, email: value }));
      }
      // For password updates, you would call a specific API endpoint

      return true;
    } catch (error) {
      console.error(`Error saving ${field}:`, error);
      return false;
    }
  };

  // Handle edit toggle
  const handleEditToggle = async (field) => {
    if (isEditing[field]) {
      // Save the changes
      const success = await saveProfileChanges(field, editValues[field]);
      if (!success) {
        // If save failed, don't exit edit mode
        return;
      }
    } else {
      // Start editing
      setEditValues((prev) => ({
        ...prev,
        [field]: field === "email" ? userData.email : "",
      }));
    }

    setIsEditing((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get display name
  const getDisplayName = () => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    } else if (userData.firstName) {
      return userData.firstName;
    } else if (userData.lastName) {
      return userData.lastName;
    } else {
      return userData.email?.split("@")[0] || "User";
    }
  };

  // Get subscription display
  const getSubscriptionDisplay = () => {
    if (userData.subscribed === "yes") {
      return "Premium";
    }
    return "Free";
  };

  // Get user avatar (using Clerk's avatar or default)
  const getUserAvatar = () => {
    if (user?.imageUrl) {
      return user.imageUrl;
    }
    // Default avatar - pink circle with user icon
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black-color flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-color">
      {/* Navigation */}
      <NavigationBar
        type="back"
        backUrl="/home"
        title="Profile Settings"
        params={{ user_id: userData.user_id, email: userData.email }}
        className="mb-4"
      />

      {/* Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                  fill="#FE506B"
                />
              </svg>
            </div>
            <h1 className="text-white text-xl font-semibold">Pink Honey</h1>
          </div>
          <div className="flex items-center bg-red-600 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
            <span className="text-white text-sm font-medium">
              {userData.tokens || "0"}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Settings Title */}
      <div className="px-4 mb-8">
        <h2 className="text-white text-2xl font-bold">Profile Settings</h2>
      </div>

      {/* Profile Section */}
      <div className="px-4 mb-8">
        <div className="border-2 border-brand-pink rounded-lg p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-brand-pink flex items-center justify-center">
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 10C13.933 10 15.5 8.433 15.5 6.5C15.5 4.56701 13.933 3 12 3C10.067 3 8.5 4.56701 8.5 6.5C8.5 8.433 10.067 10 12 10Z"
                    fill="white"
                  />
                  <path
                    d="M3 20.4V21H21V20.4C21 18.1598 21 17.0397 20.5641 16.184C20.1806 15.4314 19.5686 14.8195 18.816 14.436C17.9603 14 16.8402 14 14.6 14H9.4C7.1598 14 6.0397 14 5.18405 14.436C4.43139 14.8195 3.81947 15.4314 3.43598 16.184C3 17.0397 3 18.1598 3 20.4Z"
                    fill="white"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* User Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Nickname */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Nickname
              </label>
              <div className="text-white font-medium">{getDisplayName()}</div>
            </div>

            {/* Gender */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Gender</label>
              <div className="text-white font-medium">Male</div>
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email</label>
              <div className="text-white font-medium flex items-center">
                {isEditing.email ? (
                  <input
                    type="email"
                    value={editValues.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-gray-800 text-white px-2 py-1 rounded border border-brand-pink focus:outline-none focus:border-pink-400 flex-1 text-sm"
                    autoFocus
                  />
                ) : (
                  <span className="truncate">{userData.email}</span>
                )}
                {!isGoogleSignIn() && (
                  <button
                    onClick={() => handleEditToggle("email")}
                    className="ml-2 text-gray-400 hover:text-brand-pink transition-colors"
                  >
                    {isEditing.email ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Password
              </label>
              <div className="text-white font-medium flex items-center">
                {isEditing.password ? (
                  <input
                    type="password"
                    value={editValues.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter new password"
                    className="bg-gray-800 text-white px-2 py-1 rounded border border-brand-pink focus:outline-none focus:border-pink-400 flex-1 text-sm"
                    autoFocus
                  />
                ) : (
                  <span>••••••••</span>
                )}
                {!isGoogleSignIn() && (
                  <button
                    onClick={() => handleEditToggle("password")}
                    className="ml-2 text-gray-400 hover:text-brand-pink transition-colors"
                  >
                    {isEditing.password ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan */}
      <div className="px-4 mb-6">
        <div className="text-white mb-2">
          <span className="text-gray-400">Current Plan: </span>
          <span className="text-brand-pink font-semibold">
            {getSubscriptionDisplay()}
          </span>
        </div>
      </div>

      {/* Billing Button */}
      <div className="px-4 mb-24">
        <button
          onClick={handleBillingClick}
          className="w-full bg-brand-pink text-white py-4 rounded-full font-semibold text-lg hover:bg-pink-600 transition-colors"
        >
          Billing
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation userId={userData.user_id} email={userData.email} />
    </div>
  );
}
