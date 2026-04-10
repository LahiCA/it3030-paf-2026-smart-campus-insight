import React from 'react';
import BotAvatar from './BotAvatar';

const TypingIndicator = () => (
  <div className="flex items-end gap-2 px-4 py-2">
    <BotAvatar size="sm" />

    <div className="flex flex-col items-start">
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-[10px] text-gray-400 mt-0.5 ml-1">typing...</span>
    </div>
  </div>
);

export default TypingIndicator;
