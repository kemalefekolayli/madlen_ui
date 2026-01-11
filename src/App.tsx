import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, ChatView } from './components';
import { useChat } from './hooks/useChat';
import './index.css';

function AppContent() {
  const { 
    chats, 
    currentChat, 
    currentChatId, 
    models, 
    selectedModel, 
    isLoading, 
    input,
    error,          // YENİ
    clearError,     // YENİ
    setInput,
    setCurrentChatId, 
    setSelectedModel, 
    createNewChat,
    deleteChat,
    sendMessage 
  } = useChat();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
      />
      
      <div className="flex-1 flex flex-col relative h-full">
        <ChatView
          chat={currentChat}
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          input={input}
          setInput={setInput}
          error={error}            // YENİ
          onClearError={clearError} // YENİ
        />
      </div>
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