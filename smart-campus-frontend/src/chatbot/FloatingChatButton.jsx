import React from 'react';
import { useChatbot } from './ChatbotContext';
import { IoChatbubblesOutline } from 'react-icons/io5';

const FloatingChatButton = () => {
  const { toggleOpen, isOpen, unreadCount } = useChatbot();

  return (
    <button
      onClick={toggleOpen}
      className={`fixed bottom-6 right-6 z-9999 w-14 h-14 rounded-full
                  bg-linear-to-br from-teal-500 to-teal-600 text-white
                  shadow-lg hover:shadow-xl flex items-center justify-center
                  transition-all duration-300 cursor-pointer
                  ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}
                  hover:scale-110 active:scale-95`}
      title="Smart Campus Assistant"
      style={{
        animation: !isOpen ? 'floatPulse 3s ease-in-out infinite' : 'none',
      }}
    >
      <IoChatbubblesOutline size={26} />

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {/* Glow ring */}
      <span className="absolute inset-0 rounded-full bg-teal-400 opacity-0 animate-ping pointer-events-none" />

      <style>{`
        @keyframes floatPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(20,184,166,0.4); }
          50%      { box-shadow: 0 4px 30px rgba(20,184,166,0.7); }
        }
      `}</style>
    </button>
  );
};

export default FloatingChatButton;
