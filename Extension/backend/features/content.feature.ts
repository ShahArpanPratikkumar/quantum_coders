/**
 * Feature: Content Handling
 * Processes, sanitizes, structures, and limits raw content text for the AI.
 */
export interface CleanedContent {
  raw: string;
  sanitized: string;
  charCount: number;
  wordCount: number;
  estimatedReadTimeMinutes: number;
  snippet: string;
}

export class ContentFeature {
  /**
   * Sanitizes, cleans up, and provides diagnostic stats for content to load into the AI.
   */
  public static process(content: string, maxChars = 20000): CleanedContent {
    if (!content) {
      return {
        raw: "",
        sanitized: "",
        charCount: 0,
        wordCount: 0,
        estimatedReadTimeMinutes: 0,
        snippet: "",
      };
    }

    // Basic cleaning: Strip standard HTML elements if present
    let cleaned = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ");

    // Normalize whitespaces
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // Enforce high-boundary soft truncation if text exceeds token context
    if (cleaned.length > maxChars) {
      cleaned = cleaned.substring(0, maxChars) + "... [truncated]";
    }

    const words = cleaned.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = cleaned.length;

    // Standard reading speed average: 200-250 words per minute
    const estimatedReadTimeMinutes = Math.max(1, Math.round(wordCount / 225));

    // Excerpt snippet of content
    const snippet = cleaned.length > 150 ? cleaned.substring(0, 150) + "..." : cleaned;

    return {
      raw: content,
      sanitized: cleaned,
      charCount,
      wordCount,
      estimatedReadTimeMinutes,
      snippet,
    };
  }
}
