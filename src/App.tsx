import { useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, ChatView } from './components';
import type { Chat, Message, Model } from './types';
import './index.css';

// Mock data for initial development - will be replaced with API calls
const MOCK_MODELS: Model[] = [
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B', description: 'Google\'ın açık kaynak modeli', free: true },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B', description: 'Meta\'nın hızlı modeli', free: true },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', description: 'Mistral AI\'ın güçlü modeli', free: true },
  { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B', description: 'Alibaba\'nın çok dilli modeli', free: true },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function AppContent() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(MOCK_MODELS[0].id);
  const [isLoading, setIsLoading] = useState(false);

  const currentChat = chats.find(c => c.id === currentChatId) || null;

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: 'Yeni Sohbet',
      messages: [],
      model: selectedModel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  }, [selectedModel]);

  const handleSendMessage = useCallback(async (content: string) => {
    // If no current chat, create one
    let chatId = currentChatId;
    if (!chatId) {
      const newChat: Chat = {
        id: generateId(),
        title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [],
        model: selectedModel,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChats(prev => [newChat, ...prev]);
      chatId = newChat.id;
      setCurrentChatId(chatId);
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedTitle = chat.messages.length === 0 
          ? content.substring(0, 30) + (content.length > 30 ? '...' : '')
          : chat.title;
        return {
          ...chat,
          title: updatedTitle,
          messages: [...chat.messages, userMessage],
          updatedAt: new Date(),
        };
      }
      return chat;
    }));

    // Simulate API call (will be replaced with real OpenRouter API)
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call to backend
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: content, model: selectedModel, chatId }),
      // });
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Bu bir test yanıtıdır. Gerçek API entegrasyonu yapıldığında, seçilen model (${selectedModel}) üzerinden OpenRouter API'si kullanılarak yanıt alınacaktır.\n\nMesajınız: "${content}"`,
        timestamp: new Date(),
      };

      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, assistantMessage],
            updatedAt: new Date(),
          };
        }
        return chat;
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Add error handling UI
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, selectedModel]);

  const handleSelectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={createNewChat}
      />
      <ChatView
        chat={currentChat}
        models={MOCK_MODELS}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
