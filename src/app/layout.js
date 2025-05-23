import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import ClerkAuthSync from "./components/ClerkAuthSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PinkHoney",
  description: "PinkHoney",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-black-color">
          <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-brand-pink text-white px-4 py-2 rounded-full font-medium shadow-lg hover:bg-pink-600 transition-all duration-300">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
              <ClerkAuthSync />
            </SignedIn>
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
