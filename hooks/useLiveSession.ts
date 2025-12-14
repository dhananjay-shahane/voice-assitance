import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION, tools } from '../constants';
import { createPcmBlob, decodeAudioData, base64ToUint8Array, downsampleBuffer } from '../utils/audio';
import { ConnectionState, Message, AppSettings } from '../types';

interface UseLiveSessionProps {
  onToolCall?: (name: string, args: any) => Promise<any>;
  settings: AppSettings;
}

export const useLiveSession = ({ onToolCall, settings }: UseLiveSessionProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [transcripts, setTranscripts] = useState<Message[]>([]);
  const [volume, setVolume] = useState<number>(0);
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Use Ref for onToolCall to avoid stale closures
  const onToolCallRef = useRef(onToolCall);
  useEffect(() => {
    onToolCallRef.current = onToolCall;
  }, [onToolCall]);

  const currentInputRef = useRef<string>('');
  const currentOutputRef = useRef<string>('');
  const isUserSpeakingRef = useRef<boolean>(false);

  const addTranscript = useCallback((role: 'user' | 'assistant' | 'system', text: string, isFinal: boolean = true) => {
    setTranscripts(prev => {
      if (!isFinal && prev.length > 0 && prev[prev.length - 1].role === role && (Date.now() - prev[prev.length - 1].timestamp.getTime() < 5000)) {
         const newArr = [...prev];
         newArr[newArr.length - 1] = { ...newArr[newArr.length - 1], text };
         return newArr;
      }
      return [...prev, { id: Date.now().toString() + Math.random(), role, text, timestamp: new Date() }];
    });
  }, []);

  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
  }, []);

  const cleanupAudio = useCallback(async () => {
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
        inputSourceRef.current = null;
    }
    if (inputContextRef.current) {
        try { await inputContextRef.current.close(); } catch(e) {}
        inputContextRef.current = null;
    }
    if (outputContextRef.current) {
        try { await outputContextRef.current.close(); } catch(e) {}
        outputContextRef.current = null;
    }
    audioSourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) {}
    });
    audioSourcesRef.current.clear();
    sessionPromiseRef.current = null;
    setVolume(0);
    currentInputRef.current = '';
    currentOutputRef.current = '';
  }, []);

  const connect = useCallback(async () => {
    const activeApiKey = settings.apiKey || process.env.API_KEY;

    if (!activeApiKey) {
      addTranscript('system', 'Error: API Key is missing. Please check settings.');
      setConnectionState(ConnectionState.ERROR);
      return;
    }

    if (connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING) {
        return;
    }

    try {
      setConnectionState(ConnectionState.CONNECTING);
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();

      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;

      const analyser = outputCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputCtx.createMediaStreamSource(stream);
      inputSourceRef.current = source;

      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = scriptProcessor;

      const clientOptions: any = { apiKey: activeApiKey };
      if (settings.baseUrl) {
          clientOptions.baseUrl = settings.baseUrl; 
      }

      const ai = new GoogleGenAI(clientOptions);
      
      // Determine System Instruction
      const instructions = settings.systemInstruction?.trim() 
        ? settings.systemInstruction 
        : SYSTEM_INSTRUCTION;

      const sessionPromise = ai.live.connect({
        model: settings.model || 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: instructions }] },
          tools: [{ functionDeclarations: tools }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.voiceName || 'Kore' } }
          },
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log('Session connected');
            setConnectionState(ConnectionState.CONNECTED);
            addTranscript('system', 'Voice Assistant Connected.');
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!sessionPromiseRef.current) return;

              const inputData = e.inputBuffer.getChannelData(0);
              
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(v => (v * 0.8) + (rms * 2)); 

              const downsampledData = downsampleBuffer(inputData, inputCtx.sampleRate, 16000);
              const pcmBlob = createPcmBlob(downsampledData, 16000);
              
              sessionPromiseRef.current.then(session => {
                  try {
                    session.sendRealtimeInput({ media: pcmBlob });
                  } catch (e) {
                  }
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputContextRef.current;
              if (ctx && ctx.state !== 'closed') {
                 nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                 const audioBuffer = await decodeAudioData(base64ToUint8Array(audioData), ctx, 24000, 1);
                 const source = ctx.createBufferSource();
                 source.buffer = audioBuffer;
                 if (analyserRef.current) {
                    source.connect(analyserRef.current);
                    analyserRef.current.connect(ctx.destination);
                 } else {
                    source.connect(ctx.destination);
                 }
                 source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                 source.start(nextStartTimeRef.current);
                 audioSourcesRef.current.add(source);
                 nextStartTimeRef.current += audioBuffer.duration;
              }
            }

            const inputTranscript = message.serverContent?.inputTranscription?.text;
            if (inputTranscript) {
               currentInputRef.current += inputTranscript;
               addTranscript('user', currentInputRef.current, false);
            }

            const outputTranscript = message.serverContent?.outputTranscription?.text;
            if (outputTranscript) {
               currentOutputRef.current += outputTranscript;
               addTranscript('assistant', currentOutputRef.current, false);
            }

            if (message.serverContent?.turnComplete) {
               isUserSpeakingRef.current = !isUserSpeakingRef.current;
               if (currentInputRef.current) {
                   addTranscript('user', currentInputRef.current, true);
                   currentInputRef.current = '';
               }
               if (currentOutputRef.current) {
                   addTranscript('assistant', currentOutputRef.current, true);
                   currentOutputRef.current = '';
               }
            }
            
            if (message.toolCall) {
                addTranscript('system', 'Processing request...', true);
                for (const fc of message.toolCall.functionCalls) {
                    let result: any = { result: 'Success' };
                    if (onToolCallRef.current) {
                       try {
                           result = await onToolCallRef.current(fc.name, fc.args);
                           addTranscript('system', `Executed: ${fc.name}`, true);
                       } catch (e) {
                           result = { error: 'Failed' };
                       }
                    }
                    if (sessionPromiseRef.current) {
                        sessionPromiseRef.current.then(session => {
                            session.sendToolResponse({
                                functionResponses: {
                                    id: fc.id,
                                    name: fc.name,
                                    response: result
                                }
                            });
                        });
                    }
                }
            }
          },
          onclose: () => {
            setConnectionState(ConnectionState.DISCONNECTED);
            cleanupAudio();
          },
          onerror: (err) => {
            console.error("Live Session Error:", err instanceof Error ? err.message : "Unknown error");
            setConnectionState(ConnectionState.ERROR);
            cleanupAudio();
          }
        }
      });
      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error(error);
      setConnectionState(ConnectionState.ERROR);
      cleanupAudio();
    }
  }, [addTranscript, connectionState, cleanupAudio, settings]);

  const disconnect = useCallback(async () => {
    if (sessionPromiseRef.current) {
       const session = await sessionPromiseRef.current;
       try { (session as any).close(); } catch (e) {}
    }
    await cleanupAudio();
    setConnectionState(ConnectionState.DISCONNECTED);
  }, [cleanupAudio]);

  useEffect(() => {
    let animationFrame: number;
    const updateOutputVolume = () => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            const norm = avg / 255; 
            if (norm > 0.01) {
                setVolume(prev => (prev * 0.5) + (norm * 0.5));
            }
        }
        animationFrame = requestAnimationFrame(updateOutputVolume);
    };
    updateOutputVolume();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return { connect, disconnect, clearTranscripts, connectionState, transcripts, volume };
};