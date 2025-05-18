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
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
            <ClerkAuthSync />
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
