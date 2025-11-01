import { useState, useEffect, useCallback, useRef } from 'react';

const useElevenLabsMultiContext = ({
  voiceId,
  modelId = 'eleven_flash_v2_5',
  apiKey,
  voiceSettings = {
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.0,
    use_speaker_boost: true,
  },
  inactivityTimeout = 20,
  onAudioStart,
  onAudioEnd,
  onContextComplete,
  onError,
  autoConnect = false,
  enableAudioVisualization = false,
}) => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingContext, setCurrentPlayingContext] = useState(null);
  const [activeContexts, setActiveContexts] = useState(new Map());

  // Refs
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isProcessingQueueRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const finalContextsRef = useRef(new Set()); // Track contexts that received is_final
  const contextTimeoutsRef = useRef(new Map()); // Track fallback timers per context

  // Audio visualization
  const [frequencyData, setFrequencyData] = useState(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Get API key from environment if not provided
  const elevenLabsApiKey = apiKey || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

  /**
   * Initialize Web Audio API context
   */
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      if (enableAudioVisualization) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    }

    // 🍎 iOS Fix: Resume AudioContext if it's suspended
    // iOS Safari requires explicit resume() call before audio can play
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        console.log('✅ AudioContext resumed (iOS compatibility)');
      } catch (error) {
        console.error('⚠️ Failed to resume AudioContext:', error);
      }
    }

    return audioContextRef.current;
  }, [enableAudioVisualization]);

  /**
   * Update frequency data for visualization
   */
  const updateFrequencyData = useCallback(() => {
    if (!analyserRef.current || !isPlaying) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    setFrequencyData(dataArray);

    animationFrameRef.current = requestAnimationFrame(updateFrequencyData);
  }, [isPlaying]);

  /**
   * Process audio queue and play chunks
   */
  const processAudioQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    let lastPlayedContextId = null;

    try {
      const audioContext = await initAudioContext();
      
      // 🍎 iOS Fix: Ensure AudioContext is running before playing audio
      // Check state again in case it was suspended between init and play
      if (audioContext.state === 'suspended') {
        console.log('⚠️ AudioContext suspended, resuming...');
        try {
          await audioContext.resume();
          console.log('✅ AudioContext resumed before playback');
        } catch (error) {
          console.error('❌ Failed to resume AudioContext:', error);
          throw new Error('AudioContext could not be resumed. User interaction may be required.');
        }
      }
      
      while (audioQueueRef.current.length > 0) {
        const item = audioQueueRef.current.shift();
        if (!item) continue;

        try {
          // Decode and play audio - create a copy to ensure ArrayBuffer type
          const arrayBuffer = item.audioData.buffer.slice(0);
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;

          if (enableAudioVisualization && analyserRef.current) {
            source.connect(analyserRef.current);
          } else {
            source.connect(audioContext.destination);
          }

          // Play audio
          // 🍎 iOS Fix: Verify context is running before starting playback
          if (audioContext.state !== 'running') {
            console.warn(`⚠️ AudioContext state is ${audioContext.state}, attempting resume...`);
            await audioContext.resume();
          }

          source.start(0);
          
          if (!isPlaying) {
            setIsPlaying(true);
            setCurrentPlayingContext(item.contextId);
            onAudioStart?.(item.contextId);

            if (enableAudioVisualization) {
              updateFrequencyData();
            }
          }

          // Track the last played context
          lastPlayedContextId = item.contextId;

          // Wait for audio to finish
          await new Promise((resolve) => {
            source.onended = () => resolve();
          });

        } catch (error) {
          console.error('Error playing audio chunk:', error);
          onError?.(error, item.contextId);
        }
      }

      // Audio queue is now empty
      setIsPlaying(false);
      if (currentPlayingContext) {
        onAudioEnd?.(currentPlayingContext);
        setCurrentPlayingContext(null);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // 🎯 CRITICAL: Check if this context received is_final
      // If so, ALL audio has been played, trigger onContextComplete
      if (lastPlayedContextId && finalContextsRef.current.has(lastPlayedContextId)) {
        console.log(`🎯 🎯 🎯 Context '${lastPlayedContextId}' - is_final received & ALL audio played!`);
        console.log(`✅ Triggering onContextComplete NOW (perfect timing for mic activation)`);
        
        // Clear any pending fallback timer for this context
        const timer = contextTimeoutsRef.current.get(lastPlayedContextId);
        if (timer) {
          clearTimeout(timer);
          contextTimeoutsRef.current.delete(lastPlayedContextId);
          console.log(`   🧹 Cleared fallback timer (is_final arrived properly)`);
        }
        
        // Remove from final contexts tracking
        finalContextsRef.current.delete(lastPlayedContextId);
        
        // NOW trigger context complete (will auto-start mic)
        onContextComplete?.(lastPlayedContextId);
      }

    } catch (error) {
      console.error('Error processing audio queue:', error);
      onError?.(error);
    } finally {
      isProcessingQueueRef.current = false;
    }
  }, [initAudioContext, isPlaying, currentPlayingContext, onAudioStart, onAudioEnd, onContextComplete, onError, enableAudioVisualization, updateFrequencyData]);

  /**
   * Connect to ElevenLabs Multi-Context WebSocket
   */
  const connect = useCallback(() => {
    if (!elevenLabsApiKey) {
      const error = new Error('ElevenLabs API key is required');
      console.error(error.message);
      onError?.(error);
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/multi-stream-input?model_id=${modelId}&inactivity_timeout=${inactivityTimeout}`;
      
      console.log('Connecting to ElevenLabs Multi-Context WebSocket...');
      const ws = new WebSocket(wsUrl);

      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        console.log('✅ Connected to ElevenLabs Multi-Context WebSocket');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Set API key header via first message
        ws.send(JSON.stringify({
          'xi-api-key': elevenLabsApiKey,
        }));
      };

      ws.onmessage = async (event) => {
        try {
          // Handle JSON messages (metadata)
          if (typeof event.data === 'string') {
            const data = JSON.parse(event.data);
            
            const contextId = data.contextId || data.context_id || 'default';

            if (data.error) {
              console.error('ElevenLabs error:', data.error);
              onError?.(new Error(data.error), contextId);
              return;
            }

            // Handle is_final message from ElevenLabs
            // This indicates NO MORE AUDIO will be sent for this context
            // BUT there may still be audio chunks in the queue playing
            if (data.is_final || data.isFinal) {
              console.log(`📥 📥 📥 Received is_final for context '${contextId}'`);
              console.log(`⚠️ Audio may still be playing - will trigger onContextComplete when queue empties`);
              
              // Mark context as final - will trigger onContextComplete when audio queue empties
              finalContextsRef.current.add(contextId);
              
              setActiveContexts((prev) => {
                const newMap = new Map(prev);
                const context = newMap.get(contextId);
                if (context) {
                  context.isComplete = true;
                  newMap.set(contextId, context);
                }
                return newMap;
              });

              // DO NOT call onContextComplete here!
              // It will be called in processAudioQueue when the last audio finishes playing
            }

            // Handle audio data in base64 (some responses)
            if (data.audio) {
              const audioData = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
              audioQueueRef.current.push({ audioData, contextId });
              processAudioQueue();
            }
          } 
          // Handle binary audio chunks
          else if (event.data instanceof ArrayBuffer) {
            const audioChunk = new Uint8Array(event.data);
            
            if (audioChunk.length > 44) { // Minimum valid audio size
              // Assuming the last active context, or default
              const contextId = currentPlayingContext || Array.from(activeContexts.keys())[0] || 'default';
              
              audioQueueRef.current.push({ 
                audioData: audioChunk, 
                contextId 
              });
              
              processAudioQueue();
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          onError?.(error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      onError?.(error);
    }
  }, [voiceId, modelId, inactivityTimeout, elevenLabsApiKey, onError, currentPlayingContext, activeContexts, processAudioQueue, onContextComplete]);

  /**
   * Send text to be synthesized in a specific context
   */
  const sendText = useCallback(
    (text, contextId, customVoiceSettings) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        onError?.(new Error('WebSocket is not connected'), contextId);
        return;
      }

      if (!text && text !== '') {
        console.warn('No text provided to synthesize');
        return;
      }

      const message = {
        text,
        context_id: contextId,
      };

      // Only send voice settings with first message of a context
      if (!activeContexts.has(contextId)) {
        message.voice_settings = customVoiceSettings || voiceSettings;
        
        // Mark context as active
        setActiveContexts((prev) => {
          const newMap = new Map(prev);
          newMap.set(contextId, {
            id: contextId,
            isActive: true,
            isComplete: false,
            audioQueue: [],
          });
          return newMap;
        });
      }

      wsRef.current.send(JSON.stringify(message));
      console.log(`📤 Sent text to context '${contextId}'`);
    },
    [activeContexts, voiceSettings, onError]
  );

  /**
   * Stream text chunks for Gemini streaming integration
   * This is perfect for streaming LLM responses word-by-word or sentence-by-sentence
   */
  const streamTextChunk = useCallback(
    (textChunk, contextId, isLastChunk = false) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        return;
      }

      const message = {
        text: textChunk,
        context_id: contextId,
      };

      // Add voice settings for first chunk in a new context
      if (!activeContexts.has(contextId)) {
        message.voice_settings = voiceSettings;
        
        setActiveContexts((prev) => {
          const newMap = new Map(prev);
          newMap.set(contextId, {
            id: contextId,
            isActive: true,
            isComplete: false,
            audioQueue: [],
          });
          return newMap;
        });
      }

      // Flush on last chunk or at sentence boundaries
      if (isLastChunk || textChunk.match(/[.!?]\s*$/)) {
        message.flush = true;
      }

      wsRef.current.send(JSON.stringify(message));
    },
    [activeContexts, voiceSettings]
  );

  /**
   * Flush a context to force generation of buffered audio
   */
  const flushContext = useCallback((contextId, isFinalFlush = false) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message = {
      context_id: contextId,
      flush: true,
    };

    wsRef.current.send(JSON.stringify(message));
    console.log(`🔄 Flushed context '${contextId}'${isFinalFlush ? ' (FINAL FLUSH)' : ''}`);
    
    // 🎯 CRITICAL: Set fallback timer if this is the final flush
    // If ElevenLabs doesn't send is_final within 5 seconds, force completion
    if (isFinalFlush) {
      console.log(`⏰ Setting 5-second fallback timer for context '${contextId}'`);
      console.log(`   This ensures mic auto-starts even if is_final doesn't arrive`);
      
      // Clear any existing timer for this context
      const existingTimer = contextTimeoutsRef.current.get(contextId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      const timer = setTimeout(() => {
        console.log(`⏰ ⏰ ⏰ FALLBACK TIMER FIRED for context '${contextId}' ⏰ ⏰ ⏰`);
        console.log(`⚠️ is_final didn't arrive within 5 seconds`);
        console.log(`📊 Audio queue length: ${audioQueueRef.current.length}`);
        console.log(`📊 Is processing: ${isProcessingQueueRef.current}`);
        
        // Only trigger if queue is empty (all audio played)
        if (audioQueueRef.current.length === 0 && !isProcessingQueueRef.current) {
          console.log(`✅ ✅ ✅ FALLBACK: Forcing onContextComplete for '${contextId}' ✅ ✅ ✅`);
          
          // Mark as final and trigger completion
          finalContextsRef.current.delete(contextId);
          contextTimeoutsRef.current.delete(contextId);
          onContextComplete?.(contextId);
        } else {
          console.log(`⚠️ Queue not empty, will wait for queue to finish`);
          // Re-check after processAudioQueue completes
          finalContextsRef.current.add(contextId);
        }
      }, 2000); // 5 second fallback
      
      contextTimeoutsRef.current.set(contextId, timer);
    }
  }, [onContextComplete]);

  /**
   * Close a specific context
   */
  const closeContext = useCallback((contextId) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected, cannot close context');
      return;
    }

    const message = {
      context_id: contextId,
      close_context: true,
    };

    wsRef.current.send(JSON.stringify(message));
    
    // Clear any pending timer for this context
    const timer = contextTimeoutsRef.current.get(contextId);
    if (timer) {
      clearTimeout(timer);
      contextTimeoutsRef.current.delete(contextId);
    }
    
    // Remove from final contexts tracking
    finalContextsRef.current.delete(contextId);
    
    setActiveContexts((prev) => {
      const newMap = new Map(prev);
      newMap.delete(contextId);
      return newMap;
    });

    console.log(`❌ Closed context '${contextId}'`);
  }, []);

  /**
   * Handle user interruption - close old context and start new one
   * This is crucial for conversational AI when user interrupts the agent
   */
  const handleInterruption = useCallback(
    (oldContextId, newContextId, newText) => {
      console.log(`🔄 Handling interruption: closing '${oldContextId}', starting '${newContextId}'`);
      
      // Close the interrupted context
      closeContext(oldContextId);

      // Clear audio queue for better responsiveness
      audioQueueRef.current = [];

      // Start new context with new response
      sendText(newText, newContextId);
    },
    [closeContext, sendText]
  );

  /**
   * Keep a context alive by sending empty text (resets 20s timeout)
   */
  const keepContextAlive = useCallback((contextId) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message = {
      context_id: contextId,
      text: '',
    };

    wsRef.current.send(JSON.stringify(message));
    console.log(`💓 Kept context '${contextId}' alive`);
  }, []);

  /**
   * Close all contexts and disconnect
   */
  const disconnect = useCallback(() => {
    console.log('Disconnecting from ElevenLabs WebSocket...');

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Close socket gracefully
      const message = {
        close_socket: true,
      };
      
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending close message:', error);
      }

      wsRef.current.close(1000, 'Normal closure');
      wsRef.current = null;
    }

    // Clean up audio
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }

    setIsConnected(false);
    setIsPlaying(false);
    setCurrentPlayingContext(null);
    setActiveContexts(new Map());
    audioQueueRef.current = [];
    isProcessingQueueRef.current = false;
    finalContextsRef.current.clear(); // Clear final contexts tracking
    
    // Clear all context timers
    contextTimeoutsRef.current.forEach((timer) => clearTimeout(timer));
    contextTimeoutsRef.current.clear();
  }, []);

  /**
   * Stop all audio playback immediately
   */
  const stopAllAudio = useCallback(() => {
    audioQueueRef.current = [];
    setIsPlaying(false);
    setCurrentPlayingContext(null);
    finalContextsRef.current.clear(); // Clear final contexts when stopping audio
    
    // Clear all context timers
    contextTimeoutsRef.current.forEach((timer) => clearTimeout(timer));
    contextTimeoutsRef.current.clear();
    
    if (audioContextRef.current?.state === 'running') {
      audioContextRef.current.suspend();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    console.log('⏹️ Stopped all audio playback');
  }, []);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, []); // Only on mount/unmount

  /**
   * Start frequency data updates when playing
   */
  useEffect(() => {
    if (isPlaying && enableAudioVisualization && !animationFrameRef.current) {
      updateFrequencyData();
    }
  }, [isPlaying, enableAudioVisualization, updateFrequencyData]);

  return {
    // Connection state
    isConnected,
    isPlaying,
    currentPlayingContext,
    activeContextIds: Array.from(activeContexts.keys()),
    activeContextsCount: activeContexts.size,

    // Audio visualization
    frequencyData,

    // Connection methods
    connect,
    disconnect,

    // Text-to-speech methods
    sendText,
    streamTextChunk, // Perfect for Gemini streaming!
    flushContext,

    // Context management
    closeContext,
    handleInterruption, // Essential for conversational AI
    keepContextAlive,

    // Playback control
    stopAllAudio,
  };
};

export default useElevenLabsMultiContext;

