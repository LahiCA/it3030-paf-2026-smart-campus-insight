import React from 'react';

const SuggestionChips = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          className="text-xs px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50 text-teal-700
                     hover:bg-teal-100 hover:border-teal-300 transition-colors cursor-pointer whitespace-nowrap"
        >
          {s}
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;
