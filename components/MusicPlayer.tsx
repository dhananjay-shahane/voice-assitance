import React from 'react';
import { X, Loader2, Play } from 'lucide-react';
import { MusicState } from '../types';

interface MusicPlayerProps {
  musicState: MusicState | null;
  onClose: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ musicState, onClose }) => {
  if (!musicState) return null;

  return (
    <div className="absolute bottom-24 right-4 md:right-8 w-[90%] md:w-96 h-64 bg-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] z-50 border border-zinc-800 animate-in slide-in-from-bottom-20 ring-1 ring-white/10 flex flex-col">
      {/* Player Header */}
      <div className="bg-zinc-900/90 backdrop-blur px-4 py-3 flex justify-between items-center border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${musicState.error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
          <span className="text-xs font-bold text-zinc-300 truncate max-w-[150px] uppercase tracking-wider">
            {musicState.isLoading ? 'Searching...' : musicState.error ? 'Open in YouTube' : (musicState.title || musicState.query || 'Music')}
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
      <div className="flex-1 relative bg-black flex items-center justify-center">
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
        ) : (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${musicState.videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&origin=${window.location.origin}`}
            title="Music Player"
            frameBorder="0"
            referrerPolicy="no-referrer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full" 
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;