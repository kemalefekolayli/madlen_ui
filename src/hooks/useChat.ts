import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../api';
import type { Chat, Model, Message } from '../types';

const USER_ID = "demo-user";

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  const currentChat = chats.find(c => c.id === currentChatId) || null;

  // 1. Verileri Yükle
  useEffect(() => {
    const initData = async () => {
      try {
        const [fetchedModels, fetchedSessions] = await Promise.all([
          chatService.getModels(),
          chatService.getUserSessions(USER_ID)
        ]);
        setModels(fetchedModels);
        
        if (fetchedModels.length > 0 && !selectedModel) {
          setSelectedModel(fetchedModels[0].id);
        }
        
        setChats(fetchedSessions);
      } catch (error) {
        console.error("Veri yükleme hatası", error);
      }
    };
    initData();
  }, []);

  // 2. Yeni Sohbet
  const createNewChat = useCallback(async () => {
    let activeModel = selectedModel || (models.length > 0 ? models[0].id : "");
    if (!activeModel) return;

    try {
      const newChat = await chatService.createSession(USER_ID, activeModel);
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      if (!selectedModel) setSelectedModel(activeModel);
    } catch (e) { console.error(e); }
  }, [selectedModel, models]);

  // 3. Sohbet Sil
  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await chatService.deleteSession(chatId, USER_ID);
      setChats(prev => prev.filter(c => c.id !== chatId));
      
      // Silinen sohbet aktifse, başka bir sohbete geç veya null yap
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
    } catch (error) {
      console.error("Sohbet silme hatası", error);
    }
  }, [currentChatId]);

  // 4. Mesaj Gönderme
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    let activeModel = selectedModel;
    if (!activeModel && models.length > 0) {
        activeModel = models[0].id;
        setSelectedModel(activeModel);
    }
    if (!activeModel) {
        alert("Lütfen bir model seçiniz.");
        return;
    }

    let chatId = currentChatId;

    // Oturum yoksa oluştur
    if (!chatId) {
      try {
        const newChat = await chatService.createSession(USER_ID, activeModel);
        chatId = newChat.id;
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(chatId);
      } catch (e) { return; }
    }

    setInput("");

    const addMessage = (role: 'user' | 'assistant', text: string) => {
      const msg: Message = { id: Date.now().toString(), role, content: text, timestamp: new Date() };
      setChats(prev => prev.map(c => c.id === chatId ? { 
        ...c, 
        messages: [...c.messages, msg],
        title: c.messages.length === 0 ? text.substring(0, 30) : c.title 
      } : c));
    };

    addMessage('user', content);
    setIsLoading(true);

    try {
      const res = await chatService.sendMessage(chatId!, content, activeModel);
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, res.assistantMessage] } : c));
    } catch (error: any) {
      let errorText = "Bir hata oluştu.";
      if (error.message === "RATE_LIMIT") errorText = "⚠️ Model şu an çok yoğun. Lütfen başka model seçin.";
      else if (error.message === "MODEL_NOT_FOUND") errorText = "⚠️ Bu modele erişilemiyor (404).";
      else if (error.message === "SERVER_ERROR") errorText = "⚠️ Sunucu hatası.";
      
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
    deleteChat,  // YENİ
    sendMessage 
  };
};