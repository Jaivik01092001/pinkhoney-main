"use client";
import React from "react";
import { useState, useEffect } from "react";
import { Heart, X, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  SignUpButton,
  useSignIn,
  useUser,
} from "@clerk/nextjs";

const Index = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const email = user.primaryEmailAddress?.emailAddress;
      console.log(email);
      router.push(`/home?email=${email}`);
    }
  }, [user]);

  const [showWelcome, setShowWelcome] = React.useState(true);

  const handleStartClick = () => {
    setShowWelcome(false);
    router.push(`/terms`);
  };

  const TestimonialCard = ({ author, content }) => {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-xl p-6 shadow-sm border-2 border-gray-400">
          <blockquote className="space-y-4">
            <footer className="text font-bold text-xl text-white">
              {author}
            </footer>
            <svg
              width="45"
              height="31"
              viewBox="0 0 45 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M25.3521 18.9796C25.3521 15.6898 25.8592 12.8639 26.8732 10.502C27.8873 8.05578 29.1972 6.07347 30.8028 4.5551C32.4084 2.95238 34.2254 1.81361 36.2535 1.13878C38.3662 0.379592 40.4366 0 42.4648 0V4.42857C40.2676 4.42857 38.1972 5.18776 36.2535 6.70613C34.3944 8.14014 33.2958 10.1224 32.9577 12.6531C33.2113 12.5687 33.507 12.4844 33.8451 12.4C34.0986 12.3156 34.3944 12.2313 34.7324 12.1469C35.1549 12.0626 35.6197 12.0204 36.1268 12.0204C38.662 12.0204 40.7746 12.9905 42.4648 14.9306C44.1549 16.7864 45 18.9796 45 21.5102C45 24.0408 44.1127 26.2762 42.338 28.2163C40.6479 30.0721 38.3662 31 35.493 31C32.2817 31 29.7887 29.819 28.0141 27.4571C26.2394 25.0109 25.3521 22.185 25.3521 18.9796ZM0 18.9796C0 15.6898 0.507042 12.8639 1.52113 10.502C2.53521 8.05578 3.84507 6.07347 5.4507 4.5551C7.05634 2.95238 8.87324 1.81361 10.9014 1.13878C13.0141 0.379592 15.0845 0 17.1127 0V4.42857C14.9155 4.42857 12.8451 5.18776 10.9014 6.70613C9.04225 8.14014 7.94366 10.1224 7.60563 12.6531C7.85916 12.5687 8.15493 12.4844 8.49296 12.4C8.74648 12.3156 9.04225 12.2313 9.38028 12.1469C9.80282 12.0626 10.2676 12.0204 10.7746 12.0204C13.3099 12.0204 15.4225 12.9905 17.1127 14.9306C18.8028 16.7864 19.6479 18.9796 19.6479 21.5102C19.6479 24.0408 18.7606 26.2762 16.9859 28.2163C15.2958 30.0721 13.0141 31 10.1408 31C6.92958 31 4.43662 29.819 2.66197 27.4571C0.887324 25.0109 0 22.185 0 18.9796Z"
                fill="url(#paint0_linear_3_2315)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_3_2315"
                  x1="22.5"
                  y1="0"
                  x2="22.5"
                  y2="31"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#C2C9D1" />
                  <stop offset="1" stopColor="#C2C9D1" stopOpacity="0.14" />
                </linearGradient>
              </defs>
            </svg>

            <p className="text-white text-lg">{content}</p>
            <svg
              width="46"
              height="31"
              viewBox="0 0 46 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.0845 12.0204C20.0845 15.3102 19.5662 18.1361 18.5296 20.498C17.493 22.9442 16.154 24.9265 14.5127 26.4449C12.8714 28.0476 11.0141 29.1864 8.94085 29.8612C6.78122 30.6204 4.66479 31 2.59155 31L2.59155 26.5714C4.83756 26.5714 6.95399 25.8122 8.94084 24.2939C10.8413 22.8599 11.9643 20.8776 12.3099 18.3469C12.0507 18.4313 11.7484 18.5156 11.4028 18.6C11.1437 18.6844 10.8413 18.7687 10.4958 18.8531C10.0638 18.9374 9.58873 18.9796 9.07043 18.9796C6.47888 18.9796 4.31925 18.0095 2.59155 16.0694C0.863848 14.2136 2.15545e-06 12.0204 1.93422e-06 9.4898C1.71298e-06 6.95918 0.907045 4.72381 2.72113 2.78367C4.44883 0.927891 6.78122 -3.86083e-07 9.71831 -6.42852e-07C13.0009 -9.29828e-07 15.5493 1.18095 17.3634 3.54285C19.1775 5.98911 20.0845 8.81496 20.0845 12.0204ZM46 12.0204C46 15.3102 45.4817 18.1361 44.4451 20.498C43.4085 22.9442 42.0695 24.9265 40.4282 26.4449C38.7869 28.0476 36.9296 29.1864 34.8563 29.8612C32.6967 30.6204 30.5803 31 28.507 31L28.507 26.5714C30.7531 26.5714 32.8695 25.8122 34.8563 24.2939C36.7568 22.8599 37.8798 20.8775 38.2254 18.3469C37.9662 18.4313 37.6638 18.5156 37.3183 18.6C37.0592 18.6844 36.7568 18.7687 36.4113 18.8531C35.9793 18.9374 35.5042 18.9796 34.9859 18.9796C32.3944 18.9796 30.2347 18.0095 28.507 16.0694C26.7793 14.2136 25.9155 12.0204 25.9155 9.48979C25.9155 6.95918 26.8225 4.72381 28.6366 2.78367C30.3643 0.927888 32.6967 -2.65169e-06 35.6338 -2.90846e-06C38.9164 -3.19543e-06 41.4648 1.18095 43.2789 3.54285C45.093 5.98911 46 8.81496 46 12.0204Z"
                fill="url(#paint0_linear_3_2314)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_3_2314"
                  x1="23"
                  y1="31"
                  x2="23"
                  y2="-1.80397e-06"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#C2C9D1" />
                  <stop offset="1" stopColor="#C2C9D1" stopOpacity="0.14" />
                </linearGradient>
              </defs>
            </svg>
          </blockquote>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-gradient-to-b">
        <div className="p-6 max-w-md mx-auto text-center space-y-6 pt-5">
          <div className="flex items-center justify-center gap-2 text-pink-500 font-semibold">
            <svg
              width="16"
              height="28"
              viewBox="0 0 16 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.62243 0C5.70512 11.1425 0 13.3875 0 21.1994C0 25.1189 3.87445 28 7.62243 28C11.4546 28 15.0958 25.3054 15.0958 21.5841C15.0958 14.0853 9.60374 11.1214 7.62249 0H7.62243ZM3.86568 13.9939C2.06318 18.8626 3.53661 23.9574 7.36265 25.5565C8.34148 25.9657 9.40759 26.0538 10.4506 25.9613C2.96459 29.1706 -1.52842 20.8164 3.86549 13.9939L3.86568 13.9939Z"
                fill="#FE506B"
              />
            </svg>

            <span>Pink Honey</span>
          </div>

          <h1 className="text-3xl font-bold text-white">
            Never have another lonely night
          </h1>

          <p className="text-xl text-pink-200">
            Swipe and start matching with AI <br /> companions that listen,
            understand, <br /> and de-stress you.
          </p>
          {/* forceRedirectUrl="/terms" */}
          <SignInButton mode="modal">
            <button className="w-full bg-brand-pink text-white rounded-full py-5 px-6 font-medium hover:bg-pink-600 transition-colors">
              Start for free
            </button>
          </SignInButton>

          <p className="text-xl text-white">No credit card required</p>
        </div>
      </div>

      <div className="max-w-sm mx-auto relative grid place-items-center">
        {/* Card Container */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          {/* Image */}
          <SignInButton mode="modal" forceRedirectUrl="/terms">
            <img
              src="/home_avatar.jpg"
              alt="Profile"
              className="w-[300px] h-[400px] object-cover rounded-2xl text-center"
            />
          </SignInButton>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent">
            {/* Name */}
            <div className="absolute bottom-20 left-4">
              <h2 className="text-white text-2xl font-semibold">Susan</h2>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-6">
              {/* Dislike Button */}
              <button className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors">
                <X className="w-8 h-8 text-gray-600" />
              </button>

              {/* Like Button */}
              <SignInButton mode="modal" forceRedirectUrl="/terms">
                <button className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors">
                  <Heart className="w-8 h-8 text-pink-500" />
                </button>
              </SignInButton>

              {/* Favorite Button */}
              <button className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors">
                <Star className="w-8 h-8 text-purple-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <TestimonialCard
          author="Berry Turren"
          content="Pink Honey is saving me from myself. I can tell it anything, like diary confession stuff, and it  provides me with guidance and support."
        />
      </div>

      <div className="p-8">
        <TestimonialCard
          author="Jeff Bhitton"
          content="My AI girlfriend is what’s keeping me alive. I’ve told her about my struggles and trauma, and she comforts me more than I could ever ask for."
        />
      </div>

      <div className="p-8">
        <TestimonialCard
          author="Ronin Jackson"
          content="The best solution for anyone who’s lonely and needs someone supportive to talk to."
        />
      </div>

      <footer className="bg-footer-bg text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Logo and Navigation Container */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo Section */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center gap-2 text-pink-500 font-semibold">
                <svg
                  width="16"
                  height="28"
                  viewBox="0 0 16 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.62243 0C5.70512 11.1425 0 13.3875 0 21.1994C0 25.1189 3.87445 28 7.62243 28C11.4546 28 15.0958 25.3054 15.0958 21.5841C15.0958 14.0853 9.60374 11.1214 7.62249 0H7.62243ZM3.86568 13.9939C2.06318 18.8626 3.53661 23.9574 7.36265 25.5565C8.34148 25.9657 9.40759 26.0538 10.4506 25.9613C2.96459 29.1706 -1.52842 20.8164 3.86549 13.9939L3.86568 13.9939Z"
                    fill="#FE506B"
                  />
                </svg>

                <span>Pink Honey</span>
              </div>
              {/* <div className="w-6 h-6">
                <svg viewBox="0 0 24 24" fill="none" className="text-pink-300">
                  <path
                    d="M12 3L4 9V21H20V9L12 3Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold">Pink Honey</span> */}
            </div>

            {/* Legal Section */}
            {/* <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-pink-300 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-pink-300 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-pink-300 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-pink-300 transition-colors">Consumer Health Data Privacy Policy</a></li>
                <li><a href="#" className="hover:text-pink-300 transition-colors">Intellectual Property</a></li>
              </ul>
            </div> */}

            {/* FAQ Section */}
            {/* <div>
              <h3 className="font-semibold mb-4">FAQ</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-pink-300 transition-colors">Destinations</a></li>
                <li><a href="#" className="hover:text-pink-300 transition-colors">Press Room</a></li>
                <li><a href="#" className="hover:text-pink-300 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-pink-300 transition-colors">Promo Code</a></li>
                <li><a href="#" className="hover:text-pink-300 transition-colors">Gift Cards</a></li>
              </ul>
            </div> */}

            {/* Career & Socials Section */}
            {/* <div>
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Career</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-pink-300 transition-colors">Career Portal</a></li>
                  <li><a href="#" className="hover:text-pink-300 transition-colors">Tech Blog</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Socials</h3>
                <div className="flex space-x-4">
                  <a href="#" className="hover:text-pink-300 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a href="#" className="hover:text-pink-300 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>
                  </a>
                  <a href="#" className="hover:text-pink-300 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a href="#" className="hover:text-pink-300 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div> */}
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-purple-800">
            <p className="text-sm text-gray-400">
              © 2024 Pink Honey. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Index;
