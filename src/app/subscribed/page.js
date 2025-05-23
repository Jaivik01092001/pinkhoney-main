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

  async function update_plan(user_id, selected_plan, email) {
    try {
      console.log(`${selected_plan} request sent`);

      // Use the centralized API service
      const jsonData = await apiPost("api/change_subscription", {
        user_id,
        selected_plan,
        email
      });

      console.log(jsonData);
      const status = jsonData["status"];
      if (status == "success") {
        router.push(`/home?email=${email}`);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  }

  useEffect(() => {
    update_plan(user_id, selected_plan, email);
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
            <p className="text-white mb-6">Your subscription has been successfully activated.</p>
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
