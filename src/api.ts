import axios from 'axios';
// Tip importlarını 'import type' ile yaparak o hatayı çözüyoruz
import type { Chat, Model, Message } from './types';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

// Backend'den gelen mesajları Frontend formatına çeviren yardımcı fonksiyon
const mapBackendMessageToFrontend = (msg: any, index: number): Message => ({
  id: `msg-${Date.now()}-${index}`, // Backend ID göndermediği için üretiyoruz
  role: msg.role,
  content: msg.content,
  timestamp: new Date(msg.timestamp || Date.now())
});

export const chatService = {
  // Modelleri getir
  getModels: async (): Promise<Model[]> => {
    const response = await api.get<any[]>('/models');
    // Backend 'available' dönüyor, biz 'free' olarak kullanıyoruz
    return response.data.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      free: m.available
    }));
  },

  // Yeni oturum başlat
  createSession: async (userId: string, modelId: string): Promise<Chat> => {
    const response = await api.post('/sessions', { userId, model: modelId });
    const data = response.data;
    
    return {
      id: data.id,
      title: data.title || 'Yeni Sohbet',
      messages: [], // Yeni oturum boş başlar
      model: data.selectedModel,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  },

  // Kullanıcının oturumlarını getir
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

  // Mesaj gönder
  sendMessage: async (sessionId: string, message: string, model?: string) => {
    const response = await api.post('/chat', { sessionId, message, model });
    // Backend cevabı: { assistantMessage: {role, content...}, ... }
    return {
      assistantMessage: mapBackendMessageToFrontend(response.data.assistantMessage, 999),
      sessionId: response.data.sessionId
    };
  }
};