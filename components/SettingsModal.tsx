import React, { useState } from 'react';
import { Settings as SettingsIcon, X, Save, Server, Mic, Brain, RefreshCw } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [settings, setSettings] = useState<AppSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'persona'>('general');

  if (!isOpen) return null;

  const handlePreset = (type: 'google' | 'ollama' | 'local') => {
      if (type === 'google') {
          setSettings(prev => ({ ...prev, baseUrl: '' }));
      } else if (type === 'ollama') {
          setSettings(prev => ({ ...prev, baseUrl: 'http://localhost:11434/v1' }));
      } else if (type === 'local') {
          setSettings(prev => ({ ...prev, baseUrl: 'http://localhost:1234/v1' }));
      }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl ring-1 ring-white/10 flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-zinc-950/50 border-b md:border-b-0 md:border-r border-zinc-800 p-4 flex flex-col gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 px-2">
                <SettingsIcon size={20} className="text-purple-500" /> Configuration
            </h2>
            
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
            >
                <Server size={18} /> Connection & LLM
            </button>
            <button 
                onClick={() => setActiveTab('persona')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'persona' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
            >
                <Brain size={18} /> Persona & Voice
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">
                    {activeTab === 'general' ? 'LLM Provider Settings' : 'Assistant Personality'}
                </h3>
                <button onClick={onClose} className="text-zinc-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {activeTab === 'general' && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        API Key
                        </label>
                        <input 
                        type="password" 
                        value={settings.apiKey}
                        onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                        placeholder="Enter Gemini API Key"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-zinc-700"
                        />
                        <p className="text-[10px] text-zinc-600 mt-1">Leave empty to use default env key.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        Model Name
                        </label>
                        <input 
                        type="text" 
                        value={settings.model}
                        onChange={(e) => setSettings({...settings, model: e.target.value})}
                        placeholder="gemini-2.5-flash-native-audio-preview-09-2025"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono placeholder:text-zinc-700"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                API Base URL (Proxy/Local)
                            </label>
                            <div className="flex gap-2">
                                <button onClick={() => handlePreset('google')} className="text-[10px] px-2 py-1 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-300">Default</button>
                                <button onClick={() => handlePreset('ollama')} className="text-[10px] px-2 py-1 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-300">Ollama</button>
                            </div>
                        </div>
                        <input 
                            type="text" 
                            value={settings.baseUrl}
                            onChange={(e) => setSettings({...settings, baseUrl: e.target.value})}
                            placeholder="https://generativelanguage.googleapis.com"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono placeholder:text-zinc-700"
                        />
                        <p className="text-[10px] text-zinc-600 mt-1">
                            Set to <code className="text-zinc-400">http://localhost:11434/v1</code> for Ollama (requires compatible proxy for Live API).
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'persona' && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                            Voice Selection
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {['Kore', 'Puck', 'Fenrir', 'Charon', 'Aoede'].map((voice) => (
                                <button
                                    key={voice}
                                    onClick={() => setSettings({...settings, voiceName: voice})}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                                        settings.voiceName === voice 
                                        ? 'bg-white text-black border-white' 
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                    }`}
                                >
                                    <Mic size={14} /> {voice}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                            System Instruction (Prompt)
                        </label>
                        <textarea 
                            value={settings.systemInstruction}
                            onChange={(e) => setSettings({...settings, systemInstruction: e.target.value})}
                            placeholder="You are a helpful AI..."
                            className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono leading-relaxed placeholder:text-zinc-700 resize-none"
                        />
                        <div className="flex justify-end mt-2">
                             <button 
                                onClick={() => setSettings({...settings, systemInstruction: "You are a helpful, fast, and human-like AI assistant. You are cool and proactive."})}
                                className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-purple-400"
                             >
                                <RefreshCw size={10} /> Reset to Default
                             </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5"
                >
                    Cancel
                </button>
                <button 
                    onClick={() => onSave(settings)}
                    className="px-6 py-2 rounded-lg text-sm font-medium bg-white text-black hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <Save size={16} /> Save Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;