import React from 'react';

interface VisualizerProps {
  volume: number;
  active: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, active }) => {
  // Volume is 0.0 to ~0.5 usually. We scale it up for CSS transforms.
  const scale = 1 + Math.min(volume * 5, 1.5); // Cap scale at 2.5x
  
  return (
    <div className="relative w-[300px] h-[300px] flex items-center justify-center">
      {/* Container for the Orb */}
      <div className={`relative flex items-center justify-center transition-all duration-500 ${active ? 'opacity-100' : 'opacity-40 grayscale'}`}>
        
        {/* Outer Glow / Aura */}
        <div 
            className="absolute bg-blue-500 rounded-full mix-blend-screen filter blur-[60px] opacity-40 animate-pulse"
            style={{ 
                width: '280px', 
                height: '280px',
                transform: `scale(${active ? scale * 1.1 : 0.8})`,
                transition: 'transform 0.1s ease-out'
            }}
        ></div>

        {/* Core shape 1 - Cyan/Blue */}
        <div 
            className="absolute bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full mix-blend-screen filter blur-[40px] opacity-80"
            style={{ 
                width: '200px', 
                height: '200px',
                transform: `scale(${active ? scale : 0.9}) translate(-10px, -10px)`,
                transition: 'transform 0.1s ease-out'
            }}
        ></div>

        {/* Core shape 2 - Purple/Pink */}
        <div 
            className="absolute bg-gradient-to-bl from-purple-500 to-pink-500 rounded-full mix-blend-screen filter blur-[40px] opacity-80"
            style={{ 
                width: '180px', 
                height: '180px',
                transform: `scale(${active ? scale * 0.9 : 0.9}) translate(10px, 10px)`,
                transition: 'transform 0.15s ease-out'
            }}
        ></div>

        {/* Inner Highlight */}
        <div 
            className="absolute bg-white rounded-full mix-blend-overlay filter blur-[20px] opacity-90"
            style={{ 
                width: '100px', 
                height: '100px',
                transform: `scale(${active ? scale * 1.2 : 1})`,
                transition: 'transform 0.05s ease-out'
            }}
        ></div>
        
      </div>
      
      {!active && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs tracking-widest uppercase">
            Offline
         </div>
      )}
    </div>
  );
};

export default Visualizer;