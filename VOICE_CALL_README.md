# Voice Calling Feature Implementation

This document provides an overview of the voice calling feature implementation in the Pink Honey AI Companion app.

## Overview

The voice calling feature allows users to have a voice conversation with an AI companion. The implementation uses:

- **Socket.IO** for real-time communication
- **Web Speech API** for speech recognition (with OpenAI Whisper API as a fallback)
- **OpenAI GPT-4** for generating AI responses
- **OpenAI TTS API** for converting text to speech with a female voice

## Features

- Real-time voice conversation with AI companions
- Call status indicators (connecting, connected, ended)
- Mute/unmute functionality
- Volume control
- Transcript display
- WhatsApp-like call interface

## Implementation Details

### Backend

1. **Socket.IO Server**: Handles real-time communication between the client and server
2. **Voice Routes**: API endpoints for initiating and ending voice calls
3. **Speech Service**: Handles speech-to-text and text-to-speech conversion
4. **AI Integration**: Uses the existing AI service to generate responses

### Frontend

1. **VoiceCall Component**: Main component for the voice call interface
2. **Call Page**: Page that hosts the VoiceCall component
3. **TTS API Route**: Next.js API route for text-to-speech conversion
4. **Voice API Route**: Next.js API route for voice call initialization

## How to Use

1. **Start a Call**:
   - Click the phone icon in the chat header
   - On the call page, click "Start Voice Call"

2. **During a Call**:
   - Speak naturally to the AI companion
   - Your speech will be transcribed and sent to the AI
   - The AI's response will be converted to speech and played back

3. **Call Controls**:
   - **Mute/Unmute**: Toggle your microphone
   - **End Call**: End the current call
   - **Volume**: Toggle the AI's voice output

## Technical Flow

1. User initiates a call
2. Socket.IO connection is established
3. User's speech is captured using the Web Speech API or MediaRecorder
4. Speech is transcribed to text (locally or using OpenAI Whisper API)
5. Text is sent to the server via Socket.IO
6. Server processes the text using OpenAI GPT-4
7. AI response is converted to speech using OpenAI TTS API
8. Audio is streamed back to the client and played

## Requirements

- Modern browser with Web Speech API support (Chrome recommended)
- Microphone access
- OpenAI API key with access to GPT-4, Whisper, and TTS models

## Troubleshooting

- **Microphone Access**: Ensure your browser has permission to access your microphone
- **Speech Recognition**: If speech recognition is not working, check browser compatibility
- **Audio Playback**: If you can't hear the AI, check your volume settings and ensure audio is not muted

## Future Improvements

- Add background noise cancellation
- Implement voice activity detection for more natural conversation flow
- Add call recording functionality
- Support for multiple voice options
- Implement fallback mechanisms for browsers without Web Speech API support
