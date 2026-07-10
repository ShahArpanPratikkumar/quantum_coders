import { Router, Request, Response } from "express";
import { AIService, GeminiProvider, MockAIProvider } from "../services/ai.service";
import { ContentFeature } from "../features/content.feature";
import { SessionFeature } from "../features/session.feature";
import { SummaryFeature, SummaryFormat } from "../features/summary.feature";
import { QuestionFeature } from "../features/question.feature";
import { ExplainFeature, ExplanationLevel } from "../features/explain.feature";
import { VoiceFeature } from "../features/voice.feature";

export const aiRouter = Router();

// Feature instances
const summaryFeature = new SummaryFeature();
const questionFeature = new QuestionFeature();
const explainFeature = new ExplainFeature();
const voiceFeature = new VoiceFeature();

/**
 * Endpoint: Load or Update Page Content for a Session
 * Body: { sessionId: string, content: string }
 */
aiRouter.post("/content", (req: Request, res: Response) => {
  const { sessionId, content } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }

  try {
    const cleaned = ContentFeature.process(content);
    const session = SessionFeature.updateContent(sessionId, cleaned);
    
    return res.json({
      success: true,
      message: "Webpage context loaded and indexed into session.",
      data: {
        charCount: cleaned.charCount,
        wordCount: cleaned.wordCount,
        estimatedReadTimeMinutes: cleaned.estimatedReadTimeMinutes,
        snippet: cleaned.snippet,
        sessionActive: !!session.activeContent
      }
    });
  } catch (error: any) {
    console.error("[AIController] Content processing failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Generate Summary of Active Page Content
 * Body: { sessionId: string, format?: SummaryFormat }
 */
aiRouter.post("/summary", async (req: Request, res: Response) => {
  const { sessionId, format } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }

  try {
    const session = SessionFeature.getOrCreate(sessionId);
    if (!session.activeContent) {
      return res.status(400).json({ 
        success: false, 
        error: "No active content loaded for this session. Please upload content first." 
      });
    }

    const summaryText = await summaryFeature.generate(session.activeContent, format as SummaryFormat);
    
    // Store in conversational history
    SessionFeature.appendMessage(sessionId, "user", `Generate summary (${format || "bullets"})`);
    const assistantMsg = SessionFeature.appendMessage(sessionId, "model", summaryText);

    return res.json({
      success: true,
      data: {
        summary: summaryText,
        message: assistantMsg
      }
    });
  } catch (error: any) {
    console.error("[AIController] Summary generation failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Ask Question about Active Page Context or general Q&A
 * Body: { sessionId: string, question: string }
 */
aiRouter.post("/ask", async (req: Request, res: Response) => {
  const { sessionId, question } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }
  if (!question) {
    return res.status(400).json({ success: false, error: "Missing question query" });
  }

  try {
    const session = SessionFeature.getOrCreate(sessionId);
    
    // Append the user's question to the chat history
    SessionFeature.appendMessage(sessionId, "user", question);

    // Solve using question feature (RAG-style lookup)
    const answer = await questionFeature.ask(question, session.activeContent, session.chatHistory);
    
    // Append the assistant's response to the history
    const assistantMsg = SessionFeature.appendMessage(sessionId, "model", answer);

    return res.json({
      success: true,
      data: {
        answer,
        message: assistantMsg
      }
    });
  } catch (error: any) {
    console.error("[AIController] Question ask failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Explain a specific term, snippet, or complex idea
 * Body: { sessionId: string, term: string, level?: ExplanationLevel }
 */
aiRouter.post("/explain", async (req: Request, res: Response) => {
  const { sessionId, term, level } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }
  if (!term) {
    return res.status(400).json({ success: false, error: "Missing term to explain" });
  }

  try {
    const session = SessionFeature.getOrCreate(sessionId);
    const answer = await explainFeature.explain(term, level as ExplanationLevel, session.activeContent);

    // Record interaction
    SessionFeature.appendMessage(sessionId, "user", `Explain term: "${term}" (${level || "beginner"})`);
    const assistantMsg = SessionFeature.appendMessage(sessionId, "model", answer);

    return res.json({
      success: true,
      data: {
        explanation: answer,
        message: assistantMsg
      }
    });
  } catch (error: any) {
    console.error("[AIController] Explanation failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Text-To-Speech Synthesis
 * Body: { text: string, voiceName?: string }
 */
aiRouter.post("/voice/tts", async (req: Request, res: Response) => {
  const { text, voiceName } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: "Missing text for TTS synthesis" });
  }

  try {
    const base64Audio = await voiceFeature.synthesizeSpeech(text, voiceName);
    return res.json({
      success: true,
      data: {
        audio: base64Audio,
        format: "audio/pcm",
        sampleRate: 24000
      }
    });
  } catch (error: any) {
    console.error("[AIController] Voice TTS synthesis failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Voice Command processing and parsing
 * Body: { sessionId: string, transcript: string }
 */
aiRouter.post("/voice/command", async (req: Request, res: Response) => {
  const { sessionId, transcript } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }
  if (!transcript) {
    return res.status(400).json({ success: false, error: "Missing transcript" });
  }

  try {
    const parsed = voiceFeature.parseVoiceCommand(transcript);
    const session = SessionFeature.getOrCreate(sessionId);
    
    let resultPayload: any = { parsed };

    // Automatically invoke action handlers internally if direct match occurs!
    if (parsed.isCommand) {
      if (parsed.action === "summarize") {
        if (session.activeContent) {
          const summary = await summaryFeature.generate(session.activeContent, "bullets");
          SessionFeature.appendMessage(sessionId, "user", "[Voice Command] Summarize this page");
          const msg = SessionFeature.appendMessage(sessionId, "model", summary);
          resultPayload.executed = { action: "summarize", response: summary, message: msg };
        } else {
          parsed.feedbackText = "No active page context loaded to summarize. Please open a page first.";
        }
      } else if (parsed.action === "clear") {
        SessionFeature.clearHistory(sessionId);
        resultPayload.executed = { action: "clear" };
      } else if (parsed.action === "explain" && parsed.argument) {
        const explanation = await explainFeature.explain(parsed.argument, "beginner", session.activeContent);
        SessionFeature.appendMessage(sessionId, "user", `[Voice Command] Explain ${parsed.argument}`);
        const msg = SessionFeature.appendMessage(sessionId, "model", explanation);
        resultPayload.executed = { action: "explain", response: explanation, message: msg };
      } else if (parsed.action === "ask" && parsed.argument) {
        SessionFeature.appendMessage(sessionId, "user", `[Voice Command] Search: ${parsed.argument}`);
        const answer = await questionFeature.ask(parsed.argument, session.activeContent, session.chatHistory);
        const msg = SessionFeature.appendMessage(sessionId, "model", answer);
        resultPayload.executed = { action: "ask", response: answer, message: msg };
      }
    }

    return res.json({
      success: true,
      data: resultPayload
    });
  } catch (error: any) {
    console.error("[AIController] Voice command parsing failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Get Session details (History, state, current loaded document context)
 * GET /api/ai/session/:sessionId
 */
aiRouter.get("/session/:sessionId", (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }

  try {
    const session = SessionFeature.getOrCreate(sessionId);
    return res.json({
      success: true,
      data: {
        sessionId: session.id,
        chatHistory: session.chatHistory,
        hasContent: !!session.activeContent,
        contentStats: session.activeContent ? {
          charCount: session.activeContent.charCount,
          wordCount: session.activeContent.wordCount,
          estimatedReadTimeMinutes: session.activeContent.estimatedReadTimeMinutes
        } : null,
        voiceSettings: session.voiceSettings
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Clear Conversational Dialogue History
 * Body: { sessionId: string }
 */
aiRouter.post("/session/clear", (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }

  try {
    const session = SessionFeature.clearHistory(sessionId);
    return res.json({
      success: true,
      message: "Dialogue context flushed successfully.",
      data: { chatHistory: session.chatHistory }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Swappable AI Engine Settings
 * Body: { provider: "gemini" | "mock" }
 */
aiRouter.post("/provider", (req: Request, res: Response) => {
  const { provider } = req.body;
  
  try {
    if (provider === "gemini") {
      AIService.getInstance().setProvider(new GeminiProvider());
    } else if (provider === "mock") {
      AIService.getInstance().setProvider(new MockAIProvider());
    } else {
      return res.status(400).json({ success: false, error: "Invalid provider. Must be 'gemini' or 'mock'." });
    }

    const currentName = AIService.getInstance().getProvider().constructor.name;
    return res.json({
      success: true,
      message: `Active provider updated successfully.`,
      data: { activeProvider: currentName }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Extract and list Key Points of active context
 * Body: { sessionId: string }
 */
aiRouter.post("/keypoints", async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }

  try {
    const session = SessionFeature.getOrCreate(sessionId);
    if (!session.activeContent) {
      return res.status(400).json({ 
        success: false, 
        error: "No active content loaded for this session. Please extract page content first." 
      });
    }

    const provider = AIService.getInstance().getProvider();
    const systemInstruction = 
      "You are a high-fidelity information extraction system. " +
      "Identify and extract the most important key points and crucial milestones in the provided content. " +
      "Use clear, scannable markdown with bullet points and bold headers. Do not extrapolate, speculate, or add external facts.";

    const prompt = 
      `PAGE METADATA:\n` +
      `- Snippet: ${session.activeContent.snippet}\n` +
      `- Length: ${session.activeContent.charCount} characters\n\n` +
      `CORE TASK: Extract and outline the key points of the following document.\n\n` +
      `PAGE SOURCE:\n"""\n${session.activeContent.sanitized}\n"""`;

    const keypointsText = await provider.generateText(prompt, systemInstruction, 0.2);
    
    SessionFeature.appendMessage(sessionId, "user", "Extract Key Points");
    const assistantMsg = SessionFeature.appendMessage(sessionId, "model", keypointsText);

    return res.json({
      success: true,
      data: {
        keypoints: keypointsText,
        message: assistantMsg
      }
    });
  } catch (error: any) {
    console.error("[AIController] Keypoints generation failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Extract facts and statistics
 * Body: { sessionId: string }
 */
aiRouter.post("/facts", async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }

  try {
    const session = SessionFeature.getOrCreate(sessionId);
    if (!session.activeContent) {
      return res.status(400).json({ 
        success: false, 
        error: "No active content loaded for this session. Please extract page content first." 
      });
    }

    const provider = AIService.getInstance().getProvider();
    const systemInstruction = 
      "You are an objective factual auditing system. " +
      "Extract and list the top verified facts, statistics, numbers, dates, and hard data assertions from the provided context. " +
      "Format them as a clean, list-style audit. Do not introduce any external knowledge or speculation.";

    const prompt = 
      `PAGE SOURCE:\n"""\n${session.activeContent.sanitized}\n"""\n\n` +
      `CORE TASK: List all core verified facts and statistics from the page source above.`;

    const factsText = await provider.generateText(prompt, systemInstruction, 0.1);
    
    SessionFeature.appendMessage(sessionId, "user", "Extract Verified Facts");
    const assistantMsg = SessionFeature.appendMessage(sessionId, "model", factsText);

    return res.json({
      success: true,
      data: {
        facts: factsText,
        message: assistantMsg
      }
    });
  } catch (error: any) {
    console.error("[AIController] Facts generation failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Generate FAQ based on active context
 * Body: { sessionId: string }
 */
aiRouter.post("/faq", async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }

  try {
    const session = SessionFeature.getOrCreate(sessionId);
    if (!session.activeContent) {
      return res.status(400).json({ 
        success: false, 
        error: "No active content loaded for this session. Please extract page content first." 
      });
    }

    const provider = AIService.getInstance().getProvider();
    const systemInstruction = 
      "You are a master educator. " +
      "Based on the provided context, generate a structured FAQ (Frequently Asked Questions) list with clear, helpful questions and accurate answers matching only the provided facts. " +
      "Format beautifully using markdown headers.";

    const prompt = 
      `PAGE SOURCE:\n"""\n${session.activeContent.sanitized}\n"""\n\n` +
      `CORE TASK: Generate 3 to 5 realistic FAQs with their respective answers based strictly on the text above.`;

    const faqText = await provider.generateText(prompt, systemInstruction, 0.3);
    
    SessionFeature.appendMessage(sessionId, "user", "Generate FAQ");
    const assistantMsg = SessionFeature.appendMessage(sessionId, "model", faqText);

    return res.json({
      success: true,
      data: {
        faq: faqText,
        message: assistantMsg
      }
    });
  } catch (error: any) {
    console.error("[AIController] FAQ generation failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Analyze document tone, structure, and bias
 * Body: { sessionId: string }
 */
aiRouter.post("/analyze", async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: "Missing sessionId" });
  }

  try {
    const session = SessionFeature.getOrCreate(sessionId);
    if (!session.activeContent) {
      return res.status(400).json({ 
        success: false, 
        error: "No active content loaded for this session. Please extract page content first." 
      });
    }

    const provider = AIService.getInstance().getProvider();
    const systemInstruction = 
      "You are a senior research analyst. " +
      "Analyze the provided text for tone, underlying logic, prospective bias, and major themes. " +
      "Provide a professional, objective analysis report using elegant markdown structure.";

    const prompt = 
      `PAGE SOURCE:\n"""\n${session.activeContent.sanitized}\n"""\n\n` +
      `CORE TASK: Perform a comprehensive, critical analysis of this manuscript covering tone, logical consistency, bias evaluation, and core themes.`;

    const analyzeText = await provider.generateText(prompt, systemInstruction, 0.2);
    
    SessionFeature.appendMessage(sessionId, "user", "Analyze Manuscript");
    const assistantMsg = SessionFeature.appendMessage(sessionId, "model", analyzeText);

    return res.json({
      success: true,
      data: {
        analysis: analyzeText,
        message: assistantMsg
      }
    });
  } catch (error: any) {
    console.error("[AIController] Analysis generation failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Synthesize active session text or summary text
 * Body: { sessionId?: string, text?: string }
 */
aiRouter.post("/voice/read", async (req: Request, res: Response) => {
  const { sessionId, text } = req.body;
  try {
    let textToRead = text;
    if (!textToRead && sessionId) {
      const session = SessionFeature.getOrCreate(sessionId);
      if (session.activeContent) {
        textToRead = session.activeContent.snippet;
      }
    }
    
    if (!textToRead) {
      return res.status(400).json({ success: false, error: "Missing text or active content to read" });
    }

    const base64Audio = await voiceFeature.synthesizeSpeech(textToRead, "Kore");
    return res.json({
      success: true,
      data: {
        audio: base64Audio,
        format: "audio/pcm",
        sampleRate: 24000
      }
    });
  } catch (error: any) {
    console.error("[AIController] Voice read generation failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Health verification endpoint for connection status
 */
aiRouter.get("/health", (req: Request, res: Response) => {
  return res.json({
    success: true,
    status: "online",
    version: "1.0.0",
    message: "Quantum AI Local Model Backend Connection Established Successfully."
  });
});

