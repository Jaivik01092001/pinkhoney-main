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
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Sign In
        </button>
    </SignInButton>
    </>
  )
}

export default page