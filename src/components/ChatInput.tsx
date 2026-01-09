import React, { FormEvent, useRef, useEffect } from 'react';
import { Send, StopCircle } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  input: string;                  // YENİ PROP
  setInput: (value: string) => void; // YENİ PROP
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, input, setInput }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-end gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-3xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Bir mesaj yazın..."
          className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`p-3 rounded-full flex-shrink-0 transition-all duration-200 ${
            input.trim() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? <StopCircle size={20} className="animate-pulse" /> : <Send size={20} />}
        </button>
      </form>
      <div className="text-center mt-2 text-xs text-gray-400 dark:text-gray-500">
        Madlen AI hata yapabilir. Önemli bilgileri kontrol edin.
      </div>
    </div>
  );
};