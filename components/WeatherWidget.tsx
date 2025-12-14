import React from 'react';
import { Cloud, Droplets, Wind, X, Sun, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import { WeatherState } from '../types';

interface WeatherWidgetProps {
  weather: WeatherState | null;
  onClose: () => void;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, onClose }) => {
  if (!weather) return null;

  const getIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-12 h-12 text-blue-400" />;
    if (c.includes('snow')) return <CloudSnow className="w-12 h-12 text-white" />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className="w-12 h-12 text-yellow-400" />;
    if (c.includes('cloud')) return <Cloud className="w-12 h-12 text-zinc-400" />;
    return <Sun className="w-12 h-12 text-orange-400" />;
  };

  return (
    <div className="absolute top-24 right-4 md:right-8 w-[90%] md:w-80 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl z-40 animate-in slide-in-from-top-10 ring-1 ring-white/5">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col items-center">
        <h3 className="text-zinc-400 text-sm font-medium tracking-widest uppercase mb-1">{weather.location}</h3>
        <div className="my-4 animate-bounce-slow">
            {getIcon(weather.condition)}
        </div>
        <div className="text-5xl font-bold text-white mb-2">{Math.round(weather.temperature)}°</div>
        <div className="text-zinc-300 font-medium capitalize">{weather.condition}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <Droplets size={12} /> Humidity
            </div>
            <span className="text-white font-mono">{weather.humidity}%</span>
        </div>
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <Wind size={12} /> Wind
            </div>
            <span className="text-white font-mono">{weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;