"use client"
import React from 'react';
import { Heart, X, Star } from 'lucide-react';
import { useRouter } from 'next/navigation'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  SignUpButton,
  useSignIn,
  useUser 
} from '@clerk/nextjs'

const Terms = () => {
  const { user } = useUser();
  const router = useRouter()

  
    // useEffect(() => {
    //   if (user) {
    //     const email = user.primaryEmailAddress?.emailAddress;
    //     console.log(email)
    //     router(`/home?email=${email}`);
    //   }
    // }, [user]);

  const [showWelcome, setShowWelcome] = React.useState(true);

  const handleStartClick = () => {
    setShowWelcome(false);
  };

  const handle_agree_click = () => {
    setShowWelcome(false);
    router.push(`/create_account`)
  };

  const TestimonialCard = ({ author, content }) => {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-pink-50 rounded-xl p-6 shadow-sm border">
          <blockquote className="space-y-4">
            <footer className="text-black font-medium text-start">
              {author}
            </footer>
            <p className="text-gray-600 text-sm text-start">
              {content}
            </p>
          </blockquote>
        </div>
      </div>
    );
  };


  return (
    <>
      <div className="bg-gradient-to-b">
        <div className="p-6 max-w-md mx-auto text-center space-y-6 pt-20">
          <div className="flex items-center justify-center gap-2 text-pink-500 font-semibold">
            {/* <div className="w-2 h-2 rounded-full bg-pink-500" /> */}
            <svg width="19" height="32" viewBox="0 0 19 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.6331 0C7.44189 12.7343 0.921753 15.3 0.921753 24.2279C0.921753 28.7073 5.3497 32 9.6331 32C14.0127 32 18.1741 28.9204 18.1741 24.6675C18.1741 16.0975 11.8975 12.7102 9.63317 0H9.6331ZM5.33968 15.9931C3.27967 21.5573 4.9636 27.3799 9.33621 29.2074C10.4549 29.6751 11.6733 29.7757 12.8653 29.6701C4.30986 33.3378 -0.82501 23.7901 5.33946 15.993L5.33968 15.9931Z" fill="#FE506B" />
            </svg>

            <span>Pink Honey</span>
          </div>

          <h1 className="text-2xl font-bold text-white">
            Welcome to Pink Honey.Live!
          </h1>

          <p className="text-white">
            Please follow these guidelines to ensure a positive experience
          </p>

          <div className="max-w-md mx-auto p-6 rounded-lg shadow-md space-y-5">
            {[
              {
                title: "Be yourself",
                description: "Create a profile that reflects who you are (must be 18+).",
              },
              {
                title: "Respect the AI",
                description: "Treat your AI companions with kindness and respect.",
              },
              {
                title: "Stay safe",
                description: "Never share personal data or sensitive information within conversations.",
              },
              {
                title: "Have fun!",
                description: "Feel free to explore different connections and make meaningful interactions rewarding.",
              },
            ].map((rule, index) => (
              <div key={index} className="flex space-x-4 items-start">
                <div className="text-red-500 text-xl"><svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.44459 0C4.07509 7.95891 0 9.5625 0 15.1425C0 17.9421 2.76746 20 5.44459 20C8.18185 20 10.7827 18.0753 10.7827 15.4172C10.7827 10.0609 6.85982 7.94385 5.44464 0H5.44459ZM2.7612 9.99567C1.4737 13.4733 2.52615 17.1124 5.25904 18.2546C5.9582 18.5469 6.71971 18.6098 7.46473 18.5438C2.11757 20.8361 -1.09173 14.8688 2.76106 9.99563L2.7612 9.99567Z" fill="#FE506B" />
                </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-start">{rule.title}</h3>
                  <p className="text-white text-start">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handle_agree_click}
            className="w-full bg-brand-pink text-white rounded-full py-3 px-6 font-medium hover:bg-pink-600 transition-colors"
          >
            I agree
          </button>
        </div>
      </div>


    </>
  )
}

export default Terms;