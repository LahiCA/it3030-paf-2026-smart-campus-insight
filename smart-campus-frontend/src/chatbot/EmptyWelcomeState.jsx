import React from 'react';
import { useChatbot } from './ChatbotContext';
import BotAvatar from './BotAvatar';

const EmptyWelcomeState = () => {
  const { suggestedPrompts, handleSend, role } = useChatbot();

  const roleLabel = {
    ADMIN: 'Administrator',
    LECTURER: 'Lecturer',
    TECHNICIAN: 'Technician',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      {/* Bot avatar */}
      <div className="mb-4">
        <BotAvatar size="lg" />
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-1">Smart Campus Assistant</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-62.5">
        Hi {roleLabel[role] || 'there'}! I can help you with bookings, resources, tickets &amp; more.
      </p>

      {/* Suggested prompts */}
      <div className="w-full space-y-2">
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="w-full text-left text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                       hover:bg-teal-50 hover:border-teal-200 transition-colors cursor-pointer truncate"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyWelcomeState;
