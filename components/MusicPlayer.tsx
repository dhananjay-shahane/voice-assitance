import React from 'react';
import { X, Loader2, Play, Activity, Music } from 'lucide-react';
import { MusicState } from '../types';

interface MusicPlayerProps {
  musicState: MusicState | null;
  onClose: () => void;
  onRetry?: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ musicState, onClose, onRetry }) => {
  if (!musicState) return null;

  return (
    <div className="absolute bottom-24 right-4 md:right-8 w-[90%] md:w-96 h-64 bg-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] z-50 border border-zinc-800 animate-in slide-in-from-bottom-20 ring-1 ring-white/10 flex flex-col">
      {/* Player Header */}
      <div className="bg-zinc-900/90 backdrop-blur px-4 py-3 flex justify-between items-center border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${musicState.error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
          <span className="text-xs font-bold text-zinc-300 truncate max-w-[150px] uppercase tracking-wider">
            {musicState.isLoading ? 'Searching...' : musicState.error ? 'Playback Error' : (musicState.title || musicState.query || 'Music')}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={14} className="text-zinc-400" />
        </button>
      </div>
      
      {/* Embed Container */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {musicState.isLoading ? (
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <Loader2 className="animate-spin" />
            <span className="text-xs">Finding best match...</span>
          </div>
        ) : musicState.error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-zinc-400 text-sm mb-4">Could not load player automatically.</p>
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(musicState.query || '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform"
            >
              <Play size={12} fill="currentColor" /> Open in YouTube
            </a>
          </div>
        ) : musicState.url ? (
          <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full bg-gradient-to-b from-zinc-900 to-black">
             <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4 shadow-2xl border border-white/10 relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                <Music className="text-purple-500 relative z-10" size={40} />
             </div>
             <p className="text-white font-bold text-lg mb-1 truncate w-full px-4">{musicState.title}</p>
             <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                <Activity size={12} className="text-green-500" />
                <span>Library Stream</span>
             </div>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube-nocookie.com/embed/${musicState.videoId}?autoplay=1&rel=0`}
              title="Music Player"
              frameBorder="0"
              referrerPolicy="no-referrer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
            <div className="absolute bottom-2 left-2 right-2 flex justify-center opacity-0 hover:opacity-100 transition-opacity">
               <button 
                 onClick={onRetry}
                 className="bg-black/80 backdrop-blur text-white text-[10px] px-3 py-1 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all"
               >
                 Not playing? Try another version
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;