import { CleanedContent } from "./content.feature";

export interface ChatMessage {
  id: string;
  sender: "user" | "model" | "system";
  text: string;
  timestamp: string;
}

export interface Session {
  id: string;
  activeContent: CleanedContent | null;
  chatHistory: ChatMessage[];
  voiceSettings: {
    volume: number;
    rate: number;
    voiceName: string;
  };
  lastAccessed: number;
}

/**
 * Feature: Session Management
 * Coordinates in-memory sessions for multi-tab companion sidebars or multi-user state preservation.
 */
export class SessionFeature {
  private static sessions: Map<string, Session> = new Map();

  /**
   * Retrieves an existing session or creates a new one if it doesn't exist.
   */
  public static getOrCreate(sessionId: string): Session {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        activeContent: null,
        chatHistory: [
          {
            id: `sys-${Date.now()}`,
            sender: "system",
            text: "Session initialized. Standing by for companion page context injection.",
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
        voiceSettings: {
          volume: 1.0,
          rate: 1.0,
          voiceName: "Kore",
        },
        lastAccessed: Date.now(),
      };
      this.sessions.set(sessionId, session);
    } else {
      session.lastAccessed = Date.now();
    }
    return session;
  }

  /**
   * Updates the active page/article content loaded in a session.
   */
  public static updateContent(sessionId: string, content: CleanedContent): Session {
    const session = this.getOrCreate(sessionId);
    session.activeContent = content;
    session.lastAccessed = Date.now();
    return session;
  }

  /**
   * Appends a message to the session's sliding-window history.
   */
  public static appendMessage(sessionId: string, sender: "user" | "model" | "system", text: string): ChatMessage {
    const session = this.getOrCreate(sessionId);
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    session.chatHistory.push(message);
    
    // Maintain a sliding window of the last 30 messages to prevent token bloat
    if (session.chatHistory.length > 30) {
      // Retain the system welcome message at index 0 but slice old dialogues
      const welcome = session.chatHistory[0];
      session.chatHistory = [welcome, ...session.chatHistory.slice(-29)];
    }

    session.lastAccessed = Date.now();
    return message;
  }

  /**
   * Clears chat history for a session.
   */
  public static clearHistory(sessionId: string): Session {
    const session = this.getOrCreate(sessionId);
    session.chatHistory = [
      {
        id: `sys-${Date.now()}`,
        sender: "system",
        text: "Conversation context cleared. Starting fresh companion dialogue.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ];
    session.lastAccessed = Date.now();
    return session;
  }

  /**
   * Removes stale sessions that haven't been accessed in 1 hour.
   */
  public static reapStaleSessions(maxAgeMs = 3600000): number {
    const now = Date.now();
    let reaped = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastAccessed > maxAgeMs) {
        this.sessions.delete(id);
        reaped++;
      }
    }
    return reaped;
  }
}
