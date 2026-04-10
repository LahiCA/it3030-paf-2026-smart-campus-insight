import React from 'react';
import { IoClose } from 'react-icons/io5';
import { HiOutlineTrash } from 'react-icons/hi2';
import { useChatbot } from './ChatbotContext';
import BotAvatar from './BotAvatar';

const ChatHeader = () => {
  const { toggleOpen, clearChat } = useChatbot();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-teal-500 to-teal-700 text-white rounded-t-2xl">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <BotAvatar size="md" />
        <div>
          <p className="font-semibold text-sm leading-tight">Smart Campus Assistant</p>
          <p className="text-[11px] text-teal-200">Online &middot; AI Powered</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={clearChat}
          className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
          title="Clear chat"
        >
          <HiOutlineTrash size={16} />
        </button>
        <button
          onClick={toggleOpen}
          className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
          title="Close"
        >
          <IoClose size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
