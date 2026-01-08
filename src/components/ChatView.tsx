import { useRef, useEffect } from 'react';
import type { Chat, Model } from '../types';
import { ModelSelector } from './ModelSelector';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatViewProps {
  chat: Chat | null;
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  modelsLoading?: boolean;
}

export function ChatView({ 
  chat, 
  models, 
  selectedModel, 
  onSelectModel, 
  onSendMessage,
  isLoading,
  modelsLoading 
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-cream-300 dark:border-dark-100 bg-white/80 dark:bg-dark-400/80 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-semibold text-dark-300 dark:text-white">
            {chat?.title || 'Yeni Sohbet'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Yapay zeka ile sohbet edin
          </p>
        </div>
        
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
          loading={modelsLoading}
        />
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {!chat || chat.messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {chat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <ChatInput 
        onSendMessage={onSendMessage} 
        disabled={isLoading}
        placeholder={isLoading ? 'Yanıt bekleniyor...' : 'Mesajınızı yazın...'}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      {/* Decorative icon */}
      <div className="w-20 h-20 rounded-full bg-madlen-100 dark:bg-madlen-500/20 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-madlen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-dark-300 dark:text-white mb-2">
        Hoş Geldiniz!
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        Yapay zeka destekli sohbet asistanınız ile konuşmaya başlayın. 
        Model seçerek farklı yeteneklere sahip AI'lar ile iletişim kurabilirsiniz.
      </p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {[
          'Merhaba, nasıl yardımcı olabilirsin?',
          'Bana bir hikaye anlat',
          'Türkiye\'nin başkenti neresi?',
          'Kod yazmamda yardım et'
        ].map((suggestion, idx) => (
          <button
            key={idx}
            className="px-4 py-2 text-sm rounded-full 
                       bg-cream-200 dark:bg-dark-300 
                       text-dark-200 dark:text-slate-300
                       hover:bg-madlen-100 dark:hover:bg-madlen-500/20
                       hover:text-madlen-600 dark:hover:text-madlen-400
                       transition-all duration-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
