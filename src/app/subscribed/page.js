"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiPost } from "@/services/api";
import NavigationBar from "../components/NavigationBar";

function Pricing() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const user_id = searchParams.get("user_id");
  const email = searchParams.get("email");
  const selected_plan = searchParams.get("selected_plan");

  const [paymentStatus, setPaymentStatus] = useState("checking");
  const [sessionId, setSessionId] = useState("");

  // Function to check payment status
  async function checkPaymentStatus(sessionId) {
    try {
      if (!sessionId) return;

      console.log(`Checking payment status for session ID: ${sessionId}`);

      // First try the local API endpoint
      try {
        const response = await fetch(`/api/check_payment_status/${sessionId}`);

        // Check if the response is valid JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Received non-JSON response:", contentType);
          throw new Error("Invalid response format");
        }

        const data = await response.json();
        console.log("Payment status check result:", data);

        if (data.success && data.payment) {
          setPaymentStatus(data.payment.status);
          return data.payment.status;
        } else {
          throw new Error(data.error || "Payment check failed");
        }
      } catch (localApiError) {
        console.error("Local API payment check failed:", localApiError);

        // If local API fails, try direct Stripe check
        try {
          console.log("Attempting direct check with Stripe API...");

          // Use the centralized API service for a direct Stripe check
          const stripeCheck = await apiPost("api/direct_stripe_check", {
            session_id: sessionId
          });

          console.log("Direct Stripe check result:", stripeCheck);

          if (stripeCheck.success) {
            // Map Stripe payment_status to our internal status
            const status = stripeCheck.status === "paid" ? "completed" : "pending";
            setPaymentStatus(status);

            // If payment is completed, update the subscription
            if (status === "completed" && user_id && selected_plan) {
              console.log("Payment completed, updating subscription...");
              try {
                await apiPost("api/change_subscription", {
                  user_id,
                  selected_plan,
                  email
                });
                console.log("Subscription updated successfully");
              } catch (updateError) {
                console.error("Error updating subscription:", updateError);
              }
            }

            return status;
          } else {
            throw new Error("Direct Stripe check failed");
          }
        } catch (stripeError) {
          console.error("Direct Stripe check failed:", stripeError);
          // Fall through to error handling
        }
      }

      // If we get here, both checks failed
      setPaymentStatus("error");
      return "error";
    } catch (error) {
      console.error("Error in payment status check:", error);
      setPaymentStatus("error");
      return "error";
    }
  }

  async function update_plan(user_id, selected_plan, email, sessionId) {
    try {
      console.log(`Processing subscription for plan: ${selected_plan}`);

      // First check if we have a session ID and check its status
      if (sessionId) {
        const status = await checkPaymentStatus(sessionId);
        console.log(`Payment status: ${status}`);

        // If payment status check already updated the subscription, don't do it again
        if (status === "completed") {
          console.log("Subscription already updated during payment status check");

          // Show success message for a moment before redirecting
          setTimeout(() => {
            router.push(`/home?user_id=${user_id}&email=${email}`);
          }, 3000);

          return;
        }
      }

      // If payment status check didn't update the subscription, do it now
      console.log("Updating subscription via API...");
      const jsonData = await apiPost("api/change_subscription", {
        user_id,
        selected_plan,
        email
      });

      console.log("Subscription update response:", jsonData);
      const status = jsonData["status"];
      if (status === "success") {
        // Don't redirect immediately, wait a moment to show the success message
        setTimeout(() => {
          router.push(`/home?user_id=${user_id}&email=${email}`);
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  }

  useEffect(() => {
    // Extract session ID from URL if present
    const url = window.location.href;
    const sessionIdMatch = url.match(/session_id=([^&]+)/);

    if (sessionIdMatch && sessionIdMatch[1]) {
      const extractedSessionId = sessionIdMatch[1];
      setSessionId(extractedSessionId);
      console.log(`Found session ID in URL: ${extractedSessionId}`);
    }

    update_plan(user_id, selected_plan, email, sessionIdMatch ? sessionIdMatch[1] : null);
  }, []); // Ensure this runs only once on component mount

  return (
    <>
      <NavigationBar
        type="breadcrumbs"
        breadcrumbs={[
          { label: "Home", url: "/home" },
          { label: "Subscription", url: "" }
        ]}
        params={{ user_id: user_id, email: email }}
        className="mb-4"
      />

      <div className="flex flex-col items-center justify-center p-8 mt-10">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-1 rounded-lg">
          <div className="bg-black p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Subscription Confirmed!</h2>

            {paymentStatus === "checking" && (
              <div className="mb-6">
                <p className="text-white">Verifying your payment status...</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-pink-500 h-2.5 rounded-full animate-pulse w-full"></div>
                </div>
              </div>
            )}

            {paymentStatus === "completed" && (
              <p className="text-white mb-6">
                Your payment has been processed and your subscription is now active!
              </p>
            )}

            {paymentStatus === "pending" && (
              <p className="text-white mb-6">
                Your payment is being processed. Your subscription will be activated shortly.
              </p>
            )}

            {paymentStatus === "error" && (
              <p className="text-white mb-6">
                There was an issue verifying your payment status, but don't worry!
                Your subscription will be activated once the payment is confirmed.
              </p>
            )}

            {sessionId && (
              <p className="text-xs text-gray-400 mb-4">
                Transaction ID: {sessionId.substring(0, 16)}...
              </p>
            )}

            <button
              onClick={() => router.push(`/home?user_id=${user_id}&email=${email}`)}
              className="w-full bg-pink-500 text-white rounded-full py-3 px-6 font-medium hover:bg-pink-600 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Pricing;
