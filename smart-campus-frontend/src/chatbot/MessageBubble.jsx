import React from 'react';
import BotAvatar from './BotAvatar';

const formatTime = (d) =>
  new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-2 px-4 py-1 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar (bot only) */}
      {!isUser && <BotAvatar size="sm" />}

      <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word
            ${
              isUser
                ? 'bg-linear-to-br from-teal-500 to-teal-600 text-white rounded-2xl rounded-br-sm shadow'
                : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
            }`}
        >
          {message.text}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
