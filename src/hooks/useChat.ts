import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../api';
import type { Chat, Model, Message, ImageContent } from '../types';

const USER_ID = "demo-user";

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  const currentChat = chats.find(c => c.id === currentChatId) || null;

  // 1. Load initial data
  useEffect(() => {
    const initData = async () => {
      try {
        const [fetchedModels, fetchedSessions] = await Promise.all([
          chatService.getModels(),
          chatService.getUserSessions(USER_ID)
        ]);
        setModels(fetchedModels);
        
        // Prefer vision-capable model as default if available
        if (fetchedModels.length > 0 && !selectedModel) {
          const visionModel = fetchedModels.find(m => m.supportsVision);
          setSelectedModel(visionModel?.id || fetchedModels[0].id);
        }
        
        setChats(fetchedSessions);
      } catch (error) {
        console.error("Veri yükleme hatası", error);
      }
    };
    initData();
  }, []);

  // 2. Create new chat
  const createNewChat = useCallback(async () => {
    let activeModel = selectedModel || (models.length > 0 ? models[0].id : "");
    if (!activeModel) return;

    try {
      const newChat = await chatService.createSession(USER_ID, activeModel);
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      if (!selectedModel) setSelectedModel(activeModel);
    } catch (e) { 
      console.error(e); 
    }
  }, [selectedModel, models]);

  // 3. Delete chat
  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await chatService.deleteSession(chatId, USER_ID);
      setChats(prev => prev.filter(c => c.id !== chatId));
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
    } catch (error) {
      console.error("Sohbet silme hatası", error);
    }
  }, [currentChatId]);

  // 4. Send message (with optional images)
  const sendMessage = useCallback(async (content: string, images?: ImageContent[]) => {
    // Allow sending if there's text or images
    if (!content.trim() && (!images || images.length === 0)) return;

    let activeModel = selectedModel;
    if (!activeModel && models.length > 0) {
      activeModel = models[0].id;
      setSelectedModel(activeModel);
    }
    if (!activeModel) {
      alert("Lütfen bir model seçiniz.");
      return;
    }

    // Check if trying to send images with non-vision model
    const currentModelData = models.find(m => m.id === activeModel);
    if (images && images.length > 0 && !currentModelData?.supportsVision) {
      alert("Seçili model görsel desteklemiyor. Lütfen görsel destekleyen bir model seçin.");
      return;
    }

    let chatId = currentChatId;

    // Create session if none exists
    if (!chatId) {
      try {
        const newChat = await chatService.createSession(USER_ID, activeModel);
        chatId = newChat.id;
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(chatId);
      } catch (e) { 
        console.error(e);
        return; 
      }
    }

    setInput("");

    // Helper to add message to chat
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
        // Update title from first user message if empty
        title: c.messages.length === 0 && role === 'user' 
          ? (text.substring(0, 30) || (msgImages?.length ? 'Resimli mesaj' : 'Yeni Sohbet'))
          : c.title 
      } : c));
    };

    // Add user message with images
    addMessage('user', content, images);
    setIsLoading(true);

    try {
      const res = await chatService.sendMessage(chatId!, content, activeModel, images);
      setChats(prev => prev.map(c => c.id === chatId 
        ? { ...c, messages: [...c.messages, res.assistantMessage] } 
        : c
      ));
    } catch (error: any) {
      let errorText = "Bir hata oluştu.";
      
      switch (error.message) {
        case "RATE_LIMIT":
          errorText = "⚠️ Model şu an çok yoğun. Lütfen başka model seçin.";
          break;
        case "MODEL_NOT_FOUND":
          errorText = "⚠️ Bu modele erişilemiyor (404).";
          break;
        case "SERVER_ERROR":
          errorText = "⚠️ Sunucu hatası.";
          break;
        case "VISION_NOT_SUPPORTED":
          errorText = "⚠️ Seçili model görsel/resim girişlerini desteklemiyor. Lütfen görsel destekleyen bir model seçin.";
          break;
        case "IMAGE_TOO_LARGE":
          errorText = "⚠️ Resim boyutu çok büyük. Maksimum 5 MB olmalıdır.";
          break;
        case "INVALID_IMAGE":
          errorText = "⚠️ Geçersiz resim formatı. Lütfen JPEG, PNG, GIF veya WebP formatında bir resim seçin.";
          break;
        default:
          if (error.details) {
            errorText = `⚠️ ${error.details}`;
          }
      }
      
      addMessage('assistant', errorText);
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, selectedModel, models]);

  return { 
    chats, 
    currentChat, 
    currentChatId, 
    models, 
    selectedModel, 
    isLoading, 
    input,
    setInput,
    setCurrentChatId, 
    setSelectedModel, 
    createNewChat, 
    deleteChat,
    sendMessage 
  };
};
