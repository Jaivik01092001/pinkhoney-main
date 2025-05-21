/**
 * Speech service for handling speech-to-text and text-to-speech
 */
const { OpenAI } = require("openai");
const config = require("../config/config");
const fs = require('fs');
const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Convert speech to text using OpenAI Whisper API
 * @param {any} audioData - Audio data from client
 * @param {string} audioFormat - Format of the audio data (optional)
 * @returns {Promise<string>} Transcribed text
 */
const speechToText = async (audioData, audioFormat = 'wav') => {
  let tempFilePath = null;
  let inputFilePath = null;
  let outputFilePath = null;

  try {
    // Check if we have valid audio data
    if (!audioData) {
      return "No audio data received. Please try again.";
    }

    // Create a temporary file to store the audio data
    const tempDir = os.tmpdir();

    // Create temporary files with generic extensions to avoid format assumptions
    const timestamp = Date.now();
    const rawInputFileName = `raw_input_${timestamp}.bin`; // Use .bin for raw binary data
    const outputFileName = `output_${timestamp}.mp3`;
    const rawInputFilePath = path.join(tempDir, rawInputFileName);
    outputFilePath = path.join(tempDir, outputFileName);

    // We'll create multiple input files with different extensions to try different approaches
    const wavInputFilePath = path.join(tempDir, `input_${timestamp}.wav`);
    const mp3InputFilePath = path.join(tempDir, `input_${timestamp}.mp3`);
    const pcmInputFilePath = path.join(tempDir, `input_${timestamp}.pcm`);

    console.log(`Processing audio data (reported format: ${audioFormat})`);

    // First save the raw binary data without assuming any format
    inputFilePath = rawInputFilePath;

    // Check if the audio data is a base64 string
    let audioBuffer;
    if (typeof audioData === 'string') {
      // If it's a base64 string, decode it to a buffer
      try {
        audioBuffer = Buffer.from(audioData, 'base64');
        console.log("Successfully decoded base64 audio data, size:", audioBuffer.length);
      } catch (error) {
        console.error("Error decoding base64 audio data:", error);
        return "Error processing audio. Please try again.";
      }
    } else if (Buffer.isBuffer(audioData)) {
      // If it's already a buffer, use it directly
      audioBuffer = audioData;
    } else {
      // Otherwise, try to convert it to a buffer
      try {
        audioBuffer = Buffer.from(audioData);
      } catch (error) {
        console.error("Error converting audio data to buffer:", error);
        return "Error processing audio. Please try again.";
      }
    }

    // Write the raw buffer to a temporary file without assuming format
    fs.writeFileSync(rawInputFilePath, audioBuffer);

    // Verify the raw input file exists and has content
    if (!fs.existsSync(rawInputFilePath)) {
      console.error("Raw input file does not exist");
      return "Error processing audio. Please try again.";
    }

    const inputFileStats = fs.statSync(rawInputFilePath);
    if (inputFileStats.size === 0) {
      console.error("Raw input file is empty");
      return "Error processing audio. Please try again.";
    }

    console.log(`Raw input file created: ${inputFileStats.size} bytes`);

    // Try different conversion approaches
    let conversionSuccessful = false;

    // Approach 1: Try to convert directly to MP3 using ffmpeg's format auto-detection
    try {
      console.log("Approach 1: Direct conversion to MP3...");

      await new Promise((resolve, reject) => {
        ffmpeg(rawInputFilePath)
          .output(outputFilePath)
          .outputOptions([
            '-acodec', 'libmp3lame',
            '-ac', '1',              // Mono audio
            '-ar', '16000',          // 16kHz sample rate
            '-b:a', '64k'            // 64k bitrate
          ])
          .on('end', () => {
            console.log('Approach 1 succeeded');
            resolve();
          })
          .on('error', (err) => {
            console.error('Approach 1 failed:', err.message);
            reject(err);
          })
          .run();
      });

      // Set the tempFilePath to the converted file
      tempFilePath = outputFilePath;
      conversionSuccessful = true;
    } catch (error) {
      console.log('Approach 1 failed, trying next approach');
    }

    // Approach 2: Try to create a WAV file first, then convert to MP3
    if (!conversionSuccessful) {
      try {
        console.log("Approach 2: Creating WAV file first...");

        // Create a WAV file from the raw data
        const wavFilePath = path.join(tempDir, `wav_${timestamp}.wav`);

        // Copy the raw data to a WAV file
        fs.copyFileSync(rawInputFilePath, wavFilePath);

        // Now try to convert the WAV to MP3
        await new Promise((resolve, reject) => {
          ffmpeg(wavFilePath)
            .inputOptions(['-f', 'wav']) // Force input format as WAV
            .output(outputFilePath)
            .outputOptions([
              '-acodec', 'libmp3lame',
              '-ac', '1',
              '-ar', '16000',
              '-b:a', '64k'
            ])
            .on('end', () => {
              console.log('Approach 2 succeeded');
              resolve();
            })
            .on('error', (err) => {
              console.error('Approach 2 failed:', err.message);
              reject(err);
            })
            .run();
        });

        // Clean up the temporary WAV file
        if (fs.existsSync(wavFilePath)) {
          fs.unlinkSync(wavFilePath);
        }

        // Set the tempFilePath to the converted file
        tempFilePath = outputFilePath;
        conversionSuccessful = true;
      } catch (error) {
        console.log('Approach 2 failed, trying next approach');
      }
    }

    // Approach 3: Try to treat the data as raw PCM audio
    if (!conversionSuccessful) {
      try {
        console.log("Approach 3: Treating as raw PCM audio...");

        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(rawInputFilePath)
            .inputOptions([
              '-f', 's16le',  // Treat as raw PCM
              '-ar', '16000', // Sample rate
              '-ac', '1'      // Mono
            ])
            .output(outputFilePath)
            .outputOptions([
              '-acodec', 'libmp3lame',
              '-f', 'mp3'
            ])
            .on('end', () => {
              console.log('Approach 3 succeeded');
              resolve();
            })
            .on('error', (err) => {
              console.error('Approach 3 failed:', err.message);
              reject(err);
            })
            .run();
        });

        // Set the tempFilePath to the converted file
        tempFilePath = outputFilePath;
        conversionSuccessful = true;
      } catch (error) {
        console.log('Approach 3 failed, trying next approach');
      }
    }

    // Approach 4: Try to use ffmpeg's alaw codec which is very robust
    if (!conversionSuccessful) {
      try {
        console.log("Approach 4: Using alaw codec...");

        // Create a new output file
        const alawOutputPath = path.join(tempDir, `alaw_${timestamp}.mp3`);

        await new Promise((resolve, reject) => {
          ffmpeg(rawInputFilePath)
            .inputOptions(['-f', 'alaw', '-ar', '8000', '-ac', '1']) // Try alaw format
            .output(alawOutputPath)
            .outputOptions([
              '-acodec', 'libmp3lame',
              '-ac', '1',
              '-ar', '16000',
              '-b:a', '64k'
            ])
            .on('end', () => {
              console.log('Approach 4 succeeded');
              resolve();
            })
            .on('error', (err) => {
              console.error('Approach 4 failed:', err.message);
              reject(err);
            })
            .run();
        });

        // Set the tempFilePath to the converted file
        tempFilePath = alawOutputPath;
        conversionSuccessful = true;
      } catch (error) {
        console.log('Approach 4 failed, trying fallback approach');
      }
    }

    // Fallback: Create a simple MP3 file with silence if all else fails
    if (!conversionSuccessful) {
      try {
        console.log('Creating a silent MP3 file as fallback...');

        // Create a new output file with mp3 extension
        const silentMp3Path = path.join(tempDir, `silent_${timestamp}.mp3`);

        await new Promise((resolve, reject) => {
          ffmpeg()
            .input('anullsrc')
            .inputOptions(['-f', 'lavfi'])
            .output(silentMp3Path)
            .outputOptions([
              '-t', '1',  // 1 second duration
              '-acodec', 'libmp3lame',
              '-f', 'mp3'
            ])
            .on('end', () => {
              resolve();
            })
            .on('error', (err) => {
              console.error('Error creating silent MP3:', err);
              reject(err);
            })
            .run();
        });

        // Set the tempFilePath to the silent MP3 file
        tempFilePath = silentMp3Path;
        conversionSuccessful = true;

        // Since we're using a silent MP3, we should return a message indicating we couldn't process the audio
        return "I couldn't understand what you said. Could you please try speaking again?";
      } catch (error) {
        // All approaches failed
        console.error('All audio conversion approaches failed');

        // Clean up files
        cleanupFiles(inputFilePath, outputFilePath);

        return "Error processing audio. Could not convert audio format.";
      }
    }

    // Clean up the raw input file as we no longer need it
    if (fs.existsSync(rawInputFilePath)) {
      fs.unlinkSync(rawInputFilePath);
      console.log(`Deleted temporary raw input file`);
    }

    try {
      // Verify file exists and has content
      if (!fs.existsSync(tempFilePath) || fs.statSync(tempFilePath).size === 0) {
        console.error("Error: Output file is empty or doesn't exist");
        cleanupFiles(null, tempFilePath);
        return "Error processing audio. Please try again.";
      }

      console.log(`Sending audio file to OpenAI (${fs.statSync(tempFilePath).size} bytes)`);

      // Send the file to OpenAI
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: "en",
        response_format: "json"
      });

      // Clean up the temporary files
      cleanupFiles(null, tempFilePath);

      return response.text || "I couldn't understand what you said.";
    } catch (error) {
      console.error("Error in OpenAI API call:", error.message || error);

      // Clean up the temporary files
      cleanupFiles(null, tempFilePath);

      return "I couldn't understand what you said. Could you please try again?";
    }
  } catch (error) {
    console.error("Error in speechToText:", error.message || error);

    // Clean up the temporary files
    cleanupFiles(inputFilePath, tempFilePath);

    return "I couldn't understand what you said. Could you please try again?";
  }
};

/**
 * Helper function to clean up temporary files
 * @param {string} inputPath - Path to input file
 * @param {string} outputPath - Path to output file
 */
const cleanupFiles = (inputPath, outputPath) => {
  // Clean up the input file if it exists
  if (inputPath && fs.existsSync(inputPath)) {
    try {
      fs.unlinkSync(inputPath);
    } catch (error) {
      console.error("Error cleaning up file:", error.message || error);
    }
  }

  // Clean up the output file if it exists
  if (outputPath && fs.existsSync(outputPath)) {
    try {
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error("Error cleaning up file:", error.message || error);
    }
  }
};

/**
 * Convert text to speech using browser's SpeechSynthesis API
 * This is a fallback method that doesn't require OpenAI API access
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Buffer>} Audio buffer containing synthesized speech
 */
const textToSpeech = async (text) => {
  try {
    // Since we don't have access to the TTS-1 model, we'll return null
    // and let the frontend handle the speech synthesis
    console.log("Using fallback for text-to-speech. Text:", text);
    return null;
  } catch (error) {
    console.error("Error in textToSpeech:", error);
    return null;
  }
};

module.exports = {
  speechToText,
  textToSpeech,
};
