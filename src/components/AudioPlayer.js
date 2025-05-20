"use client";

import React, { useRef, useEffect, useState } from "react";

/**
 * AudioPlayer component for playing audio from ArrayBuffer or Blob
 * @param {Object} props - Component props
 * @param {ArrayBuffer|Blob} props.audioData - Audio data to play
 * @param {boolean} props.autoPlay - Whether to automatically play the audio
 * @param {Function} props.onPlaybackComplete - Callback when playback completes
 */
const AudioPlayer = ({ audioData, autoPlay = false, onPlaybackComplete = () => {} }) => {
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Create audio URL when audio data changes
  useEffect(() => {
    if (!audioData) return;

    // Create a blob URL from the audio data
    const blob = audioData instanceof Blob 
      ? audioData 
      : new Blob([audioData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);

    // Clean up the URL when component unmounts or audio data changes
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [audioData]);

  // Auto-play when audio URL is set
  useEffect(() => {
    if (audioUrl && autoPlay && audioRef.current) {
      audioRef.current.play()
        .catch(err => console.error("Error auto-playing audio:", err));
    }
  }, [audioUrl, autoPlay]);

  // Handle play/pause events
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => {
    setIsPlaying(false);
    onPlaybackComplete();
  };

  return (
    <div className="audio-player">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          controls={false}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
        />
      )}
    </div>
  );
};

export default AudioPlayer;
