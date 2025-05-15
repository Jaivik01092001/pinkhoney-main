import React, { useState, useEffect } from "react";
import { RTVIError } from "realtime-ai";
import { useRTVIClient } from "realtime-ai-react";

// Define an interface for props
interface AppProps {
  name: string;
  image: string;
}

const App: React.FC<AppProps> = ({ name, image }) => {
  const voiceClient = useRTVIClient();
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    console.log("connect triggered")
    if (!voiceClient) return;

    try {
      await voiceClient.connect();
    } catch (e) {
      setError((e as RTVIError).message || "Unknown error occured");
      voiceClient.disconnect();
    }
  }

  useEffect(() => {
    // Trigger the connect function on page load
    connect();
  }, []);

  return (
    <div className="grid place-items-center">
      {/* <div className="text-red-500 text-bold">{error}</div> */}
      <button onClick={() => connect()} className="text-white text-lg font-semibold">Start Call</button>

      <div className="grid place-items-center">
        <div className="relative h-[600px] grid place-items-center">

          {/* Card Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl grid place-items-center">
            {/* Image */}
            <img
              src={image}
              alt="Profile"
              className="w-full h-[600px] object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute  h-32 bg-gradient-to-t from-black/60 to-transparent grid place-items-center">
              {/* Name */}
              <div className="absolute top-48 grid place-items-center">
                <h2 className="text-white text-3xl font-bold">
                  {name}
                </h2>
                <button onClick={() => connect()}>
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="60" rx="30" fill="#ED3326" />
                    <path d="M24.6667 31.9706V31.1493C24.6667 31.1493 24.6667 29.1946 30.0001 29.1946C35.3334 29.1946 35.3334 31.1493 35.3334 31.1493V31.6666C35.3334 32.9413 36.2974 34.0266 37.6001 34.216L40.2667 34.608C41.8801 34.844 43.3334 33.6346 43.3334 32.0573V29.224C43.3334 28.4413 43.0881 27.672 42.4934 27.1413C40.9734 25.7826 37.2267 23.3333 30.0001 23.3333C22.3347 23.3333 18.5867 26.7773 17.2534 28.3853C16.8334 28.8933 16.6667 29.5373 16.6667 30.188V32.752C16.6667 34.4826 18.3947 35.7226 20.1067 35.2213L22.7734 34.4386C23.8974 34.1093 24.6667 33.108 24.6667 31.972" fill="white" />
                  </svg>
                </button>
              </div>


            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
