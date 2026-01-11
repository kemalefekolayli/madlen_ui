import { useRef, useEffect } from 'react';
import type { Chat, Model, ImageContent } from '../types';
import { ModelSelector } from './ModelSelector';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { StarterPrompts } from './StarterPrompts';

interface ChatViewProps {
  chat: Chat | null;
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onSendMessage: (message: string, images?: ImageContent[]) => void;
  isLoading?: boolean;
  modelsLoading?: boolean;
  input: string;
  setInput: (value: string) => void;
}

export function ChatView({ 
  chat, 
  models, 
  selectedModel, 
  onSelectModel, 
  onSendMessage,
  isLoading,
  modelsLoading,
  input,
  setInput
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find selected model name
  const selectedModelData = models.find(m => m.id === selectedModel);
  const modelName = selectedModelData?.name || 'AI';

  // Auto-scroll when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages, isLoading]);

  // Handle starter prompt selection
  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      onSendMessage(prompt);
    }, 50);
  };

  const hasMessages = chat && chat.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-screen relative bg-cream-50 dark:bg-dark-500">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-cream-300 dark:border-dark-100 bg-white/80 dark:bg-dark-400/80 backdrop-blur-sm z-50 relative">
        <div>
          <h1 className="text-lg font-semibold text-dark-300 dark:text-white">
            {chat?.title || 'Yeni Sohbet'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Yapay zeka ile sohbet edin
            {selectedModelData?.supportsVision && (
              <span className="ml-2 inline-flex items-center gap-1 text-madlen-500">
                • Görsel destekli
              </span>
            )}
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
      <main className="flex-1 overflow-y-auto px-6 py-6 relative">
        <div className="max-w-4xl mx-auto">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <EmptyState supportsVision={selectedModelData?.supportsVision} />
              <div className="w-full mt-8">
                <StarterPrompts onSelect={handlePromptSelect} />
              </div>
            </div>
          ) : (
            <>
              {chat.messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  modelName={message.role === 'assistant' ? modelName : undefined}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="z-20 relative">
        <ChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading || false}
          input={input}
          setInput={setInput}
          models={models}
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  supportsVision?: boolean;
}

function EmptyState({ supportsVision }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-madlen-100 dark:bg-madlen-500/20 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-madlen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-dark-300 dark:text-white mb-2">
        Hoş Geldiniz!
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        Model seçerek sohbete başlayabilirsiniz.
        {supportsVision && (
          <span className="block mt-2 text-madlen-500">
            📷 Bu model görsel/resim girişlerini destekliyor!
          </span>
        )}
      </p>
    </div>
  );
}
