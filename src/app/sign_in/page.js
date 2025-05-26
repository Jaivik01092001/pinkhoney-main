import React from 'react'
import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
    SignUpButton,
    useSignIn
  } from '@clerk/nextjs'
function page() {



  return (
    <>
    <SignInButton mode="modal" forceRedirectUrl="/terms">
        <button className="bg-brand-pink text-white px-6 py-3 rounded-full font-medium shadow-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105">
          Sign In
        </button>
    </SignInButton>
    </>
  )
}

export default page