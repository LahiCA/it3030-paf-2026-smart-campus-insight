import React from 'react';
import { useChatbot } from './ChatbotContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatbotPanel = () => {
  const { isOpen } = useChatbot();

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-24 right-6 w-95 h-140 bg-white rounded-2xl shadow-2xl
                 flex flex-col z-9999 border border-gray-200
                 animate-in slide-in-from-bottom-4 duration-300"
      style={{
        animation: 'chatPanelIn 0.3s ease-out',
      }}
    >
      <ChatHeader />
      <MessageList />
      <ChatInput />

      {/* Keyframe injected inline so no extra CSS file is needed */}
      <style>{`
        @keyframes chatPanelIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ChatbotPanel;
