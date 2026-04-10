import React, { useEffect } from 'react';
import { useChatbot } from './ChatbotContext';
import MessageBubble from './MessageBubble';
import RichCards from './RichCards';
import SuggestionChips from './SuggestionChips';
import TypingIndicator from './TypingIndicator';
import EmptyWelcomeState from './EmptyWelcomeState';

const MessageList = () => {
  const { messages, isTyping, handleSend, bottomRef } = useChatbot();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, bottomRef]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyWelcomeState />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300">
      {messages.map((msg, idx) => (
        <React.Fragment key={msg.id}>
          <MessageBubble message={msg} />
          {msg.role === 'assistant' && msg.cards && <RichCards cards={msg.cards} />}
          {msg.role === 'assistant' && idx === messages.length - 1 && (
            <SuggestionChips suggestions={msg.suggestions} onSelect={handleSend} />
          )}
        </React.Fragment>
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
