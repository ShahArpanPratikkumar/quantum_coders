import { AIService } from "../services/ai.service";
import { CleanedContent } from "./content.feature";

export type SummaryFormat = "bullets" | "tldr" | "comprehensive" | "actionable";

/**
 * Feature: Summary Generator
 * Controls summarization logic, formats, and structural layouts.
 */
export class SummaryFeature {
  /**
   * Generates a structural summary of active page/document content.
   */
  public async generate(
    content: CleanedContent,
    format: SummaryFormat = "bullets"
  ): Promise<string> {
    if (!content || !content.sanitized) {
      throw new Error("No readable page context has been extracted yet.");
    }

    const provider = AIService.getInstance().getProvider();
    
    // Choose specific prompts based on format
    let directive = "";
    switch (format) {
      case "tldr":
        directive = "Provide an extremely concise, single-paragraph TL;DR summarizing the core point.";
        break;
      case "comprehensive":
        directive = "Generate a comprehensive, structural breakdown with headings and clear narratives.";
        break;
      case "actionable":
        directive = "Extract any actionable tasks, lists of steps, and practical guides mentioned.";
        break;
      case "bullets":
      default:
        directive = "Extract 5 to 7 highly scannable, key executive bullet points capturing the essential facts.";
        break;
    }

    const systemInstruction = 
      "You are a specialized reading and research companion. " +
      "Summarize the provided content. Do not extrapolate, hallucinate, or add external facts. " +
      "Use clean markdown formatting, elegant structures, and highly professional, objective wording.";

    const prompt = 
      `PAGE METADATA:\n` +
      `- Snippet: ${content.snippet}\n` +
      `- Length: ${content.charCount} characters / ${content.wordCount} words\n\n` +
      `CORE TASK DIRECTIVE:\n` +
      `${directive}\n\n` +
      `PAGE SOURCE TO SUMMARIZE:\n` +
      `"""\n${content.sanitized}\n"""`;

    return provider.generateText(prompt, systemInstruction, 0.2);
  }
}
