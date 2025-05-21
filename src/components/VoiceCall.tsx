import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceCallProps {
  name: string;
  personality: string;
  image: string;
  userId?: string;
  onEndCall: () => void;
}

enum CallStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ENDED = 'ended',
  ERROR = 'error'
}

const VoiceCall: React.FC<VoiceCallProps> = ({ name, personality, image, userId, onEndCall }) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.CONNECTING);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVolumeMuted, setIsVolumeMuted] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Connecting...');
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Store available speech synthesis voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load speech synthesis voices when available
  useEffect(() => {
    if ('speechSynthesis' in window) {
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
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Initialize the call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Initialize Socket.IO connection
        socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080');

        // Set up socket event listeners
        socketRef.current.on('connect', handleSocketConnect);
        socketRef.current.on('ai-response', handleAIResponse);
        socketRef.current.on('error', handleSocketError);
        socketRef.current.on('disconnect', handleSocketDisconnect);

        // Initialize audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Initialize speech recognition if available
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';

          recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = Array.from(event.results)
              .map(result => result[0].transcript)
              .join('');
            setTranscript(transcript);
          };

          recognitionRef.current.start();
        }

        // Initialize MediaRecorder for sending audio to server with specific options
        // Prioritize formats that are definitely supported by OpenAI
        // Despite webm being listed as supported, it seems to have issues
        const mimeTypes = [
          'audio/mp3',
          'audio/mpeg',
          'audio/wav',
          'audio/ogg;codecs=opus',
          'audio/m4a',
          'audio/webm',
          'audio/webm;codecs=opus'
        ];

        // Find the first supported MIME type
        let selectedMimeType = '';
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            console.log(`Found supported audio format: ${mimeType}`);
            break;
          }
        }

        // Configure MediaRecorder options
        const options = selectedMimeType ?
          {
            mimeType: selectedMimeType,
            audioBitsPerSecond: 128000
          } :
          undefined;

        // Create MediaRecorder with the selected options or default
        let mediaRecorder: MediaRecorder;
        try {
          mediaRecorder = new MediaRecorder(stream, options);
          console.log("Using audio format:", mediaRecorder.mimeType);
        } catch (e) {
          console.warn("Error creating MediaRecorder with selected format, using default format");
          mediaRecorder = new MediaRecorder(stream);
          console.log("Using default audio format:", mediaRecorder.mimeType);
        }

        mediaRecorderRef.current = mediaRecorder;

        // Set up MediaRecorder event listeners
        mediaRecorder.ondataavailable = handleDataAvailable;

        // Start recording - collect data every 3 seconds for better chunks
        // Longer chunks provide better context for the speech recognition
        mediaRecorder.start(3000);

        // Update call status
        setCallStatus(CallStatus.CONNECTED);
        setStatusMessage('Connected');
      } catch (error) {
        console.error('Error initializing call:', error);
        setCallStatus(CallStatus.ERROR);
        setStatusMessage('Failed to initialize call. Please check your microphone permissions.');
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
    console.log('Socket connected');
    setCallStatus(CallStatus.CONNECTED);
    setStatusMessage('Connected');
  };

  // Handle AI response from server
  const handleAIResponse = (data: { text: string, audio: ArrayBuffer | null }) => {
    setAiResponse(data.text);

    // Play audio if volume is not muted and audio data is available
    if (!isVolumeMuted && audioContextRef.current && data.audio) {
      try {
        audioContextRef.current.decodeAudioData(data.audio, (buffer) => {
          const source = audioContextRef.current!.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current!.destination);
          source.start(0);
        }, (error) => {
          console.error("Error decoding audio data:", error);
        });
      } catch (error) {
        console.error("Error processing audio response:", error);
      }
    } else if (!data.audio) {
      console.log("No audio data received from server");

      // Use browser's speech synthesis as fallback if no audio data
      if (!isVolumeMuted && 'speechSynthesis' in window) {
        try {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(data.text);

          // Set speech properties for a more natural sound
          utterance.rate = 1.0;  // Normal speed
          utterance.pitch = 1.1; // Slightly higher pitch for female voice
          utterance.volume = 1.0; // Full volume

          // Try to use a female voice if available
          const femaleVoice = voices.find(voice =>
            voice.name.toLowerCase().includes('female') ||
            voice.name.includes('nova') ||
            voice.name.includes('samantha') ||
            voice.name.includes('lisa') ||
            voice.name.includes('victoria') ||
            voice.name.includes('karen') ||
            voice.name.includes('moira') ||
            voice.name.includes('tessa')
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
          utterance.onstart = () => console.log("Speech started");
          utterance.onend = () => console.log("Speech ended");
          utterance.onerror = (e) => console.error("Speech error:", e);

          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error("Error using speech synthesis:", error);
        }
      }
    }
  };

  // Handle socket error
  const handleSocketError = (error: { message: string }) => {
    console.error('Socket error:', error);
    setStatusMessage(`Error: ${error.message}`);
    setCallStatus(CallStatus.ERROR);

    // Display error message in the transcript area
    setAiResponse(`Sorry, there was an error: ${error.message}. Please try again.`);

    // Use speech synthesis to announce the error
    if ('speechSynthesis' in window && !isVolumeMuted) {
      try {
        const utterance = new SpeechSynthesisUtterance(`Sorry, there was an error. Please try again.`);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("Error using speech synthesis for error:", e);
      }
    }
  };

  // Handle socket disconnection
  const handleSocketDisconnect = () => {
    console.log('Socket disconnected');
    setCallStatus(CallStatus.ENDED);
    setStatusMessage('Call ended');
  };

  // Handle audio data from MediaRecorder
  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0 && socketRef.current && !isMuted) {
      console.log("Audio data available, size:", event.data.size, "type:", event.data.type);

      // Get the original MIME type from the recorder
      const originalType = mediaRecorderRef.current?.mimeType || 'audio/webm';
      console.log("Original audio MIME type:", originalType);

      // Extract the format from the MIME type (e.g., 'audio/webm' -> 'webm')
      let format = originalType.split('/')[1];
      if (format.includes(';')) {
        format = format.split(';')[0];
      }

      // Force mp3 format for better compatibility with OpenAI
      // Despite webm being listed as supported, it seems to have issues
      format = 'mp3';

      console.log(`Using audio format for transmission: ${format} (forced for compatibility)`);

      // Create a new blob with the original type
      const audioBlob = new Blob([event.data], { type: originalType });

      // Convert blob to array buffer
      const reader = new FileReader();
      reader.onloadend = () => {
        if (socketRef.current) {
          // Get the result as ArrayBuffer
          const arrayBuffer = reader.result as ArrayBuffer;

          // Convert ArrayBuffer to Base64 string for easier transmission
          // Use a safer approach to convert binary data to base64
          let binary = '';
          const bytes = new Uint8Array(arrayBuffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Audio = btoa(binary);

          console.log("Sending audio data to server, length:", base64Audio.length, "format:", format);

          // Send the base64 encoded audio data to the server
          socketRef.current.emit('voice-data', {
            audio: base64Audio,
            audio_format: format, // Send the actual format extracted from the MIME type
            companion_name: name,
            personality: personality
          });
        }
      };
      reader.readAsArrayBuffer(audioBlob);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);

    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // Toggle the current state
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
      socketRef.current.emit('end-call');
    }
    cleanupCall();
    setCallStatus(CallStatus.ENDED);
    setStatusMessage('Call ended');
    onEndCall();
  };

  // Clean up resources
  const cleanupCall = () => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Stop audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
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
        <p className={`text-lg font-medium ${
          callStatus === CallStatus.CONNECTED ? 'text-green-500' :
          callStatus === CallStatus.CONNECTING ? 'text-yellow-500' :
          callStatus === CallStatus.ERROR ? 'text-red-500' : 'text-gray-500'
        }`}>
          {statusMessage}
        </p>
      </div>

      {/* Profile image */}
      <div className="relative w-48 h-48 rounded-full overflow-hidden mb-6">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${
          callStatus === CallStatus.CONNECTED ? 'bg-green-500' :
          callStatus === CallStatus.CONNECTING ? 'bg-yellow-500' :
          'bg-red-500'
        }`}></div>
      </div>

      {/* Name and personality */}
      <h2 className="text-2xl font-bold text-white mb-1">{name}</h2>
      <p className="text-gray-400 mb-8">{personality}</p>

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
          className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'}`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* End call button */}
        <button
          onClick={endCall}
          className="p-4 bg-red-600 rounded-full"
        >
          <PhoneOff size={28} />
        </button>

        {/* Volume button */}
        <button
          onClick={toggleVolume}
          className={`p-4 rounded-full ${isVolumeMuted ? 'bg-red-500' : 'bg-gray-700'}`}
        >
          {isVolumeMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>
    </div>
  );
};

export default VoiceCall;
