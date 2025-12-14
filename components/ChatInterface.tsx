import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { Bot, User, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Filter out system messages for a cleaner UI, unless important
  const displayMessages = messages.filter(m => m.text && m.text.trim() !== '');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-transparent">
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth pb-32">
        {displayMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 opacity-70">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
               <Sparkles className="text-zinc-500" size={24} />
            </div>
            <p className="text-sm font-light tracking-wide">Ready to assist.</p>
          </div>
        )}

        {displayMessages.map((msg) => {
           const isSystem = msg.role === 'system';
           const isUser = msg.role === 'user';
           
           if (isSystem) {
               return (
                   <div key={msg.id} className="flex justify-center my-2">
                       <span className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800/50">
                           {msg.text}
                       </span>
                   </div>
               )
           }

           return (
            <div 
                key={msg.id} 
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
                <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg mt-1 ${
                    isUser 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-tr from-purple-500 to-indigo-500'
                }`}>
                    {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    isUser 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-tl-sm'
                    }`}>
                    {msg.text}
                    </div>
                    {/* Timestamp */}
                    {/* <span className="text-[10px] text-zinc-500 mt-1 px-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span> */}
                </div>

                </div>
            </div>
           );
        })}
      </div>
      
      {/* Bottom Gradient Fade to transition smoothly to input/controls if we had them */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default ChatInterface;