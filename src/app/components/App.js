import React from "react";
import Link from "next/link";

const App = ({ name, image }) => {
  return (
    <div className="grid place-items-center">
      <div className="grid place-items-center">
        <div className="relative h-[600px] grid place-items-center">
          {/* Card Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl grid place-items-center">
            {/* Image */}
            <img
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}${image}`}
              alt="Profile"
              className="w-full h-[600px] object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute h-32 bg-gradient-to-t from-black/60 to-transparent grid place-items-center">
              {/* Name */}
              <div className="absolute top-48 grid place-items-center">
                <h2 className="text-white text-3xl font-bold">
                  {name}
                </h2>
                <Link href="/chat">
                  <button className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-6 rounded-full transition-colors">
                    Chat Now
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
