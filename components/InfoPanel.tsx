import React from 'react';

interface InfoPanelProps {
  devMode: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ devMode }) => {
  return (
    <div className="flex justify-start mb-6">
      <div className={`bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center gap-4 ${devMode ? 'ring-1 ring-amber-500/50' : ''}`}>
        <div className={`p-2 rounded-lg ${devMode ? 'bg-amber-500/10' : 'bg-zinc-500/10'}`}>
          <Terminal className={`w-5 h-5 ${devMode ? 'text-amber-500' : 'text-zinc-500'}`} />
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase font-semibold">Mode</p>
          <p className={`text-sm font-medium ${devMode ? 'text-amber-400' : 'text-zinc-400'}`}>
            {devMode ? 'DEVELOPER' : 'STANDARD'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper for Lucide icon that wasn't imported in this file specifically
const Terminal = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
);

export default InfoPanel;