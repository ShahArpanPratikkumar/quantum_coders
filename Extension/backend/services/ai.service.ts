import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Base AI Provider interface defining standard contracts for model interaction.
 * This acts as the key decoupling/swap-out interface requested by the user.
 */
export interface AIProvider {
  /**
   * Generates a text response for a given prompt and system instructions.
   */
  generateText(prompt: string, systemInstruction?: string, temperature?: number): Promise<string>;

  /**
   * Generates base64 encoded audio (TTS) for the given input text.
   */
  generateTTS(text: string, voiceName?: string): Promise<string>;

  /**
   * Streams a text response chunk by chunk.
   */
  generateStream(
    prompt: string,
    systemInstruction: string,
    onChunk: (chunk: string) => void,
    temperature?: number
  ): Promise<string>;
}

/**
 * Implementation of Google Gemini AI using the official modern @google/genai SDK.
 */
export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI | null = null;
  private modelName = "gemini-3.5-flash";
  private ttsModelName = "gemini-3.1-flash-tts-preview";

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[GeminiProvider] Warning: GEMINI_API_KEY is not defined. Calls will fail until configured.");
      return;
    }
    // Correctly instantiate standard GoogleGenAI with name parameters and User-Agent telemetry
    this.ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      // Re-attempt lazy initialization if key was configured after startup
      this.initializeClient();
    }
    if (!this.ai) {
      throw new Error("GEMINI_API_KEY environment variable is not configured on the server.");
    }
    return this.ai;
  }

  async generateText(prompt: string, systemInstruction?: string, temperature = 0.2): Promise<string> {
    const client = this.getClient();
    try {
      const response = await client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction,
          temperature,
        },
      });
      return response.text || "";
    } catch (error: any) {
      console.error("[GeminiProvider] Text Generation Failed:", error);
      throw new Error(`AI generation error: ${error.message || error}`);
    }
  }

  async generateTTS(text: string, voiceName = "Kore"): Promise<string> {
    const client = this.getClient();
    try {
      // As defined in the gemini-api guidelines for Single speaker TTS
      const response = await client.models.generateContent({
        model: this.ttsModelName,
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              // Prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio payload returned from Gemini TTS model");
      }
      return base64Audio;
    } catch (error: any) {
      console.error("[GeminiProvider] TTS Generation Failed:", error);
      throw new Error(`AI TTS generation error: ${error.message || error}`);
    }
  }

  async generateStream(
    prompt: string,
    systemInstruction: string,
    onChunk: (chunk: string) => void,
    temperature = 0.2
  ): Promise<string> {
    const client = this.getClient();
    try {
      const responseStream = await client.models.generateContentStream({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction,
          temperature,
        },
      });

      let fullText = "";
      for await (const chunk of responseStream) {
        const text = chunk.text || "";
        fullText += text;
        onChunk(text);
      }
      return fullText;
    } catch (error: any) {
      console.error("[GeminiProvider] Streaming Generation Failed:", error);
      throw new Error(`AI streaming error: ${error.message || error}`);
    }
  }
}

/**
 * Fallback/Mock provider for local offline sandbox testing, or swap-in development.
 */
export class MockAIProvider implements AIProvider {
  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    return `[MOCK AI RESPONSE] Derived from system context:\nInstruction: "${systemInstruction || "None"}"\nPrompt: "${prompt}"\nThis represents a local responsive fallback without active API keys.`;
  }

  async generateTTS(text: string): Promise<string> {
    // Return empty string or dummy base64 PCM/WAV for testing
    return "UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA";
  }

  async generateStream(
    prompt: string,
    systemInstruction: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const chunks = [
      "[MOCK STREAM START] ",
      "Evaluating context... ",
      `Evaluating instruction: "${systemInstruction.substring(0, 30)}..." `,
      "Formulating answer... ",
      "Complete! (Mock Provider Active)"
    ];
    let full = "";
    for (const chunk of chunks) {
      onChunk(chunk);
      full += chunk;
      await new Promise((r) => setTimeout(r, 100)); // Simulate chunk delay
    }
    return full;
  }
}

/**
 * Service Manager to switch between AI providers dynamically or based on config.
 */
export class AIService {
  private static instance: AIService;
  private currentProvider: AIProvider;

  private constructor() {
    // Choose Gemini by default, fallback to Mock if key is missing or manually changed
    if (process.env.GEMINI_API_KEY) {
      this.currentProvider = new GeminiProvider();
    } else {
      console.warn("[AIService] GEMINI_API_KEY is not defined. Initializing MockAIProvider.");
      this.currentProvider = new MockAIProvider();
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Sets the current AI provider. Allows instant runtime swapping/updating.
   */
  public setProvider(provider: AIProvider) {
    this.currentProvider = provider;
    console.log(`[AIService] Provider updated to: ${provider.constructor.name}`);
  }

  public getProvider(): AIProvider {
    return this.currentProvider;
  }
}
