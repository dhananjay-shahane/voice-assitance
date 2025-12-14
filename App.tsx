import React, { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Settings as SettingsIcon, MessageSquare, Activity, PanelLeftOpen } from 'lucide-react';
import { useLiveSession } from './hooks/useLiveSession';
import { useWakeWord } from './hooks/useWakeWord';
import Visualizer from './components/Visualizer';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import MusicPlayer from './components/MusicPlayer';
import ActionHUD from './components/ActionHUD';
import QuickSuggestions from './components/QuickSuggestions';
import Sidebar from './components/Sidebar';
import WeatherWidget from './components/WeatherWidget';
import { findVideoId } from './utils/search';
import { ConnectionState, AppSettings, AssistantAction, MusicState, ChatSession, WeatherState } from './types';
import { SYSTEM_INSTRUCTION } from './constants';

function App() {
  const [lastAction, setLastAction] = useState<AssistantAction>({ type: null, message: null });
  const [musicState, setMusicState] = useState<MusicState | null>(null);
  const [weatherState, setWeatherState] = useState<WeatherState | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'voice' | 'chat'>('voice');
  
  // Responsive sidebar init
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);
  
  // Load settings from localStorage
  const [settings, setSettings] = useState<AppSettings>(() => ({
    apiKey: localStorage.getItem('user_api_key') || '',
    model: localStorage.getItem('user_model') || 'gemini-2.5-flash-native-audio-preview-09-2025',
    baseUrl: localStorage.getItem('user_base_url') || '',
    voiceName: localStorage.getItem('user_voice') || 'Kore',
    systemInstruction: localStorage.getItem('user_system_instruction') || SYSTEM_INSTRUCTION,
    pythonBackendUrl: localStorage.getItem('user_python_backend') || 'http://localhost:8000'
  }));

  const saveSettings = (newSettings: AppSettings) => {
      localStorage.setItem('user_api_key', newSettings.apiKey);
      localStorage.setItem('user_model', newSettings.model);
      localStorage.setItem('user_base_url', newSettings.baseUrl);
      localStorage.setItem('user_voice', newSettings.voiceName);
      localStorage.setItem('user_system_instruction', newSettings.systemInstruction);
      localStorage.setItem('user_python_backend', newSettings.pythonBackendUrl);
      setSettings(newSettings);
      setShowSettings(false);
  };

  // History State
  const [history, setHistory] = useState<ChatSession[]>([]);

  // Fetch history from Python Backend
  const fetchHistory = useCallback(async () => {
    try {
        const res = await fetch(`${settings.pythonBackendUrl}/api/history`);
        if (res.ok) {
            const data = await res.json();
            setHistory(data);
        } else {
            // Fallback to local
            const local = JSON.parse(localStorage.getItem('chat_history') || '[]');
            setHistory(local);
        }
    } catch (e) {
        // Fallback
        const local = JSON.parse(localStorage.getItem('chat_history') || '[]');
        setHistory(local);
    }
  }, [settings.pythonBackendUrl]);

  useEffect(() => {
      fetchHistory();
  }, [fetchHistory]);

  const handleToolCall = useCallback(async (name: string, args: any) => {
    console.log('Tool Call:', name, args);
    
    if (name === 'openWebsite') {
      const { url } = args;
      if (url) {
        // Attempt to open website
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        if (win) {
            setLastAction({ type: 'info', message: `Opened website`, link: url });
            return { success: true, message: `Opened ${url}` };
        } else {
            setLastAction({ type: 'info', message: `Popup blocked for ${url}`, link: url });
            return { success: false, message: 'Popup blocked. Please allow popups.' };
        }
      }
      return { success: false, message: 'No URL provided' };
    }

    if (name === 'getWeather') {
        const { city } = args;
        setLastAction({ type: 'weather', message: `Checking weather for ${city}...` });
        
        try {
            // Geocoding to get Lat/Lon
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();
            
            if (geoData.results && geoData.results.length > 0) {
                const { latitude, longitude, name } = geoData.results[0];
                
                // Get Weather
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
                const weatherData = await weatherRes.json();
                
                const current = weatherData.current;
                
                // Simple WMO code mapping
                let condition = 'Clear';
                const code = current.weather_code;
                if (code > 0 && code <= 3) condition = 'Partly Cloudy';
                if (code >= 45 && code <= 48) condition = 'Foggy';
                if (code >= 51 && code <= 67) condition = 'Rainy';
                if (code >= 71 && code <= 77) condition = 'Snowy';
                if (code >= 95) condition = 'Thunderstorm';

                const weatherObj: WeatherState = {
                    location: name,
                    temperature: current.temperature_2m,
                    condition: condition,
                    humidity: current.relative_humidity_2m,
                    windSpeed: current.wind_speed_10m
                };
                
                setWeatherState(weatherObj);
                setTimeout(() => setLastAction({ type: null, message: null }), 3000);
                
                return { 
                    result: `The weather in ${name} is ${condition} with a temperature of ${current.temperature_2m} degrees Celsius.` 
                };
            }
        } catch (e) {
            console.error(e);
            return { error: "Failed to fetch weather data." };
        }
        return { result: "Could not find location." };
    }

    if (name === 'searchGoogle') {
        const { query } = args;
        if (query) {
            const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(url, '_blank', 'noopener,noreferrer');
            setLastAction({ type: 'search', message: `Researched: ${query}`, link: url });
            return { success: true, message: `Searched Google for: ${query}` };
        }
        return { success: false, message: 'No query provided' };
    }

    if (name === 'playMusic') {
      const { query, videoId } = args;
      
      if (videoId) {
          setMusicState({ videoId, title: 'Direct Play', isLoading: false, error: false });
          setLastAction({ type: 'music', message: `Playing Track...` });
          setTimeout(() => setLastAction({ type: null, message: null }), 5000);
          return { success: true, status: `Playing video ID: ${videoId}` };
      }

      if (query) {
        const cleanQuery = query.replace(/["']/g, '');
        setMusicState({ query: cleanQuery, isLoading: true, error: false });
        setLastAction({ type: 'music', message: `Searching: ${cleanQuery}...` });

        // Try Python Backend First if connected, or fallback to frontend logic
        // For now, we keep frontend logic as fallback if tool wasn't intercepted by proxy
        findVideoId(cleanQuery).then((result) => {
            if (result) {
                setMusicState({ 
                    videoId: result.id, 
                    query: cleanQuery, 
                    title: result.title, 
                    isLoading: false,
                    error: false
                });
                setLastAction({ type: 'music', message: `Found: ${result.title}` });
            } else {
                setMusicState({ 
                    query: cleanQuery, 
                    isLoading: false,
                    error: true 
                });
                setLastAction({ type: 'music', message: `Click to play on YouTube` });
            }
            setTimeout(() => setLastAction({ type: null, message: null }), 5000);
        });

        return { success: true, message: `Searching for ${cleanQuery}` };
      }
      return { success: false, message: 'No song specified' };
    }

    if (name === 'stopMusic') {
        setMusicState(null);
        return { success: true, message: 'Music stopped' };
    }

    return { error: 'Unknown tool' };
  }, []);

  const { connect, disconnect, clearTranscripts, connectionState, transcripts, volume } = useLiveSession({
    onToolCall: handleToolCall,
    settings
  });

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  // Wake Word Integration
  useWakeWord(connect, isConnected);

  // Spacebar Push-to-Talk Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat && !isConnected && !isConnecting && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            e.preventDefault();
            connect();
        }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
         if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
             // Optional
         }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    }
  }, [isConnected, isConnecting, connect]);

  // Save session to backend or local
  const saveCurrentSession = useCallback(async () => {
    if (transcripts.length > 0) {
      const firstUserMessage = transcripts.find(m => m.role === 'user')?.text || 'New Conversation';
      const title = firstUserMessage.length > 30 ? firstUserMessage.substring(0, 30) + '...' : firstUserMessage;
      
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title,
        date: new Date().toISOString(),
        messages: [...transcripts]
      };
      
      // Try saving to backend (assuming endpoint exists, unimplemented in this demo XML, but structural)
      // For now, update local state
      setHistory(prev => [newSession, ...prev]);
    }
  }, [transcripts]);

  const handleNewChat = () => {
    saveCurrentSession();
    clearTranscripts();
    setMusicState(null);
    setWeatherState(null);
    if (isConnected) disconnect();
    if (window.innerWidth < 768) setMobileTab('voice');
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        await fetch(`${settings.pythonBackendUrl}/api/history/${id}`, { method: 'DELETE' });
        setHistory(prev => prev.filter(s => s.id !== id));
    } catch {
        setHistory(prev => prev.filter(s => s.id !== id));
        localStorage.setItem('chat_history', JSON.stringify(history.filter(s => s.id !== id)));
    }
  };

  const handleSelectSession = (session: ChatSession) => {
     saveCurrentSession();
  };

  const toggleConnection = () => {
    if (isConnected || isConnecting) {
      saveCurrentSession();
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="h-screen w-screen bg-[#09090b] text-zinc-100 flex relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] opacity-50 animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] opacity-50"></div>
      </div>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        history={history}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row h-full relative z-10 transition-all duration-300">
        
        {/* Top Left: Sidebar Toggle */}
        {!sidebarOpen && (
             <div className="absolute top-4 left-4 z-50">
                 <button 
                    onClick={() => setSidebarOpen(true)} 
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Open Sidebar"
                 >
                     <PanelLeftOpen size={24} />
                 </button>
             </div>
        )}

        {/* Mobile Tab Switcher */}
        <div className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-2xl">
           <button 
             onClick={() => setMobileTab('voice')}
             className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${mobileTab === 'voice' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
           >
             <Activity size={16} /> Voice
           </button>
           <button 
             onClick={() => setMobileTab('chat')}
             className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${mobileTab === 'chat' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
           >
             <MessageSquare size={16} /> Chat
           </button>
        </div>

        {/* Left Section: Orb & Controls */}
        <div className={`${mobileTab === 'voice' ? 'flex' : 'hidden'} md:flex flex-1 md:flex-[0.4] flex-col items-center justify-center p-6 relative border-b md:border-b-0 md:border-r border-white/5 bg-zinc-950/20 backdrop-blur-sm`}>
           
           {!sidebarOpen && (
               <div className="hidden md:flex absolute top-6 left-16 items-center gap-2 animate-in fade-in duration-300">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                    <span className="font-bold tracking-widest text-sm text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">BLURRY AI</span>
               </div>
           )}
           
           <div className="md:hidden absolute top-6 left-16 flex items-center gap-2">
                <span className="font-bold tracking-widest text-sm text-white">BLURRY</span>
           </div>

           <button 
             onClick={() => setShowSettings(true)}
             className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
           >
             <SettingsIcon size={20} />
           </button>
           
           {/* Info Panel removed as requested */}

           <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
              <Visualizer volume={volume} active={isConnected} />
              
              <div className="mt-8 flex flex-col items-center gap-2">
                  <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 transition-all duration-500">
                    {isConnected ? (volume > 0.05 ? "Listening..." : "Online") : "Say \"Hello Assistant\""}
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono tracking-wide">
                      {isConnected ? "Ask to Play Music • News • Research" : "Tap Spacebar or Mic to wake up"}
                  </p>
              </div>
           </div>

           <div className="mb-8 md:mb-12">
              <button 
                onClick={toggleConnection}
                disabled={isConnecting}
                className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ${
                  isConnected 
                    ? 'bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                    : 'bg-white text-black hover:scale-110 shadow-[0_0_40px_rgba(255,255,255,0.4)]'
                }`}
              >
                 {isConnecting ? (
                     <div className="w-8 h-8 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                 ) : isConnected ? (
                     <MicOff className="w-8 h-8 text-red-500 transition-transform group-hover:scale-110" />
                 ) : (
                     <Mic className="w-8 h-8 transition-transform group-hover:scale-110" />
                 )}
              </button>
           </div>
        </div>

        {/* Right Section: Content */}
        <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex flex-1 md:flex-[0.6] flex-col bg-zinc-950/40 backdrop-blur-md relative shadow-2xl overflow-hidden`}>
           
           <ChatInterface messages={transcripts} />

           <QuickSuggestions 
              visible={!isConnected && transcripts.length === 0} 
              onConnect={() => {
                  setMobileTab('voice');
                  toggleConnection();
              }} 
           />

        </div>

        {/* Global Overlays */}
        <MusicPlayer musicState={musicState} onClose={() => setMusicState(null)} />
        <WeatherWidget weather={weatherState} onClose={() => setWeatherState(null)} />
        <ActionHUD action={lastAction} />

      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        currentSettings={settings}
        onSave={saveSettings}
      />
    </div>
  );
}

export default App;