import type { Chat } from '../types';
import { MadlenLogo } from './MadlenLogo';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export function Sidebar({ chats, currentChatId, onSelectChat, onNewChat }: SidebarProps) {
  return (
    <aside className="sidebar w-72 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-cream-300 dark:border-dark-100">
        <div className="flex items-center justify-between">
          <MadlenLogo />
          <ThemeToggle />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Sohbet
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-2">
          Geçmiş Sohbetler
        </div>
        
        {chats.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Henüz sohbet yok</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${currentChatId === chat.id 
                    ? 'bg-madlen-100 dark:bg-madlen-500/20 text-madlen-700 dark:text-madlen-300' 
                    : 'hover:bg-cream-200 dark:hover:bg-dark-300 text-dark-200 dark:text-slate-300'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="truncate text-sm font-medium">{chat.title}</span>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 pl-6">
                  {new Date(chat.updatedAt).toLocaleDateString('tr-TR', { 
                    day: 'numeric', 
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-cream-300 dark:border-dark-100">
        <div className="text-xs text-center text-slate-400 dark:text-slate-500">
          Powered by OpenRouter API
        </div>
      </div>
    </aside>
  );
}
