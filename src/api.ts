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
  images: msg.images 
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
      supportsVision: m.supportsVision ?? false
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

  // Send message
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
        images 
      });
      
      return {
        assistantMessage: mapBackendMessageToFrontend(response.data.assistantMessage, 999),
        sessionId: response.data.sessionId
      };
    } catch (error: any) {
      console.error("API Hatası Detay:", error.response?.data); // Konsolda da görelim

      if (error.response) {
        const data = error.response.data;
        const status = error.response.status;

        // 1. Beklediğimiz standart 'message' alanı
        if (data && data.message) {
          throw new Error(data.message);
        }

        // 2. Data direkt string olarak geldiyse
        if (typeof data === 'string') {
          throw new Error(data);
        }

        // 3. 'error' alanı varsa (Spring Boot varsayılanı)
        if (data && data.error && typeof data.error === 'string') {
             // Eğer message yoksa error başlığını kullan
             throw new Error(data.message || data.error);
        }

        // 4. Eğer 400 ise ve hala mesaj bulamadıysak, data objesini string yapıp fırlat
        // Bu sayede "Error 400" yerine { "limit": 10 ... } gibi bir şey görürüz ve anlarız.
        if (status === 400) {
           throw new Error(JSON.stringify(data));
        }

        // 5. Standart durumlar
        if (status === 429) throw new Error('RATE_LIMIT');
        if (status === 404) throw new Error('MODEL_NOT_FOUND');
        if (status >= 500) throw new Error('SERVER_ERROR');
      }
      
      // Hiçbir şey yakalanmazsa orjinal hatayı fırlat
      throw error;
    }
  },

  // Send message with streaming
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
      // Hata metnini body'den okumaya çalış
      let errorText = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) errorText = errorJson.message;
        else if (errorJson.error) errorText = errorJson.error;
      } catch {
        // JSON değilse text olarak oku
        const text = await response.text();
        if (text) errorText = text;
      }
      throw new Error(errorText);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  }
};