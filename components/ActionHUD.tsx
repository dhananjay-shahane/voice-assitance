import React from 'react';
import { Music, Search, ExternalLink } from 'lucide-react';
import { AssistantAction } from '../types';

interface ActionHUDProps {
  action: AssistantAction;
}

const ActionHUD: React.FC<ActionHUDProps> = ({ action }) => {
  if (!action.message) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-auto bg-zinc-900/95 border border-zinc-700/50 backdrop-blur-xl px-6 py-4 rounded-full flex items-center gap-4 shadow-2xl z-40 animate-in slide-in-from-bottom-10 ring-1 ring-white/10">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        action.type === 'music' ? 'bg-pink-500/20 text-pink-500' : 'bg-blue-500/20 text-blue-500'
      }`}>
        {action.type === 'music' ? <Music size={20} /> : <Search size={20} />}
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-medium text-white truncate">{action.message}</p>
        {action.link && (
          <p className="text-[10px] text-zinc-500 truncate">{new URL(action.link).hostname}</p>
        )}
      </div>
      {action.link && (
        <a href={action.link} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ExternalLink size={16} className="text-zinc-400" />
        </a>
      )}
    </div>
  );
};

export default ActionHUD;