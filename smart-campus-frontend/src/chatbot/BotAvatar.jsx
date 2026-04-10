import React from 'react';

/**
 * AI Robot Avatar — uses the custom robot profile image.
 * Sizes: 'sm' (32px), 'md' (36px), 'lg' (64px)
 */
const BotAvatar = ({ size = 'sm', showOnline = true }) => {
  const dim = size === 'lg' ? 'w-16 h-16' : size === 'md' ? 'w-9 h-9' : 'w-8 h-8';
  const dotSize = size === 'lg' ? 'w-4 h-4 border-[3px]' : 'w-2.5 h-2.5 border-2';
  const dotPos = size === 'lg' ? 'bottom-0 right-0' : '-bottom-0.5 -right-0.5';

  return (
    <div className="relative shrink-0">
      <div className={`${dim} rounded-full overflow-hidden bg-white shadow flex items-center justify-center`}>
        <img
          src="/graident1.png"
          alt="Smart Campus Assistant"
          className="w-full h-full object-cover"
        />
      </div>
      {showOnline && (
        <span className={`absolute ${dotPos} ${dotSize} bg-green-400 rounded-full border-white`} />
      )}
    </div>
  );
};

export default BotAvatar;
