"use client"
import React from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';


function Pricing() {
      const router = useRouter()

  const searchParams = useSearchParams()
  const user_id = searchParams.get("user_id")
  const email = searchParams.get("email")
  const selected_plan = searchParams.get("selected_plan")

  async function update_plan(user_id, selected_plan, email) {
    const formData = new FormData();
    formData.append('user_id', user_id);
    formData.append('selected_plan', selected_plan);
    formData.append('email', email);

    console.log(`${selected_plan} request sent`)
    const response = await fetch('http://127.0.0.1:8080/change_subscription', {
      method: 'POST',
      body: formData,
    });

    const jsonData = await response.json(); // Parse JSON response
    console.log(jsonData);
    const status = jsonData["status"]
    if (status == "success"){
      router.push(`/home?email=${email}`)
    }
  }

   useEffect(() => {
    update_plan(user_id, selected_plan, email);
    }, []); // Ensure this runs only once on component mount

  return (
    <>
   <p className="text-xl font-bold text-white">You are SUBSCRIBED !!!!</p>
    </>
  )
}

export default Pricing