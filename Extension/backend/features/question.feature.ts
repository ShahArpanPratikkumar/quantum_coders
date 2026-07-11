import { AIService } from "../services/ai.service";
import { CleanedContent } from "./content.feature";
import { ChatMessage } from "./session.feature";

/**
 * Feature: Question & Answer Handler
 * Executes precise contextual answering against injected documents.
 */
export class QuestionFeature {
  /**
   * Answers a specific question in reference to active content and dialogue history.
   */
  public async ask(
    question: string,
    content: CleanedContent | null,
    history: ChatMessage[] = []
  ): Promise<string> {
    if (!question || !question.trim()) {
      throw new Error("Question input cannot be empty.");
    }

    const provider = AIService.getInstance().getProvider();

    const systemInstruction = 
      "You are a specialized contextual search and Q&A expert. " +
      "Answer the user's question strictly utilizing the provided document content. " +
      "If the answer is not mentioned or cannot be inferred from the document, state: " +
      "'Based on the current document, I cannot find information regarding this question.' " +
      "Keep answers concise, direct, and factual. Always stay context-safe.";

    // Convert sliding history into a readable prompt context
    let historyContext = "";
    if (history.length > 0) {
      historyContext = "RECENT CONVERSATION HISTORY:\n" + 
        history
          .filter(msg => msg.sender !== "system")
          .map(msg => `- ${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
          .join("\n") + "\n\n";
    }

    const documentContext = content && content.sanitized 
      ? `CURRENT DOCUMENT SOURCE:\n"""\n${content.sanitized}\n"""\n\n`
      : `[No document context currently loaded. Answer using general, high-fidelity knowledge, mentioning you don't have document context active.]\n\n`;

    const prompt = 
      `${documentContext}` +
      `${historyContext}` +
      `USER QUESTION: "${question}"\n\n` +
      `CONCISE ANSWER:`;

    return provider.generateText(prompt, systemInstruction, 0.3);
  }
}
