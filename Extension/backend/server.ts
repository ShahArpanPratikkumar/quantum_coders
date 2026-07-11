import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { aiRouter } from "./controllers/ai.controller";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount the modular AI router containing Summary, Question, Explain, Voice, Session, and Content features
  app.use("/api", aiRouter);
  app.use("/api/ai", aiRouter);

  // API Route for Gemini Chat proxy (used in Sandbox/Simulator Mode inside the browser preview)
  app.post("/api/chat", async (req, res) => {
    const { messages, systemInstruction } = req.body;
    
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(400).json({ 
        success: false, 
        error: "GEMINI_API_KEY is not configured. Please add your GEMINI_API_KEY in the Secrets panel." 
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      
      // Transform chat messages to Gemini content format
      // Gemini SDK format: { role: 'user' | 'model', parts: [{ text: '...' }] }
      const contents = (messages || []).map((msg: any) => {
        let role = "user";
        if (msg.role === "assistant" || msg.role === "model" || msg.sender === "assistant") {
          role = "model";
        }
        return {
          role: role,
          parts: [{ text: msg.content || msg.text || "" }]
        };
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction || "You are a helpful reading companion. Summarize the provided document strictly matching the facts.",
          temperature: 0.2,
          maxOutputTokens: 1000,
        }
      });

      res.json({
        success: true,
        text: response.text || ""
      });
    } catch (error: any) {
      console.error("[Server API] Gemini Chat Error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to communicate with Gemini model" 
      });
    }
  });

  // Serve Vite assets in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Browser Companion] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
