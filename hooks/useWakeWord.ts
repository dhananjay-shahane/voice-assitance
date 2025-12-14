import { useEffect, useRef, useState } from 'react';

export const useWakeWord = (onWake: () => void, isConnected: boolean) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const resultsLength = event.results.length;
      const transcript = event.results[resultsLength - 1][0].transcript.toLowerCase().trim();
      
      console.log('Wake Word Detected:', transcript);

      if (transcript.includes('hello assistant') || 
          transcript.includes('wake up') || 
          transcript.includes('hey blurry') || 
          transcript.includes('hello blurry') ||
          transcript.includes('start listening')) {
        onWake();
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onWake]);

  // Manage start/stop based on connection state
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isConnected) {
      // If connected to Gemini, stop wake word listener to avoid conflicts
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {
        // ignore
      }
    } else {
      // If disconnected, start listening for wake word
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // ignore, might already be started
      }
    }
  }, [isConnected]);

  return { isListening };
};
