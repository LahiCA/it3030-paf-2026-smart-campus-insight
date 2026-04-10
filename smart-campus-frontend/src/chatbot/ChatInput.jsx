import React, { useState, useRef } from 'react';
import { useChatbot } from './ChatbotContext';
import { IoSend } from 'react-icons/io5';
import { HiOutlinePaperClip } from 'react-icons/hi2';

const ChatInput = () => {
  const { handleSend, inputPlaceholder, isTyping } = useChatbot();
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isTyping) return;
    handleSend(text);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-200 bg-white"
    >
      <button
        type="button"
        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        title="Attach file"
      >
        <HiOutlinePaperClip size={18} />
      </button>

      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={inputPlaceholder}
        disabled={isTyping}
        className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 outline-none
                   focus:ring-2 focus:ring-teal-200 transition-shadow placeholder-gray-400
                   disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={!text.trim() || isTyping}
        className="p-2 rounded-full bg-linear-to-br from-teal-500 to-teal-600 text-white
                   shadow hover:shadow-md disabled:opacity-40 transition-all cursor-pointer"
      >
        <IoSend size={16} />
      </button>
    </form>
  );
};

export default ChatInput;
