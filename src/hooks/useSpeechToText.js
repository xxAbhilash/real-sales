import { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const useSpeechToText = (onTranscriptReady, silenceThreshold = 2000) => {
  const [isListening, setIsListening] = useState(false);
  const { 
    transcript, 
    finalTranscript, 
    resetTranscript, 
    listening, 
    browserSupportsSpeechRecognition 
  } = useSpeechRecognition();
  
  const lastSpokenTime = useRef(null);
  const silenceTimerRef = useRef(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error('❌ Browser does not support speech recognition');
      alert('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
    }
  }, [browserSupportsSpeechRecognition]);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      console.error('❌ Cannot start listening - browser not supported');
      return;
    }

    console.log('🎤 Starting speech recognition (useSpeechToText hook)');
    console.log('🔄 Setting isListening = TRUE');
    
    SpeechRecognition.startListening({ 
      continuous: true, 
      language: 'en-US',
      interimResults: true
    });
    resetTranscript();
    lastSpokenTime.current = Date.now();
    hasProcessedRef.current = false;
    setIsListening(true);
    console.log('✅ isListening state set to TRUE - mic button should turn GREEN');
    clearSilenceTimer();
  };

  const stopListening = () => {
    console.log('⏹️ Stopping speech recognition (useSpeechToText hook)');
    console.log('🔄 Setting isListening = FALSE');
    
    SpeechRecognition.stopListening();
    resetTranscript();
    setIsListening(false);
    console.log('✅ isListening state set to FALSE - mic button should turn GREY');
    
    lastSpokenTime.current = null;
    hasProcessedRef.current = false;
    clearSilenceTimer();
  };

  // Update last spoken time whenever transcript changes (user is speaking)
  useEffect(() => {
    if (listening && transcript) {
      lastSpokenTime.current = Date.now();
      console.log('🗣️ Speech detected, updating last spoken time');
      
      // Clear any existing silence timer
      clearSilenceTimer();
      
      // Start a new silence timer
      silenceTimerRef.current = setTimeout(() => {
        console.log(`⏱️ ${silenceThreshold}ms of silence detected`);
        
        // Only process if we have a final transcript and haven't processed it yet
        if (finalTranscript && !hasProcessedRef.current) {
          console.log('✅ Processing final transcript after silence');
          hasProcessedRef.current = true;
          onTranscriptReady(finalTranscript);
          
          // Stop listening and reset after processing to prepare for next iteration
          console.log('🔄 Stopping and resetting for next iteration');
          SpeechRecognition.stopListening();
          setTimeout(() => {
            console.log('🔄 Setting isListening = FALSE (auto-stop after processing)');
            resetTranscript();
            setIsListening(false);
            console.log('✅ Hook auto-stopped - mic button should turn GREY');
            lastSpokenTime.current = null;
            hasProcessedRef.current = false;
          }, 100);
        }
      }, silenceThreshold);
    }
  }, [transcript, listening, silenceThreshold]);

  // Handle final transcript
  useEffect(() => {
    if (finalTranscript && listening && !hasProcessedRef.current) {
      console.log('📝 Final transcript received:', finalTranscript);
      
      // Wait a bit to see if more speech comes
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        if (!hasProcessedRef.current) {
          console.log('✅ Processing final transcript');
          hasProcessedRef.current = true;
          onTranscriptReady(finalTranscript);
          
          // Stop listening and reset after processing to prepare for next iteration
          console.log('🔄 Stopping and resetting for next iteration');
          SpeechRecognition.stopListening();
          setTimeout(() => {
            console.log('🔄 Setting isListening = FALSE (auto-stop after processing)');
            resetTranscript();
            setIsListening(false);
            console.log('✅ Hook auto-stopped - mic button should turn GREY');
            lastSpokenTime.current = null;
            hasProcessedRef.current = false;
          }, 100);
        }
      }, silenceThreshold);
    }
  }, [finalTranscript, listening, silenceThreshold]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up speech recognition');
      SpeechRecognition.stopListening();
      clearSilenceTimer();
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
};

export default useSpeechToText;

