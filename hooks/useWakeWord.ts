import { useEffect, useRef, useState } from 'react';

export const useWakeWord = (onWake: () => void, isConnected: boolean) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isConnectedRef = useRef(isConnected);
  const shouldListenRef = useRef(!isConnected);

  useEffect(() => {
    isConnectedRef.current = isConnected;
    shouldListenRef.current = !isConnected;
  }, [isConnected]);

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
      if (event.error === 'aborted') return;
      
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        console.warn('Microphone permission denied for wake word detection.');
      }
    };

    recognition.onend = () => {
      // Restart if we are supposed to be listening
      if (shouldListenRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // ignore
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    if (shouldListenRef.current) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {}
    }

    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onWake]);

  // Manage start/stop based on connection state
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isConnected) {
      shouldListenRef.current = false;
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {}
    } else {
      shouldListenRef.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {}
    }
  }, [isConnected]);

  return { isListening };
};
