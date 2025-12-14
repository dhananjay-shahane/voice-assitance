import React, { useEffect } from 'react';
import { Plus, MessageSquare, Clock, Trash2, X, PanelLeftClose, ServerCrash } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChatSession[];
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, history, onSelectSession, onNewChat, onDeleteSession }) => {
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${isOpen ? 'md:w-72' : 'md:w-0 md:overflow-hidden md:border-none'}
      `}>
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5 h-16">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"></div>
            <span className="font-bold text-sm tracking-widest text-white">HISTORY</span>
          </div>
          
          <div className="flex items-center gap-1">
             {/* Desktop Collapse Button */}
             <button 
               onClick={onClose} 
               className="hidden md:flex p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
               title="Close Sidebar"
             >
               <PanelLeftClose size={20} />
             </button>

             {/* Mobile Close Button */}
             <button 
               onClick={onClose} 
               className="md:hidden p-2 text-zinc-500 hover:text-white"
             >
               <X size={20} />
             </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
          >
            <Plus size={16} /> New Conversation
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-zinc-600 text-xs gap-2">
              <Clock size={24} className="opacity-50" />
              <span>No recent history</span>
              <span className="text-[10px] text-zinc-700">Check Python Backend</span>
            </div>
          ) : (
            history.map((session) => (
              <div 
                key={session.id}
                onClick={() => {
                  onSelectSession(session);
                  if (window.innerWidth < 768) onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-zinc-900 cursor-pointer transition-colors border border-transparent hover:border-zinc-800"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={14} className="text-zinc-500 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-zinc-300 truncate font-medium">{session.title || 'Untitled Chat'}</span>
                    <span className="text-[10px] text-zinc-600 truncate flex items-center gap-1">
                       {new Date(session.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={(e) => onDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 text-zinc-600 rounded-md transition-all"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
            <div className="text-[10px] text-zinc-600 text-center flex flex-col gap-1">
                <span>Blurry AI v2.0 (Python)</span>
                <span className="text-[9px] text-zinc-700 font-mono">Backend: {history.length > 0 ? 'Connected' : 'Offline'}</span>
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;