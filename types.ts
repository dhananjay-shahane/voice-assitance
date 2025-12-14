export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface Reminder {
  title: string;
  time: string;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  baseUrl: string;
  voiceName: string;
  systemInstruction: string;
  pythonBackendUrl: string; // New: For Python Proxy
}

export interface AssistantAction {
  type: 'music' | 'search' | 'info' | 'weather' | null;
  message: string | null;
  link?: string;
}

export interface MusicState {
  videoId?: string;
  query?: string;
  title?: string;
  isLoading?: boolean;
  error?: boolean;
}

export interface WeatherState {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string; // ISO string
  messages: Message[];
}

// Tool definitions for TypeScript
export interface ToolCallArgs {
  [key: string]: any;
}