import type { Message } from '../types';
import { MessageImages } from './MessageImages';

interface ChatMessageProps {
  message: Message;
  modelName?: string;
}

export function ChatMessage({ message, modelName }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasImages = message.images && message.images.length > 0;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser 
            ? 'bg-madlen-500 text-white' 
            : 'bg-cream-300 dark:bg-dark-200 text-madlen-600 dark:text-madlen-400'
          }`}
        >
          {isUser ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Message Content */}
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
          {/* Model name for assistant messages */}
          {!isUser && modelName && (
            <div className="text-xs font-medium text-madlen-500 dark:text-madlen-400 mb-1">
              {modelName}
            </div>
          )}
          
          {/* Images (shown above text for user messages) */}
          {hasImages && isUser && (
            <MessageImages images={message.images!} />
          )}
          
          {/* Message text */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          )}
          
          {/* Images (shown below for assistant messages if they ever have images) */}
          {hasImages && !isUser && (
            <div className="mt-2">
              <MessageImages images={message.images!} />
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
            {hasImages && (
              <span className="ml-2">
                • {message.images!.length} resim
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-cream-300 dark:bg-dark-200 text-madlen-600 dark:text-madlen-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="chat-bubble-assistant">
          <div className="flex gap-1.5 py-1">
            <span className="w-2 h-2 rounded-full bg-madlen-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-madlen-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-madlen-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}
