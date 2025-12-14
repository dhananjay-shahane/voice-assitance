import React from 'react';
import { Music, Search, Newspaper } from 'lucide-react';

interface QuickSuggestionsProps {
  onConnect: () => void;
  visible: boolean;
}

const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ onConnect, visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-8 left-0 w-full px-8 overflow-x-auto no-scrollbar flex gap-3 justify-center">
      <button 
        onClick={onConnect}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs font-medium text-zinc-300 hover:bg-white hover:text-black transition-all whitespace-nowrap"
      >
        <Music size={14} /> "Play Arjit Singh"
      </button>
      <button 
        onClick={onConnect}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs font-medium text-zinc-300 hover:bg-white hover:text-black transition-all whitespace-nowrap"
      >
        <Newspaper size={14} /> "Latest News"
      </button>
      <button 
        onClick={onConnect}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs font-medium text-zinc-300 hover:bg-white hover:text-black transition-all whitespace-nowrap"
      >
        <Search size={14} /> "Research React"
      </button>
    </div>
  );
};

export default QuickSuggestions;