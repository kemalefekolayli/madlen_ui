// Image content for multi-modal messages
export interface ImageContent {
  type: "base64" | "url";
  data: string;           // base64 encoded data (without data URI prefix) or URL
  mediaType: string;      // "image/jpeg" | "image/png" | "image/gif" | "image/webp"
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: ImageContent[];  // User messages may have images
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Model {
  id: string;
  name: string;
  description?: string;
  free?: boolean;
  supportsVision?: boolean;  // NEW: Vision capability indicator
}

export type Theme = 'light' | 'dark';

// Chat request type for API calls
export interface ChatRequest {
  sessionId: string;
  message: string;
  model?: string;
  images?: ImageContent[];  // NEW: Images for multi-modal messages
}
