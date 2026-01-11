import axios from 'axios';
import type { Chat, Model, Message, ImageContent } from './types';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

// Helper function to map backend messages to frontend format
const mapBackendMessageToFrontend = (msg: any, index: number): Message => ({
  id: `msg-${Date.now()}-${index}`,
  role: msg.role,
  content: msg.content,
  timestamp: new Date(msg.timestamp || Date.now()),
  images: msg.images // Include images if present
});

export const chatService = {
  // Get all models
  getModels: async (): Promise<Model[]> => {
    const response = await api.get<any[]>('/models');
    return response.data.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      free: m.available,
      supportsVision: m.supportsVision ?? false // NEW: Map vision support
    }));
  },

  // Get only vision-capable models
  getVisionModels: async (): Promise<Model[]> => {
    const response = await api.get<any[]>('/models/vision');
    return response.data.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      free: m.available,
      supportsVision: true
    }));
  },

  // Check if a specific model supports vision
  checkModelSupportsVision: async (modelId: string): Promise<boolean> => {
    try {
      const response = await api.get<boolean>(`/models/${encodeURIComponent(modelId)}/supports-vision`);
      return response.data;
    } catch {
      return false;
    }
  },

  // Create new session
  createSession: async (userId: string, modelId: string): Promise<Chat> => {
    const response = await api.post('/sessions', { userId, model: modelId });
    const data = response.data;
    
    return {
      id: data.id,
      title: data.title || 'Yeni Sohbet',
      messages: [],
      model: data.selectedModel,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  },

  // Get user sessions
  getUserSessions: async (userId: string): Promise<Chat[]> => {
    const response = await api.get<any[]>(`/sessions?userId=${userId}`);
    return response.data.map(s => ({
      id: s.id,
      title: s.title || 'Yeni Sohbet',
      messages: (s.messages || []).map(mapBackendMessageToFrontend),
      model: s.selectedModel,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt)
    }));
  },

  // Delete session
  deleteSession: async (sessionId: string, userId: string): Promise<void> => {
    await api.delete(`/sessions/${sessionId}?userId=${userId}`);
  },

  // Send message (with optional images)
  sendMessage: async (
    sessionId: string, 
    message: string, 
    model?: string,
    images?: ImageContent[]
  ) => {
    try {
      const response = await api.post('/chat', { 
        sessionId, 
        message, 
        model,
        images // Include images in request
      });
      
      return {
        assistantMessage: mapBackendMessageToFrontend(response.data.assistantMessage, 999),
        sessionId: response.data.sessionId
      };
    } catch (error: any) {
      // Handle specific error responses
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || '';
        
        // Vision not supported error
        if (status === 400 && errorMessage.includes('vision')) {
          const customError = new Error('VISION_NOT_SUPPORTED');
          (customError as any).details = errorMessage;
          throw customError;
        }
        
        // Image too large error
        if (status === 413) {
          const customError = new Error('IMAGE_TOO_LARGE');
          (customError as any).details = errorMessage;
          throw customError;
        }
        
        // Invalid image error
        if (status === 400 && errorMessage.includes('image')) {
          const customError = new Error('INVALID_IMAGE');
          (customError as any).details = errorMessage;
          throw customError;
        }
        
        // Rate limit error
        if (status === 429) {
          throw new Error('RATE_LIMIT');
        }
        
        // Model not found
        if (status === 404) {
          throw new Error('MODEL_NOT_FOUND');
        }
        
        // Server error
        if (status >= 500) {
          throw new Error('SERVER_ERROR');
        }
      }
      
      throw error;
    }
  },

  // Send message with streaming (for future implementation)
  sendMessageStream: async function* (
    sessionId: string, 
    message: string, 
    model?: string,
    images?: ImageContent[]
  ) {
    const response = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        sessionId, 
        message, 
        model,
        images 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      yield chunk;
    }
  }
};
