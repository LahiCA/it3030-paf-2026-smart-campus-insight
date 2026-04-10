import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatbot } from './ChatbotContext';

const RoleBasedTools = () => {
  const { quickActions, handleSend } = useChatbot();
  const navigate = useNavigate();

  const handleClick = (action) => {
    if (action.navigateTo) {
      navigate(action.navigateTo);
    } else {
      handleSend(action.prompt);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/60">
      {quickActions.slice(0, 6).map((action) => (
        <button
          key={action.id}
          onClick={() => handleClick(action)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-600
                     hover:bg-white hover:shadow-sm hover:text-teal-600 transition-all cursor-pointer"
          title={action.label}
        >
          <span className="text-lg">{action.icon}</span>
          <span className="text-[10px] leading-tight text-center truncate w-full">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default RoleBasedTools;
