/**
 * Shared types for AI Browser Companion
 */

export interface ExtractedPageData {
  title: string;
  url: string;
  excerpt: string;
  content: string;
  byline: string;
  length: number;
}

export type ChatMessageSender = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  sender: ChatMessageSender;
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  iconName: string;
  description: string;
}

export interface ExtensionSettings {
  ollamaUrl: string;
  ollamaModel: string;
  isSimulatorMode: boolean;
  systemPrompt: string;
  voiceVolume: number;
  voiceRate: number;
  showFloatingButton?: boolean;
}

export type ExtensionRequestType = 'GET_CONTENT' | 'OLLAMA_CHAT' | 'CHECK_OLLAMA_STATUS' | 'GET_MODELS' | 'OPEN_SIDE_PANEL';

export interface ExtensionRequest {
  type: ExtensionRequestType;
  payload?: any;
}

export interface ExtensionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
