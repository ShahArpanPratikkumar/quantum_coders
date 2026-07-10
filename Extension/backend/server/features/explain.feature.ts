import { AIService } from "../services/ai.service";
import { CleanedContent } from "./content.feature";

export type ExplanationLevel = "beginner" | "intermediate" | "expert" | "analogy";

/**
 * Feature: Explainer Module
 * Deciphers jargon, clarifies complex concepts, or generates analogies.
 */
export class ExplainFeature {
  /**
   * Explains a term or block of text with tailored sophistication levels.
   */
  public async explain(
    term: string,
    level: ExplanationLevel = "beginner",
    content: CleanedContent | null = null
  ): Promise<string> {
    if (!term || !term.trim()) {
      throw new Error("Term or context to explain cannot be empty.");
    }

    const provider = AIService.getInstance().getProvider();

    let targetAudience = "";
    switch (level) {
      case "beginner":
        targetAudience = "Explain this like I am a beginner (ELI5). Use extremely simple words, short sentences, and zero jargon.";
        break;
      case "analogy":
        targetAudience = "Explain this using a creative, highly relatable analogy from everyday life (e.g. baking, driving, sports) to build a clear mental model.";
        break;
      case "expert":
        targetAudience = "Provide a deep-dive technical explanation. Include mechanisms, architecture, mathematical or logical foundations, and edge cases.";
        break;
      case "intermediate":
      default:
        targetAudience = "Provide a balanced educational explanation suitable for a college student or professional from another field.";
        break;
    }

    const systemInstruction = 
      "You are a master educator and communicator. " +
      "Explain terms or ideas clearly and thoroughly, aligning with the specified audience instructions. " +
      "Maintain absolute accuracy while being highly engaging. Use elegant markdown to format your output.";

    const documentContext = content && content.sanitized
      ? `THE TERM WAS SELECTED FROM THIS ORIGINAL DOCUMENT CONTEXT:\n` +
        `"""\n... ${content.snippet} ...\n"""\n\n`
      : "";

    const prompt = 
      `${documentContext}` +
      `TARGET EXPLANATION LEVEL:\n` +
      `${targetAudience}\n\n` +
      `TERM / CONCEPT TO EXPLAIN:\n` +
      `"${term}"\n\n` +
      `EXPLANATION:`;

    return provider.generateText(prompt, systemInstruction, 0.4);
  }
}
