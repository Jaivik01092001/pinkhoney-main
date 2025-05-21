"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ClerkAuthSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only run this effect when Clerk has loaded and the user is signed in
    if (!isLoaded || !isSignedIn || !user) return;

    const syncUserWithDatabase = async () => {
      try {
        // Get user details from Clerk
        const userId = user.id;
        const email = user.primaryEmailAddress?.emailAddress;
        const firstName = user.firstName;
        const lastName = user.lastName;

        if (!email) {
          console.error("User email not available");
          return;
        }

        // Call our API route to sync with MongoDB
        const response = await fetch("/api/clerk-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            email,
            firstName,
            lastName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to sync user with database:", errorData.error);
          return;
        }

        const data = await response.json();
        console.log("User synced with database:", data);

        // Redirect to home page with user_id and email as query parameters
        if (data.user_id) {
          // router.push(`/home?user_id=${data.user_id}&email=${email}`);
        }
      } catch (error) {
        console.error("Error syncing user with database:", error);
      }
    };

    syncUserWithDatabase();
  }, [isLoaded, isSignedIn, user, router]);

  // This component doesn't render anything
  return null;
}
