/**
 * Speech service for handling speech-to-text and text-to-speech
 * Supports OpenAI Whisper for STT and OpenAI TTS for speech synthesis
 */
const { OpenAI } = require("openai");
const config = require("../config/config");
const fs = require("fs");
const path = require("path");
const os = require("os");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

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
const speechToText = async (audioData, audioFormat = "wav") => {
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

    // OpenAI Whisper API supports formats: m4a, mp3, webm, mp4, mpga, wav, mpeg

    console.log(`Processing audio data (reported format: ${audioFormat})`);

    // First save the raw binary data without assuming any format
    inputFilePath = rawInputFilePath;

    // Check if the audio data is a base64 string
    let audioBuffer;
    if (typeof audioData === "string") {
      // If it's a base64 string, decode it to a buffer
      try {
        audioBuffer = Buffer.from(audioData, "base64");
        console.log(
          "Successfully decoded base64 audio data, size:",
          audioBuffer.length
        );
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

    // Create a direct MP3 file for OpenAI Whisper API
    const directMp3Path = path.join(tempDir, `direct_${timestamp}.mp3`);

    // Approach 1: Try to convert directly to MP3 using ffmpeg's format auto-detection
    try {
      console.log("Approach 1: Direct conversion to MP3...");

      await new Promise((resolve, reject) => {
        ffmpeg(rawInputFilePath)
          .output(directMp3Path)
          .outputOptions([
            "-acodec",
            "libmp3lame",
            "-ac",
            "1", // Mono audio
            "-ar",
            "16000", // 16kHz sample rate
            "-b:a",
            "64k", // 64k bitrate
          ])
          .on("end", () => {
            console.log("Approach 1 succeeded");
            resolve();
          })
          .on("error", (err) => {
            console.error("Approach 1 failed:", err.message);
            reject(err);
          })
          .run();
      });

      // Set the tempFilePath to the converted file
      tempFilePath = directMp3Path;
      conversionSuccessful = true;
    } catch (error) {
      console.log("Approach 1 failed, trying next approach");
    }

    // Approach 2: Create a WAV file for OpenAI Whisper API
    if (!conversionSuccessful) {
      try {
        console.log("Approach 2: Creating WAV file...");

        // Create a WAV file directly
        const wavFilePath = path.join(tempDir, `direct_${timestamp}.wav`);

        // Try with different PCM settings for better compatibility
        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(rawInputFilePath)
            .inputOptions([
              "-f",
              "s16le", // Treat as raw PCM
              "-ar",
              "16000", // Sample rate
              "-ac",
              "1", // Mono
            ])
            .output(wavFilePath)
            .outputOptions([
              "-acodec",
              "pcm_s16le",
              "-ar",
              "16000", // Ensure 16kHz sample rate
              "-ac",
              "1", // Ensure mono audio
              "-f",
              "wav",
            ])
            .on("end", () => {
              console.log("Approach 2 succeeded");
              resolve();
            })
            .on("error", (err) => {
              console.error("Approach 2 failed:", err.message);
              reject(err);
            })
            .run();
        });

        // Verify the WAV file exists and has content
        if (fs.existsSync(wavFilePath) && fs.statSync(wavFilePath).size > 0) {
          console.log(
            `WAV file created successfully: ${
              fs.statSync(wavFilePath).size
            } bytes`
          );

          // Set the tempFilePath to the WAV file
          tempFilePath = wavFilePath;
          conversionSuccessful = true;
        } else {
          console.error("WAV file creation failed or file is empty");
          throw new Error("WAV file creation failed");
        }
      } catch (error) {
        console.log("Approach 2 failed, trying next approach");
      }
    }

    // Approach 3: Try to treat the data as raw PCM audio and convert to MP3
    if (!conversionSuccessful) {
      try {
        console.log("Approach 3: Treating as raw PCM audio...");

        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(rawInputFilePath)
            .inputOptions([
              "-f",
              "s16le", // Treat as raw PCM
              "-ar",
              "16000", // Sample rate
              "-ac",
              "1", // Mono
            ])
            .output(outputFilePath)
            .outputOptions(["-acodec", "libmp3lame", "-f", "mp3"])
            .on("end", () => {
              console.log("Approach 3 succeeded");
              resolve();
            })
            .on("error", (err) => {
              console.error("Approach 3 failed:", err.message);
              reject(err);
            })
            .run();
        });

        // Set the tempFilePath to the converted file
        tempFilePath = outputFilePath;
        conversionSuccessful = true;
      } catch (error) {
        console.log("Approach 3 failed, trying next approach");
      }
    }

    // Approach 4: Try to use ffmpeg's mulaw codec which is very robust
    if (!conversionSuccessful) {
      try {
        console.log("Approach 4: Using mulaw codec...");

        // Create a new output file
        const mulawOutputPath = path.join(tempDir, `mulaw_${timestamp}.mp3`);

        await new Promise((resolve, reject) => {
          ffmpeg(rawInputFilePath)
            .inputOptions(["-f", "mulaw", "-ar", "8000", "-ac", "1"]) // Try mulaw format
            .output(mulawOutputPath)
            .outputOptions([
              "-acodec",
              "libmp3lame",
              "-ac",
              "1",
              "-ar",
              "16000",
              "-b:a",
              "64k",
            ])
            .on("end", () => {
              console.log("Approach 4 succeeded");
              resolve();
            })
            .on("error", (err) => {
              console.error("Approach 4 failed:", err.message);
              reject(err);
            })
            .run();
        });

        // Set the tempFilePath to the converted file
        tempFilePath = mulawOutputPath;
        conversionSuccessful = true;
      } catch (error) {
        console.log("Approach 4 failed, trying fallback approach");
      }
    }

    // Fallback: Create a simple MP3 file with silence if all else fails
    if (!conversionSuccessful) {
      try {
        console.log("Creating a silent MP3 file as fallback...");

        // Create a new output file with mp3 extension
        const silentMp3Path = path.join(tempDir, `silent_${timestamp}.mp3`);

        await new Promise((resolve, reject) => {
          ffmpeg()
            .input("anullsrc")
            .inputOptions(["-f", "lavfi"])
            .output(silentMp3Path)
            .outputOptions([
              "-t",
              "1", // 1 second duration
              "-acodec",
              "libmp3lame",
              "-f",
              "mp3",
            ])
            .on("end", () => {
              resolve();
            })
            .on("error", (err) => {
              console.error("Error creating silent MP3:", err);
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
        console.error("All audio conversion approaches failed");

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
      if (
        !fs.existsSync(tempFilePath) ||
        fs.statSync(tempFilePath).size === 0
      ) {
        console.error("Error: Output file is empty or doesn't exist");
        cleanupFiles(null, tempFilePath);
        return "Error processing audio. Please try again.";
      }

      console.log(
        `Sending audio file to OpenAI (${fs.statSync(tempFilePath).size} bytes)`
      );

      // Verify the file format is supported by OpenAI
      const fileExtension = path
        .extname(tempFilePath)
        .toLowerCase()
        .substring(1);
      console.log(`File extension: ${fileExtension}`);

      // Send the file to OpenAI
      try {
        const response = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: "whisper-1",
          language: "en",
          response_format: "json",
        });

        // Clean up the temporary files
        cleanupFiles(null, tempFilePath);

        // Check if the response has text and validate it
        if (response.text && response.text.trim()) {
          // Clean the transcription text to remove emojis and special characters
          const cleanedText = cleanTranscriptionText(response.text);

          // If the cleaned text is too short or empty, return an error message
          if (!cleanedText || cleanedText.length < 2) {
            return "I couldn't understand what you said.";
          }

          return cleanedText;
        } else {
          return "I couldn't understand what you said.";
        }
      } catch (apiError) {
        console.error(
          "Error in OpenAI API call:",
          apiError.message || apiError
        );

        // If the error is related to file format, try to convert to a different format
        if (
          apiError.message &&
          apiError.message.includes("Invalid file format")
        ) {
          console.log("Invalid file format error, trying to convert to MP3...");

          try {
            // Convert to MP3 as a last resort
            const mp3FilePath = path.join(
              os.tmpdir(),
              `final_${Date.now()}.mp3`
            );

            await new Promise((resolve, reject) => {
              ffmpeg(tempFilePath)
                .output(mp3FilePath)
                .outputOptions([
                  "-acodec",
                  "libmp3lame",
                  "-ac",
                  "1",
                  "-ar",
                  "16000",
                  "-b:a",
                  "64k",
                ])
                .on("end", resolve)
                .on("error", reject)
                .run();
            });

            console.log(
              `Sending converted MP3 file to OpenAI (${
                fs.statSync(mp3FilePath).size
              } bytes)`
            );

            const retryResponse = await openai.audio.transcriptions.create({
              file: fs.createReadStream(mp3FilePath),
              model: "whisper-1",
              language: "en",
              response_format: "json",
            });

            // Clean up files
            cleanupFiles(null, tempFilePath);
            cleanupFiles(null, mp3FilePath);

            return retryResponse.text || "I couldn't understand what you said.";
          } catch (retryError) {
            console.error(
              "Error in retry attempt:",
              retryError.message || retryError
            );
            cleanupFiles(null, tempFilePath);
            return "I couldn't understand what you said. Could you please try again?";
          }
        }

        // Clean up the temporary files
        cleanupFiles(null, tempFilePath);
        return "I couldn't understand what you said. Could you please try again?";
      }
    } catch (error) {
      console.error("Error processing audio:", error.message || error);

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
 * Clean transcription text to remove emojis and unwanted characters
 * @param {string} text - The transcription text to clean
 * @returns {string} Cleaned text
 */
const cleanTranscriptionText = (text) => {
  if (!text) return "";

  // Log the original text for debugging
  console.log(`Original transcription: "${text}"`);

  // Remove emojis and special characters
  const cleanedText = text
    // Remove emoji characters
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ""
    )
    // Remove special characters that are unlikely to be in speech
    .replace(/[★☆♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼]/g, "")
    // Remove multiple spaces
    .replace(/\s+/g, " ")
    // Trim whitespace
    .trim();

  console.log(`Cleaned transcription: "${cleanedText}"`);

  return cleanedText;
};

/**
 * Convert text to speech using OpenAI TTS API
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Buffer>} Audio buffer containing synthesized speech
 */
const textToSpeech = async (text) => {
  try {
    console.log("Attempting to use OpenAI TTS API");

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // Female voice
      input: text,
    });

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    console.log(`OpenAI TTS successful, generated ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    console.error("OpenAI TTS failed:", error.message || error);

    // If TTS service fails, return null and let the frontend handle it with browser TTS
    console.log("TTS service failed, returning null for browser fallback");
    return null;
  }
};

module.exports = {
  speechToText,
  textToSpeech,
};
