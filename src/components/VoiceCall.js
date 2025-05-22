import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

// Define call status constants
const CallStatus = {
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ENDED: "ended",
  ERROR: "error",
};

const VoiceCall = ({ name, personality, image, onEndCall }) => {
  const [callStatus, setCallStatus] = useState(CallStatus.CONNECTING);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connecting...");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isListening, setIsListening] = useState(false);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  // Store available speech synthesis voices
  const [voices, setVoices] = useState([]);

  // Track conversation state
  const isAISpeakingRef = useRef(false);
  const waitingForUserInputRef = useRef(false);
  const conversationTurnRef = useRef(0);

  // Track audio processing state
  const lastAudioSendTimeRef = useRef(0);
  const processingAudioRef = useRef(false);
  const MIN_AUDIO_INTERVAL_MS = 2000; // Minimum 2 seconds between audio sends
  const lastTranscriptRef = useRef(""); // Track the last transcript to avoid duplicates
  const silenceDetectionTimeoutRef = useRef(null);
  const audioBufferRef = useRef([]); // Buffer to accumulate audio chunks
  const MAX_BUFFER_SIZE = 3; // Maximum number of chunks to accumulate
  const audioSendTimeoutRef = useRef(null);

  // Load speech synthesis voices when available
  useEffect(() => {
    if ("speechSynthesis" in window) {
      // Get voices immediately if available
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }

      // Set up event listener for when voices change/load
      window.speechSynthesis.onvoiceschanged = () => {
        const newVoices = window.speechSynthesis.getVoices();
        setVoices(newVoices);
        console.log(`Loaded ${newVoices.length} speech synthesis voices`);
      };
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Initialize the call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Initialize Socket.IO connection with improved settings
        socketRef.current = io(
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
          {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
            transports: ["websocket", "polling"],
          }
        );

        // Set up socket event listeners
        socketRef.current.on("connect", handleSocketConnect);
        socketRef.current.on("ai-response", handleAIResponse);
        socketRef.current.on("error", handleSocketError);
        socketRef.current.on("disconnect", handleSocketDisconnect);
        socketRef.current.on("connect_error", handleConnectionError);
        socketRef.current.on("reconnect", handleReconnect);
        socketRef.current.on("reconnect_attempt", handleReconnectAttempt);
        socketRef.current.on("reconnect_error", handleReconnectError);
        socketRef.current.on("reconnect_failed", handleReconnectFailed);
        socketRef.current.on("heartbeat", handleHeartbeat);
        socketRef.current.on("call-ended", handleCallEnded);

        // Initialize audio context
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Request microphone access with optimized settings for speech recognition
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 44100, // Higher sample rate for better quality
          },
        });
        streamRef.current = stream;

        // We're not using browser speech recognition
        console.log("Using server-side transcription only");

        // Initialize MediaRecorder with the most reliable settings for speech recognition
        // We'll prioritize formats that are known to work well with speech recognition
        const mimeTypes = [
          // PCM audio is the most reliable for speech recognition
          "audio/webm;codecs=pcm",
          // Opus codec provides good quality and compression
          "audio/webm;codecs=opus",
          // Standard WebM format
          "audio/webm",
          // Other formats as fallbacks
          "audio/ogg;codecs=opus",
          "audio/ogg",
          "audio/mp3",
          "audio/mpeg",
          "audio/wav",
        ];

        // Find the first supported MIME type
        let selectedMimeType = "";

        // First check if PCM in WebM is supported (best quality)
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=pcm")) {
          selectedMimeType = "audio/webm;codecs=pcm";
          console.log("Using PCM audio format (highest quality)");
        }
        // Then check for WAV
        else if (MediaRecorder.isTypeSupported("audio/wav")) {
          selectedMimeType = "audio/wav";
          console.log("Using WAV audio format");
        }
        // Otherwise, try other formats
        else {
          for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
              selectedMimeType = mimeType;
              console.log(`Using audio format: ${mimeType}`);
              break;
            }
          }
        }

        if (!selectedMimeType) {
          console.log("Using browser default audio format");
        }

        // Configure MediaRecorder with optimal settings for speech
        const options = selectedMimeType
          ? {
              mimeType: selectedMimeType,
              audioBitsPerSecond: 256000, // Higher bitrate for better quality and transcription
            }
          : undefined;

        // Create MediaRecorder with the selected options or default
        let mediaRecorder;
        try {
          mediaRecorder = new MediaRecorder(stream, options);
          console.log("Using audio format:", mediaRecorder.mimeType);
        } catch (e) {
          console.warn(
            "Error creating MediaRecorder with selected format, using default format"
          );
          mediaRecorder = new MediaRecorder(stream);
          console.log("Using default audio format:", mediaRecorder.mimeType);
        }

        mediaRecorderRef.current = mediaRecorder;

        // Set up MediaRecorder event listeners
        mediaRecorder.ondataavailable = handleDataAvailable;

        // Use a longer interval (10 seconds) to get more complete speech segments
        // This helps reduce fragmentation and improves transcription accuracy
        // Longer segments are better for accurate transcription
        mediaRecorder.start(10000);

        // Update call status
        setCallStatus(CallStatus.CONNECTED);
        setStatusMessage("Connected");
      } catch (error) {
        console.error("Error initializing call:", error);
        setCallStatus(CallStatus.ERROR);
        setStatusMessage(
          "Failed to initialize call. Please check your microphone permissions."
        );
      }
    };

    initializeCall();

    // Clean up on component unmount
    return () => {
      cleanupCall();
    };
  }, []);

  // Handle socket connection
  const handleSocketConnect = () => {
    console.log("Socket connected");
    setCallStatus(CallStatus.CONNECTED);
    setStatusMessage("Connected");
  };

  // Start listening for user speech
  const startListening = () => {
    // Don't start listening if AI is currently speaking
    if (isAISpeakingRef.current) {
      console.log("AI is currently speaking, not starting listening");
      return;
    }

    // Set waiting for user input
    waitingForUserInputRef.current = true;

    // Set listening state to show visual indicator
    setIsListening(true);

    // Reset transcript display to show we're waiting for new input
    setTranscript("");

    // Show status message
    setStatusMessage("Please speak now");

    console.log("Ready to receive audio from MediaRecorder");
  };

  // Helper function to process queued audio
  const processQueuedAudio = () => {
    // Check if we have any audio in the buffer that was recorded during AI speech
    if (audioBufferRef.current.length > 0) {
      console.log(
        `Found ${audioBufferRef.current.length} audio chunks in buffer, processing them`
      );

      // Process the queued audio by creating a combined blob and sending it
      const combinedBlob = new Blob(audioBufferRef.current, {
        type: audioBufferRef.current[0].type,
      });

      // Convert the combined blob to array buffer and send it
      const reader = new FileReader();

      reader.onloadend = () => {
        if (socketRef.current && socketRef.current.connected) {
          try {
            // Get the result as ArrayBuffer
            const arrayBuffer = reader.result;

            if (!arrayBuffer) {
              console.error("Failed to read queued audio data");
              // Clear the audio buffer
              audioBufferRef.current = [];
              return;
            }

            // Convert ArrayBuffer to Base64 string for transmission
            let binary = "";
            const bytes = new Uint8Array(arrayBuffer);
            const len = bytes.byteLength;

            for (let i = 0; i < len; i++) {
              binary += String.fromCharCode(bytes[i]);
            }

            const base64Audio = btoa(binary);

            console.log(
              `Sending queued audio data (${base64Audio.length} bytes)`
            );

            // Send the base64 encoded audio data to the server
            // Use the actual MIME type from the MediaRecorder for better format handling
            const audioFormat = mediaRecorderRef.current?.mimeType.includes(
              "webm"
            )
              ? "webm"
              : mediaRecorderRef.current?.mimeType.includes("ogg")
              ? "ogg"
              : mediaRecorderRef.current?.mimeType.includes("mp3")
              ? "mp3"
              : "wav";

            console.log(
              `Sending queued audio with format: ${audioFormat} based on MIME type: ${mediaRecorderRef.current?.mimeType}`
            );

            socketRef.current.emit("voice-data", {
              audio: base64Audio,
              audio_format: audioFormat,
              companion_name: name,
              personality: personality,
            });

            // Clear the audio buffer after sending
            audioBufferRef.current = [];

            // Set processing flag to prevent sending more audio too quickly
            processingAudioRef.current = true;
            lastAudioSendTimeRef.current = Date.now();

            // Reset processing flag after a delay (reduced for better responsiveness)
            audioSendTimeoutRef.current = setTimeout(() => {
              console.log("Resetting processing flag after queued audio send");
              processingAudioRef.current = false;
            }, 2000);
          } catch (error) {
            console.error("Error processing queued audio:", error);
            audioBufferRef.current = [];
          }
        } else {
          console.warn("Socket not connected, cannot send queued audio");
          audioBufferRef.current = [];
        }
      };

      reader.onerror = () => {
        console.error("Error reading queued audio data");
        audioBufferRef.current = [];
      };

      // Read the combined blob
      reader.readAsArrayBuffer(combinedBlob);

      return true; // Audio was processed
    }

    return false; // No audio to process
  };

  // Handle AI response from server
  const handleAIResponse = (data) => {
    console.log("Received AI response:", data.text);
    setAiResponse(data.text);

    // Update conversation turn if provided
    if (data.conversationTurn) {
      conversationTurnRef.current = data.conversationTurn;
      console.log(
        `Conversation turn updated to: ${conversationTurnRef.current}`
      );
    }

    // Set the transcript from the server response if provided
    if (data.userTranscript) {
      console.log(`Setting transcript from server: "${data.userTranscript}"`);
      setTranscript(data.userTranscript);
    }

    // Store the transcript to avoid processing duplicate responses
    if (data.text) {
      lastTranscriptRef.current = data.text;
    }

    // Set AI as speaking
    isAISpeakingRef.current = true;

    // Set listening state to false when AI is speaking
    setIsListening(false);

    // Reset processing flag to allow new audio to be processed after AI finishes speaking
    processingAudioRef.current = false;

    // Clear any existing timeouts
    if (audioSendTimeoutRef.current) {
      clearTimeout(audioSendTimeoutRef.current);
      audioSendTimeoutRef.current = null;
    }

    // Play audio if volume is not muted and audio data is available
    if (!isVolumeMuted && audioContextRef.current && data.audio) {
      try {
        audioContextRef.current.decodeAudioData(
          data.audio,
          (buffer) => {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);

            // When audio playback ends, mark AI as done speaking and process any queued audio
            source.onended = () => {
              console.log("Audio playback ended, checking for queued audio");
              isAISpeakingRef.current = false;
              waitingForUserInputRef.current = true;

              // Process any queued audio first
              const audioProcessed = processQueuedAudio();

              // If no audio was processed, start listening for new input
              if (!audioProcessed) {
                console.log(
                  "No queued audio found, starting to listen for new input"
                );

                // Start listening after a very short delay to avoid picking up any residual sounds
                // Reduced delay for better responsiveness
                setTimeout(() => {
                  startListening();
                  console.log("Started listening for user response");
                }, 500);
              }
            };
          },
          (error) => {
            console.error("Error decoding audio data:", error);
            // Mark AI as done speaking even if there was an error
            isAISpeakingRef.current = false;
            waitingForUserInputRef.current = true;

            // Process any queued audio first
            const audioProcessed = processQueuedAudio();

            // If no audio was processed, start listening for new input
            if (!audioProcessed) {
              console.log(
                "No queued audio found, starting to listen for new input"
              );

              // Start listening after a short delay
              setTimeout(() => {
                startListening();
                console.log("Started listening for user response after error");
              }, 500);
            }
          }
        );
      } catch (error) {
        console.error("Error processing audio response:", error);
        // Mark AI as done speaking even if there was an error
        isAISpeakingRef.current = false;
        waitingForUserInputRef.current = true;

        // Process any queued audio first
        const audioProcessed = processQueuedAudio();

        // If no audio was processed, start listening for new input
        if (!audioProcessed) {
          console.log(
            "No queued audio found, starting to listen for new input"
          );

          // Start listening after a short delay
          setTimeout(() => {
            startListening();
            console.log("Started listening for user response after error");
          }, 500);
        }
      }
    } else if (!data.audio) {
      console.log(
        "No audio data received from server, using browser speech synthesis"
      );

      // Use browser's speech synthesis as fallback if no audio data
      if (!isVolumeMuted && "speechSynthesis" in window) {
        try {
          // Make sure any previous speech is canceled
          window.speechSynthesis.cancel();

          // Small delay to ensure previous speech is fully canceled
          setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(data.text);

            // Set speech properties for a more natural sound
            utterance.rate = 1.0; // Normal speed
            utterance.pitch = 1.1; // Slightly higher pitch for female voice
            utterance.volume = 1.0; // Full volume

            // Try to use a female voice if available
            const femaleVoice = voices.find(
              (voice) =>
                voice.name.toLowerCase().includes("female") ||
                voice.name.includes("nova") ||
                voice.name.includes("samantha") ||
                voice.name.includes("lisa") ||
                voice.name.includes("victoria") ||
                voice.name.includes("karen") ||
                voice.name.includes("moira") ||
                voice.name.includes("tessa")
            );

            if (femaleVoice) {
              console.log("Using female voice:", femaleVoice.name);
              utterance.voice = femaleVoice;
            } else if (voices.length > 0) {
              // If no female voice found, use the first available voice
              console.log("No female voice found, using:", voices[0].name);
              utterance.voice = voices[0];
            }

            // Add event listeners for speech events
            utterance.onstart = () => {
              console.log("Speech started");
              isAISpeakingRef.current = true;
            };

            utterance.onend = () => {
              console.log("Speech ended, checking for queued audio");
              isAISpeakingRef.current = false;
              waitingForUserInputRef.current = true;

              // Process any queued audio first
              const audioProcessed = processQueuedAudio();

              // If no audio was processed, start listening for new input
              if (!audioProcessed) {
                console.log(
                  "No queued audio found, starting to listen for new input"
                );

                // Start listening after a short delay
                setTimeout(() => {
                  startListening();
                  console.log("Started listening for user response");
                }, 500);
              }
            };

            utterance.onerror = (e) => {
              console.error("Speech error:", e);
              // Mark AI as done speaking even if there was an error
              isAISpeakingRef.current = false;
              waitingForUserInputRef.current = true;

              // If speech is interrupted, try again with a simpler approach
              if (e.error === "interrupted") {
                console.log(
                  "Speech was interrupted, trying again with default settings"
                );
                const simpleUtterance = new SpeechSynthesisUtterance(data.text);
                simpleUtterance.onend = () => {
                  setTimeout(() => {
                    startListening();
                    console.log("Started listening after simple utterance");
                  }, 500);
                };
                window.speechSynthesis.speak(simpleUtterance);
              } else {
                // Start listening after a short delay
                setTimeout(() => {
                  startListening();
                  console.log("Started listening after speech error");
                }, 500);
              }
            };

            window.speechSynthesis.speak(utterance);
          }, 100); // Small delay to ensure previous speech is fully canceled
        } catch (error) {
          console.error("Error using speech synthesis:", error);
          // Mark AI as done speaking even if there was an error
          isAISpeakingRef.current = false;
          waitingForUserInputRef.current = true;

          // Start listening after a short delay
          setTimeout(() => {
            startListening();
            console.log("Started listening after speech synthesis error");
          }, 500);
        }
      } else {
        // If speech synthesis is not available or volume is muted
        console.log("Speech synthesis not available or volume muted");
        isAISpeakingRef.current = false;
        waitingForUserInputRef.current = true;

        // Process any queued audio first
        const audioProcessed = processQueuedAudio();

        // If no audio was processed, start listening for new input
        if (!audioProcessed) {
          console.log(
            "No queued audio found, starting to listen for new input"
          );

          // Start listening after a short delay
          setTimeout(() => {
            startListening();
            console.log("Started listening (no speech synthesis)");
          }, 500);
        }
      }
    }
  };

  // Handle socket error
  const handleSocketError = (error) => {
    console.error("Socket error:", error);
    setStatusMessage(`Error: ${error.message}`);
    setCallStatus(CallStatus.ERROR);

    // Display error message in the transcript area
    setAiResponse(
      `Sorry, there was an error: ${error.message}. Please try again.`
    );

    // Use speech synthesis to announce the error
    if ("speechSynthesis" in window && !isVolumeMuted) {
      try {
        // Make sure any previous speech is canceled
        window.speechSynthesis.cancel();

        // Small delay to ensure previous speech is fully canceled
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(
            `Sorry, there was an error. Please try again.`
          );

          // Use simpler settings for error messages
          utterance.rate = 0.9; // Slightly slower for clarity
          utterance.volume = 1.0; // Full volume

          window.speechSynthesis.speak(utterance);
        }, 100);
      } catch (e) {
        console.error("Error using speech synthesis for error:", e);
      }
    }
  };

  // Handle socket disconnection
  const handleSocketDisconnect = () => {
    console.log("Socket disconnected");
    setStatusMessage("Connection lost. Attempting to reconnect...");

    // Only set call as ended if we manually ended the call
    // Otherwise, try to reconnect
    if (callStatus === CallStatus.ENDED) {
      setStatusMessage("Call ended");
    } else {
      setCallStatus(CallStatus.CONNECTING);
      setStatusMessage("Connection lost. Attempting to reconnect...");

      // Try to reconnect if socket exists
      if (socketRef.current) {
        try {
          socketRef.current.connect();
        } catch (error) {
          console.error("Error reconnecting socket:", error);
        }
      }
    }
  };

  // Handle connection error
  const handleConnectionError = (error) => {
    console.error("Connection error:", error);
    setCallStatus(CallStatus.CONNECTING);
    setStatusMessage("Connection error. Attempting to reconnect...");
  };

  // Handle successful reconnection
  const handleReconnect = (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
    setCallStatus(CallStatus.CONNECTED);
    setStatusMessage("Reconnected");

    // Reset processing state to allow new audio to be processed
    processingAudioRef.current = false;
  };

  // Handle reconnection attempt
  const handleReconnectAttempt = (attemptNumber) => {
    console.log(`Reconnection attempt ${attemptNumber}`);
    setStatusMessage(`Reconnecting... (Attempt ${attemptNumber})`);
  };

  // Handle reconnection error
  const handleReconnectError = (error) => {
    console.error("Reconnection error:", error);
    setStatusMessage("Reconnection error. Trying again...");
  };

  // Handle reconnection failure
  const handleReconnectFailed = () => {
    console.error("Failed to reconnect");
    setCallStatus(CallStatus.ERROR);
    setStatusMessage("Failed to reconnect. Please try again later.");
  };

  // Handle heartbeat from server
  const handleHeartbeat = (data) => {
    console.log(
      `Heartbeat received: ${new Date(data.timestamp).toISOString()}`
    );
    // Reset processing flag if it's been stuck for too long
    const now = Date.now();
    const PROCESSING_TIMEOUT = 10000; // 10 seconds

    if (
      processingAudioRef.current &&
      now - lastAudioSendTimeRef.current > PROCESSING_TIMEOUT
    ) {
      console.log("Processing flag has been stuck for too long, resetting");
      processingAudioRef.current = false;
    }
  };

  // Handle call ended event from server
  const handleCallEnded = (data) => {
    console.log(`Call ended: ${data.message}`);
    setCallStatus(CallStatus.ENDED);
    setStatusMessage("Call ended");
    onEndCall();
  };

  // Handle audio data from MediaRecorder
  const handleDataAvailable = (event) => {
    if (event.data.size > 0 && socketRef.current && !isMuted) {
      console.log("Audio data available, size:", event.data.size);

      try {
        // Skip very small audio data (likely silence or background noise)
        // Increased minimum size to avoid processing tiny audio chunks
        if (event.data.size < 5000) {
          console.warn(
            "Audio data too small, likely silence or noise - skipping"
          );
          return;
        }

        // If AI is currently speaking, queue the audio instead of ignoring it
        if (isAISpeakingRef.current) {
          console.log("AI is currently speaking, queueing user audio");
          // We'll still add this audio to the buffer, but we won't send it yet
          // It will be processed when the AI stops speaking

          // Add the current audio chunk to the buffer
          audioBufferRef.current.push(event.data);

          // If we have too many chunks, remove the oldest one
          if (audioBufferRef.current.length > MAX_BUFFER_SIZE) {
            audioBufferRef.current.shift();
          }

          // Don't proceed with sending the audio now
          return;
        }

        // Check if we have a transcript from speech recognition
        // If we do, we're definitely processing user speech
        const currentTranscript = transcript.trim();
        if (currentTranscript) {
          console.log(`Current transcript: "${currentTranscript}"`);
        }

        // Set waiting for user input to false since we're now processing user input
        waitingForUserInputRef.current = false;

        // We're not using browser speech recognition anymore
        // The transcript will be set from the server response

        // Implement more aggressive debouncing to prevent sending audio too frequently
        const now = Date.now();
        if (
          now - lastAudioSendTimeRef.current < MIN_AUDIO_INTERVAL_MS ||
          processingAudioRef.current
        ) {
          console.log("Debouncing audio send or already processing, skipping");
          return;
        }

        // Clear any existing silence detection timeout
        if (silenceDetectionTimeoutRef.current) {
          clearTimeout(silenceDetectionTimeoutRef.current);
          silenceDetectionTimeoutRef.current = null;
        }

        // Clear any existing audio send timeout
        if (audioSendTimeoutRef.current) {
          clearTimeout(audioSendTimeoutRef.current);
          audioSendTimeoutRef.current = null;
        }

        // Set processing flag and update last send time
        processingAudioRef.current = true;
        lastAudioSendTimeRef.current = now;

        // Add the current audio chunk to the buffer
        audioBufferRef.current.push(event.data);

        // If we have too many chunks, remove the oldest one
        if (audioBufferRef.current.length > MAX_BUFFER_SIZE) {
          audioBufferRef.current.shift();
        }

        // Combine all audio chunks into a single blob
        const combinedBlob = new Blob(audioBufferRef.current, {
          type: event.data.type,
        });

        // Convert the combined blob to array buffer
        const reader = new FileReader();

        reader.onloadend = () => {
          if (socketRef.current) {
            try {
              // Get the result as ArrayBuffer
              const arrayBuffer = reader.result;

              if (!arrayBuffer) {
                console.error("Failed to read audio data");
                processingAudioRef.current = false;
                // Clear the audio buffer
                audioBufferRef.current = [];
                return;
              }

              // Convert ArrayBuffer to Base64 string for transmission
              let binary = "";
              const bytes = new Uint8Array(arrayBuffer);
              const len = bytes.byteLength;

              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
              }

              const base64Audio = btoa(binary);

              console.log(`Sending audio data (${base64Audio.length} bytes)`);

              // Check if socket is connected before sending
              if (socketRef.current.connected) {
                // Send the base64 encoded audio data to the server
                // Use the actual MIME type from the MediaRecorder for better format handling
                const audioFormat = mediaRecorderRef.current?.mimeType.includes(
                  "webm"
                )
                  ? "webm"
                  : mediaRecorderRef.current?.mimeType.includes("ogg")
                  ? "ogg"
                  : mediaRecorderRef.current?.mimeType.includes("mp3")
                  ? "mp3"
                  : "wav";

                console.log(
                  `Sending audio with format: ${audioFormat} based on MIME type: ${mediaRecorderRef.current?.mimeType}`
                );

                socketRef.current.emit("voice-data", {
                  audio: base64Audio,
                  audio_format: audioFormat,
                  companion_name: name,
                  personality: personality,
                });

                // Clear the audio buffer after sending
                audioBufferRef.current = [];

                // Set a timeout to reset the processing flag
                // This gives the server time to process and prevents sending too frequently
                // Reduced timeout to improve responsiveness
                audioSendTimeoutRef.current = setTimeout(() => {
                  console.log("Resetting processing flag after timeout");
                  processingAudioRef.current = false;

                  // Also clear the audio buffer again just to be safe
                  audioBufferRef.current = [];
                }, 2000);
              } else {
                console.warn("Socket not connected, cannot send audio data");
                setStatusMessage("Connection lost. Reconnecting...");
                setCallStatus(CallStatus.CONNECTING);

                // Reset processing flag immediately since we didn't send anything
                processingAudioRef.current = false;

                // Clear the audio buffer
                audioBufferRef.current = [];

                // Try to reconnect if socket exists
                if (socketRef.current) {
                  try {
                    socketRef.current.connect();
                  } catch (error) {
                    console.error("Error reconnecting socket:", error);
                  }
                }
              }
            } catch (error) {
              console.error("Error processing audio data:", error);
              processingAudioRef.current = false;
              audioBufferRef.current = [];
            }
          } else {
            processingAudioRef.current = false;
            audioBufferRef.current = [];
          }
        };

        reader.onerror = () => {
          console.error("Error reading audio data");
          processingAudioRef.current = false;
          audioBufferRef.current = [];
        };

        // Read the combined blob instead of just the current event data
        reader.readAsArrayBuffer(combinedBlob);
      } catch (error) {
        console.error("Error handling audio data:", error);
        processingAudioRef.current = false;
        audioBufferRef.current = [];

        // Clear any existing audio send timeout
        if (audioSendTimeoutRef.current) {
          clearTimeout(audioSendTimeoutRef.current);
          audioSendTimeoutRef.current = null;
        }
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState; // When muted is true, tracks should be disabled
      });
    }
  };

  // Toggle volume
  const toggleVolume = () => {
    setIsVolumeMuted(!isVolumeMuted);
  };

  // End call
  const endCall = () => {
    if (socketRef.current) {
      socketRef.current.emit("end-call");
    }
    cleanupCall();
    setCallStatus(CallStatus.ENDED);
    setStatusMessage("Call ended");
    onEndCall();
  };

  // Clean up resources
  const cleanupCall = () => {
    // Stop MediaRecorder
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        // Remove all event listeners first
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
        } catch (e) {
          console.error("Error removing recognition event listeners:", e);
        }

        // Then stop recognition
        recognitionRef.current.stop();
        console.log("Stopped speech recognition during cleanup");
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }

      // Clear the reference
      recognitionRef.current = null;
    }

    // Stop audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (error) {
        console.error("Error closing audio context:", error);
      }
    }

    // Clear any timeouts
    if (silenceDetectionTimeoutRef.current) {
      clearTimeout(silenceDetectionTimeoutRef.current);
      silenceDetectionTimeoutRef.current = null;
    }

    if (audioSendTimeoutRef.current) {
      clearTimeout(audioSendTimeoutRef.current);
      audioSendTimeoutRef.current = null;
    }

    // Clear audio buffer
    audioBufferRef.current = [];

    // Reset processing flags
    processingAudioRef.current = false;

    // Cancel any ongoing speech synthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Call status */}
      <div className="w-full text-center mb-4">
        <p
          className={`text-lg font-medium ${
            callStatus === CallStatus.CONNECTED
              ? "text-green-500"
              : callStatus === CallStatus.CONNECTING
              ? "text-yellow-500"
              : callStatus === CallStatus.ERROR
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {statusMessage}
        </p>
      </div>

      {/* Profile image */}
      <div className="relative w-48 h-48 rounded-full overflow-hidden mb-6">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div
          className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${
            callStatus === CallStatus.CONNECTED
              ? "bg-green-500"
              : callStatus === CallStatus.CONNECTING
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        ></div>
      </div>

      {/* Name and personality */}
      <h2 className="text-2xl font-bold text-white mb-1">{name}</h2>
      <p className="text-gray-400 mb-8">{personality}</p>

      {/* Listening indicator */}
      <div
        className={`w-full text-center mb-2 ${
          isListening ? "visible" : "invisible"
        }`}
      >
        <div className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-full">
          <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
          Listening...
        </div>
      </div>

      {/* Transcript and AI response */}
      <div className="w-full bg-gray-800 rounded-lg p-4 mb-8 max-h-32 overflow-y-auto">
        {transcript && (
          <p className="text-white mb-2">
            <span className="font-bold">You:</span> {transcript}
          </p>
        )}
        {aiResponse && (
          <p className="text-pink-300">
            <span className="font-bold">{name}:</span> {aiResponse}
          </p>
        )}
      </div>

      {/* Call controls */}
      <div className="flex justify-center items-center space-x-8 mb-4">
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full ${
            isMuted ? "bg-red-500" : "bg-gray-700"
          }`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* End call button */}
        <button onClick={endCall} className="p-4 bg-red-600 rounded-full">
          <PhoneOff size={28} />
        </button>

        {/* Volume button */}
        <button
          onClick={toggleVolume}
          className={`p-4 rounded-full ${
            isVolumeMuted ? "bg-red-500" : "bg-gray-700"
          }`}
        >
          {isVolumeMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>
    </div>
  );
};

export default VoiceCall;
