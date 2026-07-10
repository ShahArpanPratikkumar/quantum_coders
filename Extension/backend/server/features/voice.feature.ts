import { AIService } from "../services/ai.service";

export interface VoiceCommandResult {
  isCommand: boolean;
  action: "summarize" | "explain" | "ask" | "clear" | "none";
  argument?: string;
  feedbackText: string;
}

/**
 * Feature: Voice Assistant Module
 * Facilitates high-fidelity Text-To-Speech (TTS) synthesis and voice transcription command parsing.
 */
export class VoiceFeature {
  /**
   * Synthesizes audio speech from text using high-fidelity generative voice models.
   * Returns a base64 encoded audio string ready for audio playbacks.
   */
  public async synthesizeSpeech(text: string, voiceName = "Kore"): Promise<string> {
    if (!text || !text.trim()) {
      throw new Error("Cannot synthesize speech from empty text.");
    }

    // Clean up text for TTS (e.g., strip markdown symbols for a more natural reading voice)
    const cleanText = text
      .replace(/[*#`_\-~[\]()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const provider = AIService.getInstance().getProvider();
    return provider.generateTTS(cleanText, voiceName);
  }

  /**
   * Parses voice transcriptions into structured command actions.
   * Enables hands-free companion operations.
   */
  public parseVoiceCommand(transcript: string): VoiceCommandResult {
    if (!transcript || !transcript.trim()) {
      return { isCommand: false, action: "none", feedbackText: "No audio detected." };
    }

    const text = transcript.toLowerCase().trim();

    // 1. Summarize commands
    if (text === "summarize" || text === "summarize this page" || text === "summarize article" || text.includes("give me a summary")) {
      return {
        isCommand: true,
        action: "summarize",
        feedbackText: "Triggering webpage summary command from your voice.",
      };
    }

    // 2. Clear history commands
    if (text === "clear" || text === "clear chat" || text === "clear history" || text === "reset chat") {
      return {
        isCommand: true,
        action: "clear",
        feedbackText: "Clearing conversational history as verbally requested.",
      };
    }

    // 3. Explain commands
    const explainPrefixes = ["explain ", "explain like i'm five ", "what is ", "define "];
    for (const prefix of explainPrefixes) {
      if (text.startsWith(prefix)) {
        const arg = transcript.substring(prefix.length).trim();
        return {
          isCommand: true,
          action: "explain",
          argument: arg,
          feedbackText: `Initiating explanation for "${arg}".`,
        };
      }
    }

    // 4. Questions commands
    const questionPrefixes = ["ask ", "question ", "find "];
    for (const prefix of questionPrefixes) {
      if (text.startsWith(prefix)) {
        const arg = transcript.substring(prefix.length).trim();
        return {
          isCommand: true,
          action: "ask",
          argument: arg,
          feedbackText: `Searching page for: "${arg}".`,
        };
      }
    }

    // Default to general question ask
    return {
      isCommand: false,
      action: "none",
      feedbackText: "Processing voice message as a chat query.",
    };
  }
}
