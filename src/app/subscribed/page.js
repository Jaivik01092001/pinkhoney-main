"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiPost } from "@/services/api";

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
      <p className="text-xl font-bold text-white">You are SUBSCRIBED !!!!</p>
    </>
  );
}

export default Pricing;
