import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../api';
import type { Chat, Model, Message, ImageContent } from '../types';

const USER_ID = "demo-user";

const getFriendlyErrorMessage = (errorMsg: string): string => {
  if (!errorMsg) return "Bir hata oluştu.";

  // Backend'den JSON string döndüyse temizle (örn: {"message": "..."})
  if (errorMsg.startsWith("{") && errorMsg.includes("limit")) {
     // Basit bir temizlik
     if (errorMsg.includes("session limit")) return "⚠️ Sohbet limiti doldu. Lütfen eski sohbetleri silin.";
     if (errorMsg.includes("message limit")) return "⚠️ Mesaj limiti doldu. Yeni sohbet açın.";
  }

  // 1. Session Limit
  const sessionLimitMatch = errorMsg.match(/Maximum session limit reached: (\d+)/);
  if (sessionLimitMatch) {
    return `⚠️ Maksimum sohbet limitine (${sessionLimitMatch[1]}) ulaştınız. Lütfen eski sohbetlerden birini silin.`;
  }

  // 2. Message Limit
  const messageLimitMatch = errorMsg.match(/Maximum message limit reached.*: (\d+)/);
  if (messageLimitMatch) {
    return `⚠️ Bu sohbet mesaj limitine (${messageLimitMatch[1]}) ulaştı. Lütfen yeni bir sohbet başlatın.`;
  }

  // 3. Genel Kontroller
  if (errorMsg.includes("session limit")) return "⚠️ Sohbet sınırına ulaştınız. Eskileri silmelisiniz.";
  if (errorMsg.includes("message limit")) return "⚠️ Mesaj limiti doldu. Yeni sohbet açın.";
  if (errorMsg.includes("support image") || errorMsg.includes("Vision") || errorMsg.includes("vision")) return "📷 Seçtiğiniz model görsel analizini desteklemiyor.";
  if (errorMsg.includes("Image size exceeds")) return "🖼️ Resim çok büyük. Lütfen 5MB'dan küçük bir resim yükleyin.";
  if (errorMsg.includes("Invalid image")) return "❌ Geçersiz resim formatı.";
  
  // 4. Axios Varsayılan Hataları (Yakalanılamayan 400 durumları için)
  if (errorMsg.includes("status code 400")) return "⚠️ İstek geçersiz. (Limit aşımı veya hatalı veri).";
  if (errorMsg.includes("Network Error")) return "⚠️ Sunucuya ulaşılamıyor. Backend çalışıyor mu?";

  // 5. Diğerleri
  if (errorMsg.includes("AI service error") || errorMsg.includes("OpenRouter")) return "🔌 Yapay zeka servisine ulaşılamıyor. Biraz bekleyin.";
  if (errorMsg === "RATE_LIMIT" || errorMsg.includes("429")) return "⏳ Sistem çok yoğun, lütfen bekleyin.";
  if (errorMsg === "MODEL_NOT_FOUND" || errorMsg.includes("404")) return "🚫 Model veya sohbet bulunamadı.";

  return errorMsg.length < 200 ? `⚠️ ${errorMsg}` : "⚠️ Beklenmedik bir hata oluştu.";
};

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const currentChat = chats.find(c => c.id === currentChatId) || null;
  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const initData = async () => {
      try {
        const [fetchedModels, fetchedSessions] = await Promise.all([
          chatService.getModels(),
          chatService.getUserSessions(USER_ID)
        ]);
        setModels(fetchedModels);
        if (fetchedModels.length > 0 && !selectedModel) {
          const visionModel = fetchedModels.find(m => m.supportsVision);
          setSelectedModel(visionModel?.id || fetchedModels[0].id);
        }
        setChats(fetchedSessions);
      } catch (err) {
        console.error(err);
        setError("Veriler yüklenemedi. Backend'i kontrol edin.");
      }
    };
    initData();
  }, []);

  const createNewChat = useCallback(async () => {
    let activeModel = selectedModel || (models.length > 0 ? models[0].id : "");
    if (!activeModel) return;

    try {
      setError(null);
      const newChat = await chatService.createSession(USER_ID, activeModel);
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      if (!selectedModel) setSelectedModel(activeModel);
    } catch (e: any) { 
      setError(getFriendlyErrorMessage(e.message || ""));
    }
  }, [selectedModel, models]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await chatService.deleteSession(chatId, USER_ID);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (currentChatId === chatId) setCurrentChatId(null);
    } catch (error) {
      setError("Sohbet silinirken hata oluştu.");
    }
  }, [currentChatId]);

  const sendMessage = useCallback(async (content: string, images?: ImageContent[]) => {
    if (!content.trim() && (!images || images.length === 0)) return;

    let activeModel = selectedModel;
    if (!activeModel && models.length > 0) {
      activeModel = models[0].id;
      setSelectedModel(activeModel);
    }
    
    if (!activeModel) {
      setError("Lütfen bir model seçiniz.");
      return;
    }

    const currentModelData = models.find(m => m.id === activeModel);
    if (images && images.length > 0 && !currentModelData?.supportsVision) {
      setError("Seçili model resim desteklemiyor. Lütfen 'Vision' özellikli bir model seçin.");
      return;
    }

    setError(null);
    let chatId = currentChatId;

    if (!chatId) {
      try {
        const newChat = await chatService.createSession(USER_ID, activeModel);
        chatId = newChat.id;
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(chatId);
      } catch (e: any) { 
        setError(getFriendlyErrorMessage(e.message || ""));
        return; 
      }
    }

    setInput("");

    const addMessage = (role: 'user' | 'assistant', text: string, msgImages?: ImageContent[]) => {
      const msg: Message = { 
        id: Date.now().toString(), 
        role, 
        content: text, 
        timestamp: new Date(),
        images: msgImages
      };
      setChats(prev => prev.map(c => c.id === chatId ? { 
        ...c, 
        messages: [...c.messages, msg],
        title: c.messages.length === 0 && role === 'user' 
          ? (text.substring(0, 30) || (msgImages?.length ? 'Resimli mesaj' : 'Yeni Sohbet'))
          : c.title 
      } : c));
    };

    addMessage('user', content, images);
    setIsLoading(true);

    try {
      const res = await chatService.sendMessage(chatId!, content, activeModel, images);
      setChats(prev => prev.map(c => c.id === chatId 
        ? { ...c, messages: [...c.messages, res.assistantMessage] } 
        : c
      ));
    } catch (error: any) {
      const friendlyMessage = getFriendlyErrorMessage(error.message || "");
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, selectedModel, models]);

  return { 
    chats, currentChat, currentChatId, models, selectedModel, 
    isLoading, input, error, clearError, setInput,
    setCurrentChatId, setSelectedModel, createNewChat, deleteChat, sendMessage 
  };
};