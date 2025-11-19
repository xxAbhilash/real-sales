import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import whiteLogoNoBackground from "../../../public/assets/images/RealSales-official-logo/For Web/png/White logo - no background.png";
import menueIcon from "../../../public/assets/icons/menueIcon.svg";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SendMessage from "../../../public/assets/icons/sendMessage";
import CallEndSharpIcon from "@mui/icons-material/CallEndSharp";
import useElevenLabsMultiContext from "../../hooks/useElevenLabsMultiContext";
import useSpeechToText from "../../hooks/useSpeechToText";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControlLabel,
  Modal,
  Popover,
  Radio,
  styled,
  Switch,
  Tooltip,
  tooltipClasses,
  Typography,
  useMediaQuery,
} from "@mui/material";
import persona_plant from "../../../public/assets/images/RealSales-user-images/persona-plant.png";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import cil_audio from "../../../public/assets/icons/cil_audio.svg";
import BookAdemo from "../../common/bookAdemo";
import ArrowRight from "../../../public/assets/icons/arrowRight";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import callVibration from "../../../public/assets/images/RealSales-abstracts/call-vibration.png";
import personaExtra from "../../../public/assets/images/RealSales-user-images/persona-extra.png";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ideaIcon from "../../../public/assets/icons/ideaIcon.svg";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { EndChatValue } from "../../redux/OpenModal";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MicOffSharpIcon from "@mui/icons-material/MicOffSharp";
import Link from "next/link";
import { apis } from "../../utils/apis";
import { useApi } from "../../hooks/useApi";
import axiosInstance from "../../utils/axiosInstance";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import soundWave from "../../../public/assets/gifs/soundWave.gif";
import soundWaveAi from "../../../public/assets/gifs/soundWaveAi.gif";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { AddSummary } from "../../redux/SummaryReducer";
import { showToast } from "../../utils/toastConfig";
import DeleteIcon from "@mui/icons-material/Delete";
import { PDFDocument } from "pdf-lib";
import { useLogout } from "../../hooks/useLogout";
import { AddAuth, AddUser } from "../../redux/AuthReducer";
import LogoutIcon from "@mui/icons-material/Logout";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import CommonModal from "../../common/commonModal";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Update the SpeakingIndicator component
const SpeakingIndicator = ({
  isActive,
  color = "#26AD35",
  transcript = "",
  isAi = false,
}) => {
  const [heights, setHeights] = useState([40, 60, 80, 100, 80, 60, 40]);
  const [currentWord, setCurrentWord] = useState("");
  const wordInterval = useRef(null);
  const prevHeightsRef = useRef(heights);

  useEffect(() => {
    if (isActive && transcript) {
      if (isAi) {
        // For AI, simulate word-by-word animation
        const words = transcript.split(" ");
        let currentIndex = 0;

        if (wordInterval.current) {
          clearInterval(wordInterval.current);
        }

        wordInterval.current = setInterval(() => {
          if (currentIndex < words.length) {
            setCurrentWord(words[currentIndex]);
            // Generate heights based on current word with smooth transitions
            const newHeights = heights.map((_, index) => {
              const wordLength = words[currentIndex].length;
              const baseHeight = (wordLength * 10) % 60;
              const randomFactor = Math.random() * 30; // Reduced random factor for smoother transitions
              const targetHeight = Math.min(
                100,
                Math.max(20, baseHeight + randomFactor)
              );
              // Smooth transition from previous height
              const prevHeight = prevHeightsRef.current[index];
              return Math.round(prevHeight + (targetHeight - prevHeight) * 0.3);
            });
            prevHeightsRef.current = newHeights;
            setHeights(newHeights);
            currentIndex++;
          } else {
            clearInterval(wordInterval.current);
            setCurrentWord("");
          }
        }, 150); // Faster interval for smoother animation
      } else {
        // For user, use transcript length with smooth transitions
        const newHeights = heights.map((prevHeight, index) => {
          const baseHeight = transcript.length % 60;
          const randomFactor = Math.random() * 30; // Reduced random factor
          const targetHeight = Math.min(
            100,
            Math.max(20, baseHeight + randomFactor)
          );
          // Smooth transition from previous height
          return Math.round(prevHeight + (targetHeight - prevHeight) * 0.3);
        });
        prevHeightsRef.current = newHeights;
        setHeights(newHeights);
      }
    }

    return () => {
      if (wordInterval.current) {
        clearInterval(wordInterval.current);
      }
    };
  }, [transcript, isActive, isAi]);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-[2px] h-6">
        <div className="flex items-end gap-[2px] h-full">
          {isActive && transcript ? (
            // Show animated bars when active and has transcript
            heights.map((height, index) => (
              <div
                key={index}
                className="w-[2px] rounded-full"
                style={{
                  height: `${height}%`,
                  transform: "scaleY(1)",
                  transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                  backgroundColor: color,
                  opacity: 0.8 + (height / 100) * 0.2, // Dynamic opacity based on height
                }}
              />
            ))
          ) : (
            // Show single line when inactive or no transcript
            <div
              className="w-[2px] rounded-full"
              style={{
                height: "20%",
                transform: "scaleY(1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor: color,
                opacity: 0.5,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Add this style block at the top of your file, after the imports
const styles = `
@keyframes wave {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}
`;

const Chat = ({ slug, children }) => {
  const { Post, Get } = useApi();
  const { chat_chat, coaching, documents_upload, sessions, auth_me } = apis;
  const dispatch = useDispatch();
  const router = useRouter();

  const token = useSelector((state) => state.auth.auth);
  const user = useSelector((state) => state?.auth?.user);
  const summary = useSelector((state) => state?.summary?.summary);

  let capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const [checked, setChecked] = useState(false);
  const [openAnswer, setOpenAnswer] = useState(0);
  const [micUser, setMicUser] = useState(true);
  const [micAi, setMicAi] = useState(true);
  const [isVolClicked, setIsVolClicked] = useState(false);
  const [transcriptDummy, setTranscriptDummy] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessagesView, setChatMessagesView] = useState([]);
  const [triggerSenChat, setTriggerSenChat] = useState(false);
  const [resChat, setResChat] = useState([]);
  const [resChatView, setResChatView] = useState([]);
  const [session_id, setSession_id] = useState("");
  const containerRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true); // Auto-start mic after AI speaks (default: true)
  const isAutoModeRef = useRef(true); // Ref to avoid stale closure in callbacks
  const [personaData, setPersonaData] = useState({});
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [tour, setTour] = useState(false);
  const [oneLineChatText, setOneLineChatText] = useState("");
  const [coachingMessage, setCoachingMessage] = useState("");
  const [addDocText, setAddDocText] = useState({});
  const [addDocTextAll, setAddDocTextAll] = useState([]);
  const [coachingAround, setCoachingAround] = useState(false);
  const [coachingData, setCoachingData] = useState([]);
  const [coachingAccept, setCoachingAccept] = useState([]);
  const [showCoachingData, setShowCoachingData] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isChatPosting, setIsChatPosting] = useState(false);
  const [upgrade, setUpgrade] = useState(true);
  const [audioPrimed, setAudioPrimed] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [fileError, setFileError] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [personaDetails, setPersonaDetails] = useState(null);
  const [viewDoc, setViewDoc] = useState(false);
  const [width, setWidth] = useState(1366);
  const recentTranscriptsRef = useRef([]); // Keep last 5 transcripts with timestamps
  const currentContextIdRef = useRef(null); // Track current context for ElevenLabs
  const lastAddedTranscriptRef = useRef(""); // Prevent duplicate transcripts
  const lastAddedTimeRef = useRef(0); // Timestamp of last added transcript
  const pendingTranscriptsRef = useRef([]); // Queue for transcripts to be added

  // Callback function for when transcript is ready (after silence detection)
  const handleTranscriptReady = (finalTranscript) => {
    console.log("📝 Final transcript received from hook:", finalTranscript);
    console.log("🎤 Hook has automatically stopped listening");

    if (!finalTranscript || !finalTranscript.trim()) {
      console.log("⚠️ Empty transcript, ignoring");
      return;
    }

    const trimmedTranscript = finalTranscript.trim();
    const currentTime = Date.now();

    // Advanced duplicate prevention system (only within last 10 seconds)
    const recentDuplicates = recentTranscriptsRef.current.filter(
      (entry) => currentTime - entry.timestamp < 10000 // 10 seconds window
    );

    const isDuplicate = recentDuplicates.some(
      (entry) =>
        entry.text === trimmedTranscript ||
        trimmedTranscript.includes(entry.text) ||
        entry.text.includes(trimmedTranscript)
    );

    if (isDuplicate) {
      console.log("⚠️ Duplicate transcript detected (within 10s window), ignoring:", trimmedTranscript);
      return;
    }

    // Check against last added transcript within 3 seconds (immediate duplicate check)
    if (
      lastAddedTranscriptRef.current === trimmedTranscript &&
      currentTime - lastAddedTimeRef.current < 2000
    ) {
      console.log("⚠️ Same as last transcript (within 3s), ignoring");
      return;
    }

    // Add to history (keep only last 5 transcripts with timestamps)
    recentTranscriptsRef.current = [
      ...recentTranscriptsRef.current.slice(-4),
      { text: trimmedTranscript, timestamp: currentTime },
    ];
    lastAddedTranscriptRef.current = trimmedTranscript;
    lastAddedTimeRef.current = currentTime;

    console.log("✅ Adding valid transcript to chat:", trimmedTranscript);
    console.log("💡 Ready for next iteration - click mic to speak again (or wait for auto-mode)");

    // Add to chat messages
    setChatMessages((prev) => {
      console.log("📊 Current chatMessages before adding:", prev.length);
      const updated = [
        ...prev,
        {
          text: trimmedTranscript,
          isUser: true,
          timestamp: new Date().toISOString(),
        },
      ];
      console.log("📊 Updated chatMessages after adding:", updated.length);
      return updated;
    });

    setChatMessagesView((prev) => [
      {
        text: trimmedTranscript,
        isUser: true,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    // Auto-send after transcript is ready
    // Trigger send immediately - React will batch state updates efficiently
    console.log("🚀 Triggering chat send immediately after transcript ready");
    setTriggerSenChat(true);
  };

  // Initialize Speech-to-Text hook with 5-second silence threshold
  const {
    transcript,
    isListening,
    startListening: startSpeechRecognition,
    stopListening: stopSpeechRecognition,
  } = useSpeechToText(handleTranscriptReady, 2000);

  // Keep ref in sync with state to avoid stale closures
  useEffect(() => {
    isAutoModeRef.current = isAutoMode;
    console.log(`🔄 Auto-mode ref updated to: ${isAutoMode}`);
  }, [isAutoMode]);

  // Log when isListening changes (to debug top mic button)
  useEffect(() => {
    console.log(`🎤 isListening state changed to: ${isListening}`);
    console.log(`🔘 Top mic button should be: ${isListening ? 'GREEN' : 'GREY'}`);
  }, [isListening]);

  // Initialize ElevenLabs Multi-Context WebSocket hook
  const {
    isConnected: isElevenLabsConnected,
    isPlaying: isElevenLabsPlaying,
    connect: connectElevenLabs,
    disconnect: disconnectElevenLabs,
    sendText: sendTextToElevenLabs,
    streamTextChunk,
    flushContext,
    closeContext: closeElevenLabsContext,
    stopAllAudio: stopElevenLabsAudio,
  } = useElevenLabsMultiContext({
    voiceId: personaData?.voice_id || "21m00Tcm4TlvDq8ikWAM", // Default voice if not set
    modelId: "eleven_flash_v2_5", // Fast, low-latency model
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
    voiceSettings: {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.0,
      use_speaker_boost: true,
    },
    inactivityTimeout: 30, // 30 seconds timeout
    onAudioStart: (contextId) => {
      console.log(`🎵 ElevenLabs audio started for context: ${contextId}`);
      setIsAiSpeaking(true);
      setIsSpeaking(true);
      setIsVolClicked(true); // Ensure volume is considered "on"
    },
      onAudioEnd: (contextId) => {
        console.log(`⏸️ Audio chunk ended for context: ${contextId} (may be between chunks)`);
        // Update visual indicators but DON'T auto-start mic here
        // because this fires between audio chunks, not just at the end
        setIsAiSpeaking(false);
        setIsSpeaking(false);
        
        // DO NOT auto-start mic here - it will be handled in onContextComplete
        console.log("⏸️ Waiting for context completion before auto-starting mic...");
      },
      onContextComplete: (contextId) => {
        console.log(`✅ ✅ ✅ ElevenLabs ALL AUDIO COMPLETE for context: ${contextId} ✅ ✅ ✅`);
        console.log(`📊 Context complete - ALL chunks played | isListening: ${isListening}, isAutoMode: ${isAutoModeRef.current}`);
        
        // Ensure speaking state is reset when context completes
        setIsAiSpeaking(false);
        setIsSpeaking(false);
        setIsAiThinking(false);
        
        // THIS IS THE ONLY PLACE we auto-start the mic
        // Because onContextComplete fires ONCE after ALL audio chunks are done
        if (isAutoModeRef.current) {
          console.log("🎤 Auto-mode ENABLED - Starting mic NOW (all audio complete)");
          
          // Use requestAnimationFrame for immediate, smooth activation
          requestAnimationFrame(() => {
            if (isAutoModeRef.current && !isListening) {
              console.log("🎤 🎤 🎤 ACTIVATING MICROPHONE IMMEDIATELY! 🎤 🎤 🎤");
              try {
                startSpeechRecognition();
                console.log("✅ ✅ ✅ Microphone activated - ready to listen!");
              } catch (error) {
                console.error("❌ Error starting microphone:", error);
              }
            } else if (isListening) {
              console.log("⚠️ Mic already listening, skipping");
            } else {
              console.log("⏸️ Auto-mode disabled, manual control");
            }
          });
        } else {
          console.log("⏸️ Auto-mode DISABLED - click mic to respond");
        }
      },
    onError: (error, contextId) => {
      console.error(`❌ ElevenLabs error in context ${contextId || 'unknown'}:`, error);
      setIsAiThinking(false);
      setIsAiSpeaking(false);
    },
    autoConnect: false, // Manual connection control
    enableAudioVisualization: false,
  });

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (addDocText?.summary) {
      setAddDocTextAll((pre) => [
        ...pre,
        { filename: addDocText?.filename, summary: addDocText?.summary },
      ]);
    }
  }, [addDocText]);

  useEffect(() => {
    if (addDocTextAll?.length) {
      localStorage.setItem("addDocTextAll", JSON.stringify(addDocTextAll));
    } else {
      let data = localStorage.getItem("addDocTextAll");
      let parseData = JSON.parse(data);
      if (data) {
        setAddDocTextAll(parseData);
      }
    }
  }, [addDocTextAll]);

  console.log(personaData, "personaData");
  console.log(addDocTextAll, "addDocTextAll");

  const handleClickPopOver = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopOver = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popOverid = open ? "simple-popover" : undefined;

  const handleClickPopOverPersona = (event) => {
    setPersonaDetails(event.currentTarget);
  };

  const handleClosePopOverPersona = () => {
    setPersonaDetails(null);
  };

  const openpersonaDetails = Boolean(personaDetails);
  const idPersona = openpersonaDetails ? "simple-popper" : undefined;

  console.log(coachingAccept, coachingData, "coachingAccept");
  useEffect(() => {
    setTour(true);
  }, []);

  useEffect(() => {
    setAddDocText(summary);
  }, [summary?.summary]);

  console.log(addDocText, "addDocText");

  // Add these new refs
  const isProcessingRef = useRef(false);
  const lastProcessedTextRef = useRef("");

  // Sync interim transcript to transcriptDummy for real-time display
  useEffect(() => {
    if (transcript && isListening) {
      setTranscriptDummy(transcript);
    } else {
      setTranscriptDummy("");
    }
  }, [transcript, isListening]);

  const startCoaching = async (id) => {
    try {
      let data = await Get(`${coaching}${id}`);
      if (data?.session_id) {
        setCoachingMessage(data?.message);
        setCoachingData((pre) => [
          { id: `${coachingData?.length + 1}`, ...data },
          ...pre,
        ]);
        setCoachingAround(false);
        setCoachingAround(false);
        console.log(data, "session_data__");
      }
    } catch (error) {
      console.log(error, "__error");
    } finally {
      setCoachingAround(false);
      setCoachingAround(false);
    }
  };

  // const stopCoaching = async (id) => {
  //   try {
  //     let data = await Post(`${coaching}stop/${id}`);
  //     if (data?.session_id) {
  //       console.log(data, "session_data__");
  //     }
  //   } catch (error) {
  //     console.log(error, "__error");
  //   }
  // };

  // Function to fetch persona data from session ID
  const fetchPersonaDataFromSession = useCallback(async (sessionId) => {
    // Store session_id in localStorage first (ensure it's there)
    if (sessionId) {
      localStorage.setItem("session_id", sessionId);
      console.log("✅ Session ID stored in localStorage:", sessionId);
    }
    
    // Use axiosInstance directly to avoid error toasts from useApi hook
    // This allows us to handle 404 errors gracefully without showing error messages
    try {
      console.log("🔍 Attempting to fetch session data:", sessionId);
      
      // Try the primary endpoint format
      const endpoint = `${sessions}${sessionId}`;
      console.log(`🔍 Trying endpoint: ${endpoint}`);
      
      // Use axiosInstance directly to avoid automatic error toasts
      const response = await axiosInstance.get(endpoint);
      const sessionData = response?.data;
      
      if (!sessionData) {
        console.log("⚠️ No session data returned, using localStorage data");
        return null;
      }
      
      console.log("📦 Full session data received:", sessionData);
      
      // Extract and store mode_id
      if (sessionData?.mode_id) {
        localStorage.setItem("mode_id", sessionData.mode_id);
        console.log("✅ Mode ID stored in localStorage:", sessionData.mode_id);
      } else if (sessionData?.mode?.mode_id) {
        localStorage.setItem("mode_id", sessionData.mode.mode_id);
        console.log("✅ Mode ID stored in localStorage (nested):", sessionData.mode.mode_id);
      }
      
      // Extract and store persona data
      let personaDataToStore = null;
      
      if (sessionData?.persona) {
        console.log("✅ Persona data fetched from session:", sessionData.persona);
        personaDataToStore = sessionData.persona;
      } else if (sessionData?.persona_data) {
        console.log("✅ Persona data fetched from session (nested):", sessionData.persona_data);
        personaDataToStore = sessionData.persona_data;
      }
      
      if (personaDataToStore) {
        // Check if voice_id exists in localStorage (from URL) and add it to persona_data if not present
        const voiceIdFromStorage = localStorage.getItem("voice_id");
        if (voiceIdFromStorage && !personaDataToStore.voice_id) {
          personaDataToStore.voice_id = voiceIdFromStorage;
          console.log("✅ Voice ID from localStorage added to persona_data:", voiceIdFromStorage);
        }
        
        // Save persona data to localStorage
        localStorage.setItem("persona_data", JSON.stringify(personaDataToStore));
        localStorage.setItem("persona_id", personaDataToStore?.persona_id || "");
        
        // Store voice_id separately if present
        if (personaDataToStore?.voice_id) {
          localStorage.setItem("voice_id", personaDataToStore.voice_id);
          console.log("✅ Voice ID stored in localStorage:", personaDataToStore.voice_id);
        }
        
        console.log("✅ Persona data stored in localStorage");
        
        // Set persona data in state
        setPersonaData(personaDataToStore);
        return personaDataToStore;
      } else {
        console.log("⚠️ No persona data found in session response");
        return null;
      }
    } catch (error) {
      // Handle 404 and other errors gracefully - don't crash the app
      // Using axiosInstance directly means no error toast will be shown
      if (error?.response?.status === 404) {
        console.log("⚠️ Session endpoint not found (404) - this is expected if endpoint doesn't exist");
        console.log("📝 Will use existing localStorage data for persona and mode_id");
      } else {
        console.warn("⚠️ Error fetching session data (non-404):", error?.response?.status || error?.message);
      }
      // Return null to indicate we should use localStorage data
      return null;
    }
  }, [sessions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if session_id, persona_data, token, and voice_id are coming from URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const urlSessionId = urlParams.get('session_id');
      const urlPersonaData = urlParams.get('persona_data');
      const urlToken = urlParams.get('token') || urlParams.get('bearer_token') || urlParams.get('auth_token');
      const urlVoiceId = urlParams.get('voice_id');
      
      let sessionId;
      let shouldFetchFromAPI = false;
      let personaDataFromURL = null;
      
      // If voice_id is in URL, save it to localStorage immediately
      if (urlVoiceId) {
        console.log("📥 Voice ID found in URL, saving to localStorage:", urlVoiceId);
        localStorage.setItem("voice_id", urlVoiceId);
        console.log("✅ Voice ID stored in localStorage");
      }
      
      // If token is in URL, save it to localStorage and Redux state immediately
      if (urlToken) {
        console.log("📥 Bearer token found in URL, saving to localStorage and Redux");
        localStorage.setItem("token", urlToken);
        dispatch(AddAuth(urlToken)); // Update Redux state
        console.log("✅ Token stored in localStorage and Redux state");
        
        // Fetch user data using the token
        const fetchUserData = async () => {
          try {
            console.log("🔍 Fetching user data with token from URL");
            const userData = await Get(auth_me);
            if (userData) {
              console.log("✅ User data fetched successfully:", userData);
              dispatch(AddUser(userData)); // Update Redux state with user data
              
              // Also store user_id in localStorage if available
              if (userData?.user_id) {
                localStorage.setItem("user", userData.user_id);
                console.log("✅ User ID stored in localStorage:", userData.user_id);
              }
            }
          } catch (error) {
            console.error("❌ Error fetching user data:", error);
            // If token is invalid, remove it
            if (error?.response?.status === 401 || error?.response?.status === 403) {
              console.log("⚠️ Invalid token, removing from storage");
              localStorage.removeItem("token");
              dispatch(AddAuth(""));
            }
          }
        };
        
        // Fetch user data asynchronously
        fetchUserData();
      }
      
      // If persona_data is in URL, decode and parse it first
      if (urlPersonaData) {
        try {
          // Decode URL-encoded JSON string
          const decodedPersonaData = decodeURIComponent(urlPersonaData);
          personaDataFromURL = JSON.parse(decodedPersonaData);
          console.log("📥 Persona data found in URL, parsed successfully:", personaDataFromURL);
          
          // If voice_id is in URL, add it to persona_data if not already present
          if (urlVoiceId && !personaDataFromURL.voice_id) {
            personaDataFromURL.voice_id = urlVoiceId;
            console.log("✅ Voice ID added to persona_data from URL:", urlVoiceId);
          }
          
          // Store persona data in localStorage immediately
          localStorage.setItem("persona_data", JSON.stringify(personaDataFromURL));
          if (personaDataFromURL?.persona_id) {
            localStorage.setItem("persona_id", personaDataFromURL.persona_id);
          }
          
          // Extract and store voice_id if present in persona_data
          if (personaDataFromURL?.voice_id) {
            localStorage.setItem("voice_id", personaDataFromURL.voice_id);
            console.log("✅ Voice ID stored from URL persona_data:", personaDataFromURL.voice_id);
          }
          
          // Extract and store mode_id if present in persona_data
          if (personaDataFromURL?.mode_id) {
            localStorage.setItem("mode_id", personaDataFromURL.mode_id);
            console.log("✅ Mode ID stored from URL persona_data:", personaDataFromURL.mode_id);
          }
          
          // Set persona data in state
          setPersonaData(personaDataFromURL);
        } catch (e) {
          console.error("❌ Error parsing persona_data from URL:", e);
        }
      } else if (urlVoiceId) {
        // If voice_id is in URL but persona_data is not, try to get existing persona_data and update it
        let existingPersonaData = localStorage.getItem("persona_data");
        if (existingPersonaData) {
          try {
            let parsedPersonaData = JSON.parse(existingPersonaData);
            parsedPersonaData.voice_id = urlVoiceId;
            localStorage.setItem("persona_data", JSON.stringify(parsedPersonaData));
            localStorage.setItem("voice_id", urlVoiceId);
            setPersonaData(parsedPersonaData);
            console.log("✅ Voice ID added to existing persona_data from URL:", urlVoiceId);
          } catch (e) {
            console.error("❌ Error updating existing persona_data with voice_id:", e);
          }
        }
      }
      
      // If session_id is in URL, save it to localStorage immediately
      if (urlSessionId) {
        console.log("📥 Session ID found in URL, saving to localStorage:", urlSessionId);
        localStorage.setItem("session_id", urlSessionId);
        sessionId = urlSessionId;
        
        // Only fetch from API if persona_data was not in URL
        // If persona_data is in URL, we already have it, but still fetch to get mode_id if missing
        if (!personaDataFromURL) {
          shouldFetchFromAPI = true;
        } else {
          // Even if persona_data is in URL, fetch to ensure we have latest data and mode_id
          shouldFetchFromAPI = true;
          console.log("📥 Persona data from URL, but will also fetch from API to ensure completeness");
        }
      } else {
        // Otherwise, get from localStorage
        sessionId = localStorage.getItem("session_id");
        // Also fetch from API if session_id exists in localStorage
        // This ensures persona data is always up-to-date
        if (sessionId) {
          shouldFetchFromAPI = true;
          console.log("📥 Session ID found in localStorage, will fetch persona data:", sessionId);
        }
      }
      
      // Process session_id for chat
      if (sessionId) {
        console.log("✅ Processing session ID for chat:", sessionId);
        setSession_id(sessionId);
        
        // Fetch persona data from session API if needed
        // Skip if we already got it from URL and it's complete
        if (shouldFetchFromAPI) {
          fetchPersonaDataFromSession(sessionId).then((personaData) => {
            // If we got persona data from API, it will override URL data (more up-to-date)
            if (personaData) {
              console.log("✅ Persona data fetched from API, overriding URL data");
            } else {
              // Fallback to localStorage if fetch fails
              if (!personaDataFromURL) {
                console.log("📝 API fetch failed or returned no data, using localStorage persona data");
      let persona_data = localStorage.getItem("persona_data");
      if (persona_data) {
                  try {
        let parse_persona_data = JSON.parse(persona_data);
                    if (parse_persona_data?.industry || parse_persona_data?.persona_id) {
          setPersonaData(parse_persona_data);
                      console.log("✅ Using persona data from localStorage");
                    }
                  } catch (e) {
                    console.error("❌ Error parsing persona_data from localStorage:", e);
                  }
                }
              } else {
                console.log("✅ Using persona data from URL (API fetch failed)");
              }
            }
          });
        } else if (!personaDataFromURL) {
          // If no session ID and no URL persona_data, try to use localStorage persona data
          let persona_data = localStorage.getItem("persona_data");
          if (persona_data) {
            try {
              let parse_persona_data = JSON.parse(persona_data);
              if (parse_persona_data?.industry || parse_persona_data?.persona_id) {
                setPersonaData(parse_persona_data);
                console.log("✅ Using persona data from localStorage (no session ID)");
              }
            } catch (e) {
              console.error("❌ Error parsing persona_data from localStorage:", e);
            }
          }
        }
      } else {
        // No session ID, try to get persona data from localStorage anyway
        if (!personaDataFromURL) {
          let persona_data = localStorage.getItem("persona_data");
          if (persona_data) {
            try {
              let parse_persona_data = JSON.parse(persona_data);
              if (parse_persona_data?.industry || parse_persona_data?.persona_id) {
                setPersonaData(parse_persona_data);
                console.log("✅ Using persona data from localStorage (no session ID available)");
              }
            } catch (e) {
              console.error("❌ Error parsing persona_data from localStorage:", e);
            }
          }
        }
      }
    }
  }, [router.query, fetchPersonaDataFromSession]);

  // Old webkitSpeechRecognition initialization removed - now using useSpeechToText hook

  // Log transcript when mic is off
  // useEffect(() => {

  //   if (!isMicClicked) {
  //     if (transcript !== "") {
  //       console.log(transcript, "_micAi_");
  //     }
  //   }
  // }, [!isMicClicked, transcript]);

  // Silence detection removed - now handled by useSpeechToText hook

  const toggleSpeechRecognition = () => {
    try {
      if (!isListening) {
        // User is starting to speak - interrupt AI if speaking
        if (isElevenLabsPlaying && currentContextIdRef.current) {
          console.log("🛑 User interrupting AI speech...");
          stopElevenLabsAudio();
          if (currentContextIdRef.current) {
            closeElevenLabsContext(currentContextIdRef.current);
          }
        }

        console.log("🎤 Starting NEW speech recognition session...");
        console.log("🔄 Hook will automatically stop after 5s of silence");
        startSpeechRecognition();
      } else {
        console.log("⏹️ Manually stopping speech recognition...");
        stopSpeechRecognition();
        
        // Clear interim transcript
        setTranscriptDummy("");
        
        // Auto-send accumulated messages if there are any
        if (oneLineChatText?.length || chatMessages?.length) {
          console.log("📤 Auto-sending chat after manual stop");
          senChat();
        }
      }
    } catch (error) {
      console.error("❌ Error toggling speech recognition:", error);
    }
  };
  console.log(transcriptDummy, "transcriptDummy");
  
  // New WebSocket-based text-to-speech using ElevenLabs Multi-Context
  const textToSpeech = async (text) => {
    try {
      // Check if we're already processing or if this is the same text
      if (isProcessingRef.current || text === lastProcessedTextRef.current) {
        console.log("Skipping duplicate or already processing request");
        return;
      }

      if (!text) {
        console.log("No text provided for text-to-speech");
        return;
      }

      // Set processing flag and store the text
      isProcessingRef.current = true;
      lastProcessedTextRef.current = text;

      setIsAiThinking(true);
      console.log("Starting WebSocket text-to-speech conversion for:", text);

      // Connect to ElevenLabs if not already connected
      if (!isElevenLabsConnected) {
        console.log("Connecting to ElevenLabs WebSocket...");
        connectElevenLabs();
        // Wait a bit for connection to establish
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Generate unique context ID for this speech
      const contextId = `chat-response-${Date.now()}`;
      currentContextIdRef.current = contextId;

      // Send text to ElevenLabs for speech synthesis
      sendTextToElevenLabs(text, contextId);
      
      setIsAiThinking(false);
      console.log(`Sent text to ElevenLabs context: ${contextId}`);
    } catch (error) {
      console.error("Error in text to speech:", error);
      setIsSpeaking(false);
      setIsAiThinking(false);
      setIsAiSpeaking(false);
    } finally {
      // Reset processing flag after completion or error
      isProcessingRef.current = false;
    }
  };

  // Sync isAiSpeaking with ElevenLabs playing state
  useEffect(() => {
    // When ElevenLabs stops playing, ensure UI state is updated
    if (!isElevenLabsPlaying && isAiSpeaking) {
      console.log("🔄 ElevenLabs stopped playing, updating UI state");
      setIsAiSpeaking(false);
      setIsSpeaking(false);
    }
  }, [isElevenLabsPlaying, isAiSpeaking]);

  // Auto-connect to ElevenLabs when persona and session are ready
  useEffect(() => {
    if (session_id && personaData?.voice_id && !isElevenLabsConnected) {
      console.log("Auto-connecting to ElevenLabs WebSocket...");
      connectElevenLabs();
    }
  }, [session_id, personaData?.voice_id, isElevenLabsConnected, connectElevenLabs]);

  // Cleanup WebSocket connection on unmount or when session ends
  useEffect(() => {
    return () => {
      if (isElevenLabsConnected) {
        console.log("Cleaning up ElevenLabs connection...");
        disconnectElevenLabs();
      }
    };
  }, [isElevenLabsConnected, disconnectElevenLabs]);

  // Effect to handle new responses with rate limiting
  // ⚠️ DISABLED: Now using WebSocket streaming for real-time audio
  // This old effect was for REST API and causes duplicate audio playback
  // useEffect(() => {
  //   let timeoutId;
  //   if (resChat.length > 0 && isVolClicked) {
  //     const lastResponse = resChat[resChat.length - 1]?.response;
  //     if (lastResponse && !isSpeaking) {
  //       // Add delay before speaking to prevent rapid requests
  //       timeoutId = setTimeout(() => {
  //         console.log("New response received, speaking:", lastResponse);
  //         textToSpeech(lastResponse);
  //       }, 1000);
  //     }
  //   }
  //   return () => {
  //     if (timeoutId) clearTimeout(timeoutId);
  //   };
  // }, [resChat, isVolClicked]);
  console.log(chatMessages, "chatMessages__");

  const senChat = async () => {
    const persona_id = localStorage.getItem("persona_id");
    let oneLineText = "";
    console.log("📤 senChat called - session_id:", session_id, "persona_id:", persona_id);
    console.log("📤 chatMessages length:", chatMessages?.length);
    console.log("📤 oneLineChatText:", oneLineChatText);
    
    if (chatMessages?.length) {
      let textData = chatMessages.map((v) => v?.text);
      if (textData?.length) {
        oneLineText = textData.join(" ");
      }
      console.log("📤 Using chatMessages, combined text:", oneLineText);
    } else if (oneLineChatText?.length) {
      oneLineText = oneLineChatText;
      console.log("📤 Using oneLineChatText:", oneLineText);
      setChatMessagesView((prev) => [
        {
          text: oneLineChatText,
          isUser: true,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    if (!oneLineText || oneLineText.trim() === "") {
      console.log("⚠️ No text to send, aborting senChat");
      return;
    }

    console.log("✅ Sending text to backend:", oneLineText);
    setIsChatPosting(true); // Start loading
    
    try {
      // Ensure ElevenLabs is connected (but don't block the API request)
      // The WebSocket can connect in parallel while we make the API request
      if (!isElevenLabsConnected) {
        console.log("Connecting to ElevenLabs for streaming response...");
        connectElevenLabs();
        // Don't wait - let the connection happen in parallel with the API request
        // The WebSocket will be ready by the time we need to send audio chunks
      }

      // Single context ID for this conversation turn
      const contextId = `chat-stream-${Date.now()}`;
      currentContextIdRef.current = contextId;

      console.log(`🚀 Starting streaming chat with context: ${contextId}`);

      // Prepare request body
      const requestBody = {
        user_input: addDocText?.summary
          ? `${oneLineText} This is the sales document ${addDocText?.summary}`
          : oneLineText,
      };

      // Get API base URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      // Make streaming request immediately - no delay
      console.log(`📡 Sending request to: ${apiUrl}${chat_chat}/${session_id}/stream-events`);
      const response = await fetch(`${apiUrl}${chat_chat}/${session_id}/stream-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';
      let fullResponse = '';
      let sentTextToElevenLabs = ''; // Track what we've already sent to ElevenLabs
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Streaming completed');
          break;
        }

        // Decode chunk
        const decoded = decoder.decode(value, { stream: true });
        buffer += decoded;

        // Process lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') {
            continue;
          }

          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            try {
              const parsed = JSON.parse(data);
              console.log('📥 Received chunk:', parsed);

              // Handle different response types
              if (parsed.status === 'processing') {
                setIsAiThinking(true);
                continue;
              }

              if (parsed.text && parsed.text.trim()) {
                const textChunk = parsed.text;
                fullResponse += textChunk;

                // Stop thinking indicator when first text arrives
                if (isFirstChunk) {
                  setIsAiThinking(false);
                  isFirstChunk = false;
                }
                
                // Calculate ONLY the new text that hasn't been sent yet
                // This prevents ElevenLabs from accumulating and repeating text
                const newTextToSend = fullResponse.slice(sentTextToElevenLabs.length);
                
                if (newTextToSend.trim()) {
                  console.log(`📤 Sending NEW text to ElevenLabs [${contextId}]:`);
                  console.log(`   New text: "${newTextToSend.substring(0, 70)}..."`);
                  console.log(`   Length: ${newTextToSend.length} chars (Previously sent: ${sentTextToElevenLabs.length}, Total: ${fullResponse.length})`);
                  
                  // Send ONLY the new incremental text
                  // Note: streamTextChunk will check WebSocket connection internally
                  // If not connected, it will log an error but won't crash
                  streamTextChunk(newTextToSend, contextId, false);
                  
                  // Update what we've sent
                  sentTextToElevenLabs = fullResponse;
                  
                  // IMMEDIATELY flush to generate audio for this chunk
                  // This ensures real-time streaming without waiting for more text
                  flushContext(contextId);
                  console.log(`   ✅ Flushed immediately - audio generation started for this chunk`);
                }
              }

              // Handle completion
              if (parsed.isComplete === true) {
                console.log('🏁 Response complete:', fullResponse);
                console.log(`   Total length: ${fullResponse.length} characters`);
                
                // Check if there's any remaining text that wasn't sent
                const remainingText = fullResponse.slice(sentTextToElevenLabs.length);
                if (remainingText.trim()) {
                  console.log(`   📤 Sending final remaining text: "${remainingText}"`);
                  streamTextChunk(remainingText, contextId, true);
                  sentTextToElevenLabs = fullResponse;
                }
                
                // 🎯 CRITICAL: Final flush with isFinalFlush=true flag
                // This starts a 5-second fallback timer to ensure mic auto-starts
                flushContext(contextId, true);
                console.log(`✅ Final flush sent (with fallback timer) - all audio will complete`);
                console.log(`⏰ If ElevenLabs doesn't send is_final, mic will auto-start after 5s`);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError, data);
            }
          }
        }
      }

      // Update UI with complete response
      if (fullResponse) {
        setAddDocText({});
        localStorage.removeItem("summary");
        dispatch(AddSummary({}));
        setTranscriptDummy("");
        setTriggerSenChat(false);
        setIsVolClicked(true);
        setCoachingAround(true);
        setChatMessages([]);
        setOneLineChatText("");

        // Add the complete response to chat history
        const newResponse = { response: fullResponse };
        setResChat((pre) => [...pre, newResponse]);
        setResChatView((pre) => [newResponse, ...pre]);
      }

    } catch (error) {
      console.error('❌ Error in streaming chat:', error);
      showToast.error('Failed to send message. Please try again.');
      setIsAiThinking(false);
      setIsAiSpeaking(false);
    } finally {
      setIsChatPosting(false); // End loading
      setIsAiThinking(false);
    }
  };

  // Effect to handle triggerSenChat
  useEffect(() => {
    if (triggerSenChat) {
      console.log("🚀 triggerSenChat effect activated, calling senChat()");
      senChat();
      // Note: senChat() will reset triggerSenChat to false when complete
    }
  }, [triggerSenChat]);

  // Effect to handle volume button click
  useEffect(() => {
    if (isVolClicked && resChat.length > 0) {
      const lastResponse = resChat[resChat.length - 1]?.response;
      if (lastResponse && !isSpeaking) {
        console.log("Volume clicked, speaking last response:", lastResponse);
        textToSpeech(lastResponse);
      }
    }
  }, [isVolClicked]);

  // Add auto mode toggle button in the UI
  const toggleAutoMode = () => {
    const newAutoMode = !isAutoMode;
    setIsAutoMode(newAutoMode);
    isAutoModeRef.current = newAutoMode; // Update ref
    setTour(false);
    console.log(`🔄 Auto-mode ${newAutoMode ? 'ENABLED' : 'DISABLED'}`);
    console.log(newAutoMode 
      ? "✅ Mic will auto-start after AI finishes speaking" 
      : "⏸️ Manual mode - click mic to respond after AI");
    
    if (newAutoMode && !isSpeaking && !isListening) {
      // Start the conversation if enabling auto mode and not already active
      console.log("🎤 Starting conversation in auto-mode");
      toggleSpeechRecognition();
    }
  };

  const clearTranscript = () => {
    setTranscriptDummy("");
    setChatMessages([]);
    // Stop listening if currently active
    if (isListening) {
      stopSpeechRecognition();
    }
  };

  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.common.white,
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: "#fe0000",
      fontSize: "10px",
    },
  }));

  useEffect(() => {
    if (session_id) {
      if (coachingAround) {
        startCoaching(session_id);
      } else {
        console.log("dont coach");
      }
    }
  }, [session_id, coachingMessage, coachingAround]);

  const coachingArr = [{}, {}, {}];
  const qnaArr = [
    {
      question: "The standard chunk of Lorem Ipsum used?",
      answer: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making`,
    },
    {
      question: "It is a long established fact that a reader!",
      answer: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making`,
    },
    {
      question: "Lorem Ipsum  is simply dummy text?",
      answer: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making`,
    },
  ];

  useEffect(() => {
    // Add the styles to the document
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    return () => {
      // Clean up the styles when component unmounts
      document.head.removeChild(styleSheet);
    };
  }, []);

  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    const validExtensions = ["doc", "docx", "pdf"];
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

    if (files && files.length > 0) {
      let validFiles = Array.from(files).filter((file) => {
        const extension = file.name.split(".").pop().toLowerCase();
        return validExtensions.includes(extension);
      });

      // Check for oversize DOC/DOCX
      const oversizeDoc = Array.from(files).find((file) => {
        const ext = file.name.split(".").pop().toLowerCase();
        return (ext === "doc" || ext === "docx") && file.size > MAX_FILE_SIZE;
      });
      if (oversizeDoc) {
        setFileError(
          "DOC/DOCX files over 1MB cannot be uploaded. Please compress your file before uploading."
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Normal upload for valid files (PDFs of any size, DOC/DOCX under 1MB)
      if (validFiles.length > 0) {
        try {
          setIsUploading(true);
          const formData = new FormData();
          validFiles.forEach((file) => {
            formData.append("file", file); // "files" is the field name; adjust if your backend expects a different name
          });
          let data = await Post(documents_upload, formData);
          // Clear the file input after successful upload
          if (data?.summary) {
            setAddDocText(data);
            setFileError("");
            showToast.success("Document uploaded successfully");
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
          setFileError("Failed to upload document. Please try again.");
          if (fileInputRef.current) fileInputRef.current.value = "";
        } finally {
          setIsUploading(false);
        }
      } else {
        setFileError("Please upload only .doc, .docx, or .pdf files.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (isMobile && typeof window !== "undefined") {
      setShowAudioPrompt(true);
    }
  }, [isMobile]);

  // Function to prime audio context for mobile devices
  const handlePrimeAudio = async () => {
    try {
      // Create a silent audio context to unlock audio on mobile
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      
      setAudioPrimed(true);
      setShowAudioPrompt(false);
      
      // Connect to ElevenLabs after audio is primed
      if (!isElevenLabsConnected && personaData?.voice_id) {
        console.log("Audio primed, connecting to ElevenLabs...");
        connectElevenLabs();
      }
    } catch (error) {
      console.error("Error priming audio:", error);
      setShowAudioPrompt(false);
    }
  };

  return (
    <div className="lg:p-4 p-0 flex justify-between flex-col">
      {/* Audio priming overlay for mobile */}
      {showAudioPrompt && !audioPrimed && (
        <div
          style={{
            position: "fixed",
            zIndex: 9999,
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            style={{
              padding: "1.5rem 2.5rem",
              fontSize: "1.5rem",
              borderRadius: "1rem",
              background: "#FFE942",
              color: "#060606",
              border: "none",
              fontWeight: 700,
              boxShadow: "0 2px 16px #0008",
              cursor: "pointer",
            }}
            onClick={handlePrimeAudio}
          >
            Tap to Enable Audio
          </button>
        </div>
      )}
      <div
        className={`w-auto lg:rounded-[25px] rounded-0 bg-[url(../../public/assets/images/RealSales-backgrounds/bg-4.png)] bg-cover bg-center bg-blend-multiply overflow-hidden relative`}
      >
        {/* <div className="w-full flex flex-col gap-8 h-[calc(100vh_-_32px)] overflow-y-auto bg-[linear-gradient(180deg,rgba(6,6,6,0.9)_0%,rgba(17,24,43,0.9)_62.58%)] px-8 py-4"> */}
        <div className="w-full flex flex-col gap-8 bg-[linear-gradient(180deg,rgba(6,6,6,0.9)_0%,rgba(17,24,43,0.9)_62.58%)] lg:px-8 px-4 py-4">
          {/* header */}
          <div className="flex lg:flex-row flex-col items-center gap-2 justify-between">
            <div className="flex items-center lg:w-[55%] w-full">
              <div className="w-[40%]">
                <div
                  onClick={() => {
                    if (slug === "rating") {
                      router.push("/");
                      localStorage.removeItem("session_id");
                    } else {
                      dispatch(
                        EndChatValue({
                          open: true,
                          type: "audio",
                          chat: chatMessagesView?.length,
                        })
                      );
                    }
                  }}
                  className="w-10 h-10 bg-[#FFFFFF1A] rounded-full flex items-center justify-center cursor-pointer"
                >
                  <ArrowBackIcon className="text-white" />
                </div>
              </div>
              <div
                // href={slug === "rating" ? "/" : "#"}
                className="w-[60%] flex items-center justify-end"
              >
                <Image
                  src={whiteLogoNoBackground}
                  alt="whiteLogoNoBackground"
                  className="h-10 w-auto"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 lg:w-[45%] w-full">
              {/* <div className="relative w-10 h-10 bg-[#FFFFFF1A] rounded-full flex items-center justify-center cursor-pointer">
                <MailIcon className="text-white" />
                <p className="flex items-center justify-center absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#CF2427] text-white text-[10px]">
                  {99}
                </p>
              </div> */}
              <div
                onClick={() => setChecked(true)}
                className="relative w-10 h-10 bg-[#FFFFFF1A] rounded-full flex items-center justify-center cursor-pointer"
              >
                <NotificationsIcon className="text-white" />
                <p className="flex items-center justify-center absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#CF2427] text-white text-[10px]">
                  {coachingData?.length}
                </p>
              </div>
              <div className="flex items-center gap-2 pl-4">
                <div className="flex flex-col items-end">
                  <p className="lg:text-lg text-base m-plus-rounded-1c-regular text-[#ffffffc6]">
                    Logged in as:
                  </p>
                  <p className="lg:text-xl text-lg m-plus-rounded-1c-medium text-[#FFDE5A]">
                    {user?.first_name}&nbsp;{user?.last_name}
                  </p>
                  {/* ElevenLabs WebSocket Connection Status Indicator */}
                  {isElevenLabsConnected && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Voice AI Connected
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-14 h-14 rounded-full p-1 border-2 border-solid border-white overflow-hidden">
                    {/* <Image
                      src={userDummy}
                      alt="user-image"
                      className="w-full h-full rounded-full"
                    /> */}
                    <p className="w-full h-full rounded-full flex items-center justify-center text-2xl bg-[#FFDE5A] sora-medium uppercase">
                      {user?.first_name ? user?.first_name[0] : null}
                    </p>
                  </div>
                  <ArrowDropDownIcon
                    onClick={handleClickPopOver}
                    className="text-white !text-4xl cursor-pointer"
                  />
                  <Popover
                    id={popOverid}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClosePopOver}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                  >
                    <div className="px-4 py-3 min-w-40">
                      {token !== "" && (
                        <div
                          onClick={() => {
                            useLogout({ final: router.push("/") });
                            dispatch(AddAuth(""));
                            dispatch(AddUser({}));
                          }}
                          className="cursor-pointer text-red-500"
                        >
                          <LogoutIcon className="text-red-500" />
                          &nbsp;Logout
                        </div>
                      )}
                    </div>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* bordy */}
          {children ? (
            children
          ) : slug === "audio" || slug === "video" ? (
            <div>
              {/* header */}
              <div className="flex lg:flex-row flex-col-reverse gap-2">
                <div className="lg:w-[70%] w-full flex flex-row gap-2">
                  <div className="w-[40%] lg:flex hidden">
                    <FormControlLabel
                      value="end"
                      control={
                        <Radio
                          checked={true}
                          sx={{
                            cursor: "default",
                            color: "#FFDE5A",
                            "&.Mui-checked": {
                              color: "#FFDE5A", // checked color
                            },
                          }}
                        />
                      }
                      label={
                        <p className="sora-semilight text-sm">
                          Interaction Summarization:
                        </p>
                      }
                      sx={{
                        cursor: "default",
                        color: "#FFFFFF", // label text color
                      }}
                    />
                  </div>
                  <div className="w-full lg:w-[60%]">
                    <p className="sora-regular text-white text-base capitalize">
                      {slug}-Chat Session:
                    </p>
                    <div className="flex flex-col gap-0.25 w-fit">
                      <p className="m-plus-rounded-1c-light text-white lg:text-2xl text-[18px]">
                        Your Session id:&nbsp;
                        <span className="text-[#FFDE5A]">{session_id}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:w-[30%] w-full">
                  <FormControlLabel
                    defaultChecked
                    value="end"
                    control={
                      <Radio
                        checked={true}
                        sx={{
                          cursor: "default",
                          color: "#FFDE5A",
                          "&.Mui-checked": {
                            color: "#FFDE5A", // checked color
                          },
                        }}
                      />
                    }
                    label={
                      <p className="sora-semilight text-sm">
                        RealSales Coaching Panel:
                      </p>
                    }
                    sx={{
                      cursor: "default",
                      color: "#FFFFFF", // label text color
                    }}
                  />
                  <div className="flex items-center lg:justify-start justify-between gap-2">
                    <p className="sora-semilight text-sm text-white">
                      Coaching mode:
                    </p>
                    <Switch
                      className="coustomChatSwitch !h-[35px] !w-[70px] !p-0"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-track": {
                          backgroundColor: checked ? "#FFDE5A !important" : "#808080 !important",
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* body */}
              <div className="flex lg:flex-row flex-col gap-2">
                {/* left */}
                <div
                  className={`relative ${
                    checked ? "lg:w-[70%] w-full" : "w-full"
                  } mb-40 h-[calc(100vh_-_8rem)] flex flex-col justify-between gap-4`}
                >
                  {/* top */}
                  <div className="w-full flex lg:flex-row flex-col items-start gap-2">
                    {/* top right */}
                    <div
                      className={`lg:flex hidden ${
                        checked ? "w-[40%]" : "w-[28%]"
                      } flex flex-col gap-4`}
                    >
                      <div className="bg-[linear-gradient(180deg,rgba(17,24,43,0.3)_0%,rgba(255,255,255,0.09)_100%)] rounded-[10px] p-4 flex items-center gap-4">
                        <div
                          onClick={handleClickPopOverPersona}
                          className="relative w-[125px] h-[160px] overflow-hidden cursor-pointer rounded-[10px]"
                        >
                          <Image
                            src={
                              personaData?.profile_pic
                                ? personaData?.profile_pic
                                : persona_plant
                            }
                            alt="persona_plant"
                            width={192}
                            height={108}
                            className="w-full h-full"
                          />
                          <div className="absolute top-0 flex items-end w-full h-full bg-[linear-gradient(16.61deg,#000000_18.44%,rgba(0,0,0,0)_82.49%)]">
                            <div className="flex flex-col p-2">
                              <p className="m-plus-rounded-1c-regular text-[#ffffff] text-[14px] truncate">
                                {personaData?.name}
                              </p>
                              <p className="m-plus-rounded-1c-regular text-[#FFDE5A] text-[17px]">
                                Activated
                              </p>
                            </div>
                          </div>
                        </div>
                        <Popover
                          id={idPersona}
                          open={openpersonaDetails}
                          anchorEl={personaDetails}
                          onClose={handleClosePopOverPersona}
                          anchorOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          <div className="p-4">
                            <p className="m-plus-rounded-1c-semibold text-lg text-[#000000] uppercase pb-1.5">
                              {personaData?.name?.replace(/_/g, " ")}
                            </p>
                            <p className="font-medium m-plus-rounded-1c-bold text-[1.05rem] capitalize">
                              Details:
                            </p>
                            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
                              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
                              {capitalize(
                                personaData?.ai_role?.name?.replace(/_/g, " ")
                              )}
                            </p>
                            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
                              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
                              {capitalize(
                                personaData?.industry?.name?.replace(/_/g, " ")
                              )}
                            </p>
                            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
                              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
                              {capitalize(
                                personaData?.manufacturing_model?.name?.replace(
                                  /_/g,
                                  " "
                                )
                              )}
                            </p>
                            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
                              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
                              {capitalize(
                                personaData?.plant_size_impact?.name?.replace(
                                  /_/g,
                                  " "
                                )
                              )}
                            </p>
                            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
                              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
                              {capitalize(
                                personaData?.company_size_new?.name?.replace(
                                  /_/g,
                                  " "
                                )
                              )}
                              &nbsp;
                              {personaData?.company_size_new?.name === "small"
                                ? "(1-500)"
                                : personaData?.company_size_new?.name ===
                                  "medium"
                                ? "(501-5,000)"
                                : personaData?.company_size_new?.name ===
                                  "large"
                                ? "(5,000+)"
                                : ""}
                            </p>
                            <p className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]">
                              <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
                              {personaData?.geography?.replace(/_/g, " ")}
                            </p>
                            {personaData?.persona_products?.length > 0 && (
                              <div className="mt-2">
                                <p className="font-medium m-plus-rounded-1c-bold text-[1.05rem] capitalize">
                                  Products:
                                </p>
                                <div className="list-disc list-inside text-[13px]">
                                  {personaData?.persona_products.map(
                                    (prod, idx) => (
                                      <p
                                        className="flex items-start gap-2 sora-medium md:text-[14px] text-[13px]"
                                        key={idx}
                                      >
                                        <span className="p-0.5 mt-2 rounded-full bg-[#2d2d2d]" />
                                        {capitalize(
                                          prod?.product?.name?.replace(
                                            /_/g,
                                            " "
                                          )
                                        )}
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </Popover>
                        <div className="flex flex-col items-start gap-1 h-full">
                          <p className="text-white sora-semilight text-[14px]">
                            Active plan:
                            <br />
                            <span className="sora-regular">Single Session</span>
                          </p>
                          <div className="">
                            <p className="text-white m-plus-rounded-1c-semilight text-[20px]">
                              Session&nbsp;mode
                            </p>
                            <div className="py-1 px-3 rounded-full bg-[#060606] w-fit flex items-center gap-2">
                              <Image
                                src={cil_audio}
                                alt="cil_audio"
                                className="w-6 h-auto"
                              />
                              <span className="text-white sora-regular text-sm">
                                Audio
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="flex flex-col items-start gap-1 h-full">
                              {addDocText?.filename ? (
                                <div className="flex items-start gap-2">
                                  <p className="text-white m-plus-rounded-1c-medium text-base">
                                    {addDocText?.filename}
                                  </p>
                                  {/* <button
                                className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                onClick={() => {
                                  setAddDocText({});
                                  localStorage.removeItem("summary");
                                  dispatch(AddSummary({}));
                                }}
                                disabled={isUploading}
                                title="Remove document"
                                type="button"
                              > */}
                                  <RemoveRedEyeOutlinedIcon
                                    onClick={() => setViewDoc(true)}
                                    className="text-white cursor-pointer"
                                  />
                                  <CustomTooltip
                                    title={"Remove document"}
                                    placement="right"
                                    arrow
                                  >
                                    <DeleteIcon
                                      className="cursor-pointer !text-xl !text-red-500 !hover:text-red-600"
                                      onClick={() => {
                                        setAddDocText({});
                                        localStorage.removeItem("summary");
                                        dispatch(AddSummary({}));
                                      }}
                                    />
                                  </CustomTooltip>
                                  {/* </button> */}
                                </div>
                              ) : isUploading ? (
                                <div className="w-full flex items-center justify-center">
                                  <div class="h-8 w-8 rounded-full border-4 border-gray-300 border-t-yellow-500 animate-spin"></div>
                                </div>
                              ) : (
                                <div
                                  className={`flex items-center gap-1 ${
                                    isAiSpeaking
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                  onClick={
                                    isAiSpeaking ? undefined : handleClick
                                  }
                                >
                                  <p className="text-white m-plus-rounded-1c-medium underline text-lg">
                                    Upload&nbsp;Files
                                  </p>
                                  <AddCircleOutlineSharpIcon className="text-white" />

                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".doc,.docx,.pdf"
                                    onChange={handleFileChange}
                                    disabled={
                                      !addDocText?.summary ? false : true
                                    }
                                  />
                                </div>
                              )}
                              {fileError && (
                                <div className="text-red-500 text-xs mt-1">
                                  {fileError}
                                </div>
                              )}
                            </div>
                            {addDocText?.filename ? null : (
                              <RemoveRedEyeOutlinedIcon
                                onClick={() => setViewDoc(true)}
                                className="text-white mt-0.5 cursor-pointer"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {upgrade ? (
                        <div className="relative bg-[linear-gradient(180deg,rgba(17,24,43,0.3)_0%,rgba(255,255,255,0.09)_100%)] rounded-[10px] p-4 flex flex-col items-start gap-2">
                          <div
                            onClick={() => setUpgrade(false)}
                            className="z-10 cursor-pointer bg-red-500 rounded-full h-6 w-6 flex items-center justify-center absolute -top-2.5 -right-1.5"
                          >
                            <CloseOutlinedIcon className="!text-[16px] text-white" />
                          </div>
                          <div>
                            <p className="text-white m-plus-rounded-1c-medium text-lg">
                              Upgrade
                            </p>
                            <p className="text-white m-plus-rounded-1c-semilight text-[22px]">
                              Get Access upto 3 Personas
                            </p>
                          </div>
                          <BookAdemo
                            BookaDemo={`upgrade your plan`}
                            link={`/pricing`}
                            className={`!border-[#FFDE5A] !bg-[#060606] !text-[#FFDE5A] !px-5 !py-1 h-fit`}
                            icon={<ArrowRight stroke={`#FFDE5A`} />}
                          />
                        </div>
                      ) : (
                        false
                      )}
                    </div>
                    {/* top left */}
                    <div
                      className={`${
                        checked ? "lg:w-[60%] w-full" : "lg:w-[72%] w-full"
                      } flex flex-col items-center gap-2`}
                    >
                      <hr className="border-[#FFFFFF33] w-full" />
                      <div
                        className={`relative w-full ${
                          checked ? "h-[80vh]" : "h-[85vh]"
                        } overflow-y-auto`}
                      >
                        <div className="absolute inset-0 bg-[url('../../public/assets/images/RealSales-abstracts/glow-light-1.png')] bg-cover bg-center bg-no-repeat opacity-20"></div>
                        {slug === "audio" ? (
                          <div className="absolute inset-0 p-5 w-full h-full flex flex-col items-center">
                            {/* ai mic */}
                            <div className="lg:w-[90%] w-full flex items-start gap-1.5 z-10">
                              <div className="flex items-center gap-1.5 -mt-2 relative">
                                <button
                                  className={`w-10 h-10 ${
                                    isListening
                                      ? "bg-[#26AD35] hover:bg-[#26AD35]"
                                      : "bg-[#FFFFFF1A] hover:bg-[#FFFFFF33]"
                                  } rounded-full flex items-center justify-center cursor-pointer transition-colors`}
                                  onClick={() => {
                                    toggleSpeechRecognition();
                                    setIsVolClicked(false);
                                    setTour(false);
                                  }}
                                >
                                  <MicNoneOutlinedIcon
                                    className={`${
                                      isListening
                                        ? "text-white"
                                        : "text-[#FFFFFF80]"
                                    } !text-[20px]`}
                                  />
                                </button>
                                {tour && (
                                  <div className="left-[130%] absolute flex items-center">
                                    <ArrowLeftIcon className="right-[80%] absolute text-green-500" />
                                    <div className="shadow-md bg-green-500 text-white sora-regular text-sm px-2 rounded">
                                      Start
                                    </div>
                                  </div>
                                )}
                                {transcript && (
                                  <Image
                                    src={soundWave}
                                    alt="soundWave"
                                    className="w-8 h-8"
                                  />
                                )}
                                {/* {isMicClicked && (
                                <SpeakingIndicator
                                  isActive={true}
                                  transcript={transcript}
                                  color="#FFFFFF"
                                />
                              )} */}
                              </div>
                              <div
                                ref={containerRef}
                                className="flex flex-col items-start gap-1 w-[80%] h-[20vh] overflow-y-auto"
                              >
                                {chatMessagesView.map((message, index) => (
                                  <p
                                    key={index}
                                    className="text-white sm:text-base text-[13px] sora-regular w-[80%] opacity-70"
                                  >
                                    <span className="text-[#FFDE5A] sora-semibold">
                                      {message.isUser ? "You" : "AI"}
                                    </span>
                                    &nbsp;{message.text}
                                  </p>
                                ))}
                                {isListening && transcript && (
                                  <p className="text-white sm:text-base text-[13px] sora-regular w-[80%] opacity-100">
                                    <span className="text-[#FFDE5A] sora-semibold">
                                      You
                                    </span>
                                    &nbsp;{transcript}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="relative w-full h-[45%] flex items-center justify-center">
                              {isAiSpeaking ? (
                                resChat[resChat.length - 1]?.response ? (
                                  <Image
                                    src={soundWaveAi}
                                    alt="soundWaveAi"
                                    className="lg:w-[80%] w-full h-auto absolute lg:-top-[15%] top-[15%]"
                                  />
                                ) : (
                                  <Image
                                    src={callVibration}
                                    alt="callVibration"
                                    className="lg:w-[80%] w-full h-auto absolute"
                                  />
                                )
                              ) : (
                                <Image
                                  src={callVibration}
                                  alt="callVibration"
                                  className="lg:w-[80%] w-full h-auto absolute"
                                />
                              )}
                              <div
                                style={{ boxShadow: "0 0 10px 0 #FFE942" }}
                                className={`sm:w-32 w-20 sm:h-32 h-20 rounded-full p-1 border border-solid z-10 absolute flex items-center justify-center backdrop-blur-sm ${
                                  isChatPosting
                                    ? "bg-[#FFE94225] border-[#FFE942]"
                                    : "bg-[#ffffff31] border-[#FFE942]"
                                } ${
                                  !checked
                                    ? "lg:top-[10%] top-[30%]"
                                    : "lg:top-[10%] top-[30%]"
                                }`}
                              >
                                {/* OLD: Spinner animation (commented out)
                                {isChatPosting ? (
                                  <div className="w-full flex items-center justify-center">
                                    <div class="h-12 w-12 rounded-full border-8 border-white border-t-[#FFE942] animate-spin"></div>
                                  </div>
                                ) : (
                                  <Image
                                    src={
                                      personaData?.profile_pic
                                        ? personaData?.profile_pic
                                        : persona_plant
                                    }
                                    width={192}
                                    height={108}
                                    alt="persona_plant"
                                    className="w-full h-full rounded-full"
                                  />
                                )}
                                */}
                                
                                {/* NEW: Always show persona image */}
                                <Image
                                  src={
                                    personaData?.profile_pic
                                      ? personaData?.profile_pic
                                      : persona_plant
                                  }
                                  width={192}
                                  height={108}
                                  alt="persona_plant"
                                  className="w-full h-full rounded-full"
                                />
                              </div>
                              
                              {/* NEW: Thinking indicator below persona */}
                              {isChatPosting && (
                                <div className="absolute lg:top-[45%] top-[55%] flex flex-col items-center justify-center z-20 animate-pulse">
                                  <div className="bg-gradient-to-r from-[#FFE942] via-[#FFD700] to-[#FFE942] text-black px-6 py-3 rounded-full shadow-lg backdrop-blur-sm border border-[#FFE942] flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                      <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                      <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                    <span className="sora-semibold text-sm sm:text-base">
                                      {personaData?.name || 'AI'} is thinking...
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ai chat */}
                            <div className="lg:w-[90%] w-full flex items-start gap-1.5 z-10">
                              <div className="flex items-center gap-1.5">
                                <button
                                  className={`p-1.5 flex-s 
                                  ${
                                    isVolClicked
                                      ? "bg-[#26AD35] hover:bg-[#26AD35]"
                                      : "bg-[#FFFFFF1A] hover:bg-[#FFFFFF33]"
                                  }
                                rounded-full flex items-center justify-center cursor-pointer transition-colors`}
                                  onClick={() => {
                                    if (!isVolClicked) {
                                      setIsVolClicked(true);
                                    } else {
                                      setIsVolClicked(false);
                                      // setIsMicClicked(true);
                                    }
                                  }}
                                >
                                  <VolumeUpIcon
                                    className={`${
                                      isVolClicked
                                        ? "text-white"
                                        : "text-[#FFFFFF80]"
                                    } !text-[20px]`}
                                  />
                                </button>
                                {isAiSpeaking
                                  ? resChat[resChat.length - 1]?.response && (
                                      <Image
                                        src={soundWaveAi}
                                        alt="soundWaveAi"
                                        className="lg:w-8 w-6 lg:h-8 h-6"
                                      />
                                    )
                                  : null}
                                {/* {isAiSpeaking && <SpeakingIndicator isActive={true} color="#FFDE5A" transcript={resChat[resChat.length - 1]?.response || ""} isAi={true} />} */}
                                {/* {isAiSpeaking && (
                                <SpeakingIndicator
                                  isActive={true}
                                  color="#26AD35"
                                  transcript={
                                    resChat[resChat.length - 1]?.response || ""
                                  }
                                  isAi={true}
                                />
                              )} */}
                              </div>
                              <div
                                ref={containerRef}
                                className="w-[90%] flex flex-col items-start h-[20vh] overflow-y-auto mt-1.5"
                              >
                                {/* <span className="text-[#FFDE5A] sora-semibold">
                                Hello!
                              </span>
                              &nbsp;how are you !! */}
                                {resChatView?.length
                                  ? resChatView.map((v, i) => (
                                      <p
                                        key={i}
                                        className="pr-4 text-white sm:text-base text-[13px] sora-regular"
                                      >
                                        <span className="text-[#FFDE5A] sora-semibold">
                                          AI Client
                                        </span>
                                        &nbsp;{v?.response}
                                      </p>
                                    ))
                                  : null}
                              </div>
                            </div>
                          </div>
                        ) : slug === "video" ? (
                          <div className="absolute inset-0 p-5 w-full h-full flex flex-col items-center gap-2.5">
                            {/* AI */}
                            <div className="relative backdrop-blur-[5px] shadow-[0px_10px_30px_0px_#00000033] bg-[#FFFFFF05] overflow-hidden rounded-[10px] p-2.5">
                              <div className="bg-[url(../../public/assets/images/RealSales-user-images/persona-plant.png)] w-80 h-44 bg-cover bg-no-repeat rounded-[10px]" />
                              <div class="bg-[linear-gradient(0deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_70%)] absolute top-2.5 left-2.5 right-2.5 rounded-t-[10px] z-10 px-4 py-2 flex gap-2">
                                <CustomTooltip
                                  title={micAi ? "Mute" : "Muted"}
                                  placement="right"
                                  arrow
                                >
                                  <div
                                    className="w-9 h-9 bg-[#FFFFFF1A] rounded-full flex items-center justify-center cursor-pointer"
                                    onClick={() => setMicAi(!micAi)}
                                  >
                                    {micAi ? (
                                      <MicNoneOutlinedIcon className="text-white !text-[20px]" />
                                    ) : (
                                      <MicOffSharpIcon className="text-white !text-[20px]" />
                                    )}
                                  </div>
                                </CustomTooltip>
                                {micAi ? (
                                  <Image
                                    src={callVibration}
                                    alt="callVibration"
                                    className="w-8 h-10"
                                  />
                                ) : null}
                              </div>
                              <div class="bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_70%)] absolute bottom-2.5 left-2.5 right-2.5 rounded-t-[10px] z-10 px-4 py-2 flex gap-2">
                                <div className="backdrop-blur-[10px] py-2 px-4 w-full rounded-[10px] flex items-center gap-4 overflow-hidden">
                                  <div className="border border-solid border-white rounded-full w-10 h-10 p-0.5">
                                    <Image
                                      src={persona_plant}
                                      alt={"persona_plant"}
                                      className="rounded-full w-full h-full"
                                    />
                                  </div>
                                  <p className="z-10 m-plus-rounded-1c-medium text-white text-[15px] w-[75%] truncate">
                                    <span className="text-[#FFDE5A]">
                                      Hlw dear!
                                    </span>
                                    &nbsp;are you excited?
                                  </p>
                                  <div className="bg-[url(../../public/assets/images/RealSales-abstracts/call-vibration.png)] bg-cover bg-center bg-no-repeat w-[80%] h-[200%] absolute -bottom-[70%] right-0 opacity-40" />
                                </div>
                              </div>
                            </div>

                            {/* user */}
                            <div className="relative backdrop-blur-[5px] shadow-[0px_10px_30px_0px_#00000033] bg-[#FFFFFF05] overflow-hidden rounded-[10px] p-2.5">
                              <div className="bg-[url(../../public/assets/images/RealSales-user-images/persona-plant.png)] w-80 h-44 bg-cover bg-no-repeat rounded-[10px]" />
                              <div class="bg-[linear-gradient(0deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_70%)] absolute top-2.5 left-2.5 right-2.5 rounded-t-[10px] z-10 px-4 py-2 flex gap-2">
                                <CustomTooltip
                                  title={micUser ? "Mute" : "Muted"}
                                  placement="right"
                                  arrow
                                >
                                  <div
                                    className="w-9 h-9 bg-[#FFFFFF1A] rounded-full flex items-center justify-center cursor-pointer"
                                    onClick={() => setMicUser(!micUser)}
                                  >
                                    {micUser ? (
                                      <MicNoneOutlinedIcon className="text-white !text-[20px]" />
                                    ) : (
                                      <MicOffSharpIcon className="text-white !text-[20px]" />
                                    )}
                                  </div>
                                </CustomTooltip>
                                {micUser ? (
                                  <Image
                                    src={callVibration}
                                    alt="callVibration"
                                    className="w-8 h-10"
                                  />
                                ) : null}
                              </div>
                              <div class="bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_70%)] absolute bottom-2.5 left-2.5 right-2.5 rounded-t-[10px] z-10 px-4 py-2 flex gap-2">
                                <div className="backdrop-blur-[10px] py-2 px-4 w-full rounded-[10px] flex items-center gap-4 overflow-hidden">
                                  <div className="border border-solid border-white rounded-full w-10 h-10 p-0.5">
                                    <Image
                                      src={persona_plant}
                                      alt={"persona_plant"}
                                      className="rounded-full w-full h-full"
                                    />
                                  </div>
                                  <p className="z-10 m-plus-rounded-1c-medium text-white text-[15px] w-[75%] truncate">
                                    <span className="text-[#FFDE5A]">Yes,</span>
                                    &nbsp;I'm feel very nice ...
                                  </p>
                                  <div className="bg-[url(../../public/assets/images/RealSales-abstracts/call-vibration.png)] bg-cover bg-center bg-no-repeat w-[80%] h-[200%] absolute -bottom-[70%] right-0 opacity-40" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {/* bottom */}
                  <div
                    className={`fixed bottom-8 ${
                      checked ? "lg:w-[60%] w-[90%]" : "w-[90%]"
                    } flex flex-col items-start gap-2 z-20`}
                  >
                    <div>
                      <p className="sora-regular text-white text-sm">
                        To proceed your dream chat:
                      </p>
                      <p className="sora-thin text-white text-lg">
                        Say "Hi" to your Persona !!
                      </p>
                    </div>
                    <div className="w-full flex items-center gap-2">
                      {/* <div className="w-10 h-10 bg-[#FFFFFF1A] rounded-full flex items-center justify-center cursor-pointer">
                        <Image
                          src={menueIcon}
                          alt="menueIcon"
                          className="w-4 h-auto"
                        />
                      </div> */}
                      <CustomTooltip
                        // title={
                        //   chatMessagesView?.length >= 5
                        //     ? "End Call"
                        //     : "Exchange at least 5 chat before ending"
                        // }
                        title={"End Call"}
                        placement="top"
                        arrow
                      >
                        {/* ${
                            chatMessagesView?.length >= 5
                              ? "bg-[#FE0000]"
                              : "bg-[#ff6e6e]"
                          } */}
                        <div
                          className={`p-2 bg-[#FE0000] rounded-full flex items-center justify-center cursor-pointer`}
                          onClick={() => {
                            if (chatMessagesView?.length >= 5) {
                              dispatch(
                                EndChatValue({
                                  open: true,
                                  type: "audio",
                                  chat: chatMessagesView?.length,
                                })
                              );
                            } else {
                              dispatch(
                                EndChatValue({
                                  open: true,
                                  type: "audio",
                                  chat: chatMessagesView?.length,
                                })
                              );
                            }
                          }}
                        >
                          <CallEndSharpIcon className="text-white" />
                        </div>
                      </CustomTooltip>
                      <div className="bg-[#ffffff8f] p-1 pl-2 rounded-full flex justify-between items-center lg:w-[80%] w-full">
                        <input
                          disabled={isAiSpeaking}
                          placeholder="Chat with your AI Trainer ..."
                          className="border-0 outline-0 !py-1 !px-4 w-full text-white m-plus-rounded-1c-regular"
                          value={oneLineChatText}
                          onChange={(e) => {
                            setTour(false);
                            setOneLineChatText(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              // setOneLineChatText(e.target.value);
                              // e.preventDefault();
                              if (oneLineChatText?.length) {
                                senChat();
                              }
                            }
                          }}
                        />
                        <div
                          className={`flex items-center !text-[#060606D9] bg-[#FFE942] hover:bg-[#ffdc42] !capitalize py-1 px-1.5 !rounded-full mr-2 ${
                            isAiSpeaking
                              ? "cursor-not-allowed"
                              : addDocText?.summary
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          onClick={isAiSpeaking ? undefined : handleClick}
                        >
                          {isUploading ? (
                            <div className="w-full flex items-center justify-center">
                              <div class="h-[25px] w-[25px] rounded-full border-4 border-white border-t-[#FFE942] animate-spin"></div>
                            </div>
                          ) : (
                            <AttachFileIcon />
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".doc,.docx,.pdf"
                            onChange={handleFileChange}
                            disabled={!addDocText?.summary ? false : true}
                          />
                        </div>
                        <div
                          onClick={() => {
                            if (isAiSpeaking) {
                              undefined;
                            } else {
                              if (oneLineChatText?.length) {
                                senChat();
                              }
                            }
                          }}
                          className={`flex items-center gap-2 !text-[#060606D9] bg-[#FFE942] hover:bg-[#ffdc42] !capitalize !py-1 !px-1 !rounded-full ${
                            isAiSpeaking
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          {/* <span className="m-plus-rounded-1c-medium">
                          Send&nbsp;Message
                        </span> */}
                          <SendMessage />
                        </div>
                      </div>
                      <CustomTooltip
                        title={
                          isAutoMode
                            ? "Auto-Mode ON: Mic auto-starts after AI speaks (Click to disable)"
                            : "Auto-Mode OFF: Manual mic control (Click to enable)"
                        }
                        placement="top"
                        arrow
                      >
                        <div
                          className={`p-2 relative ${
                            isAutoMode ? "bg-[#26AD35]" : "bg-[#FFFFFF1A]"
                          } rounded-full flex items-center justify-center cursor-pointer`}
                          onClick={toggleAutoMode}
                        >
                          <MicNoneOutlinedIcon
                            className={`${
                              isAutoMode ? "text-white" : "text-[#FFFFFF80]"
                            } !text-[20px]`}
                          />
                          {/* {tour && (
                            <div className="left-[130%] absolute lg:flex hidden items-center ">
                              <ArrowLeftIcon className="right-[80%] absolute text-green-500" />
                              <div className="shadow-md bg-green-500 text-white sora-regular text-sm px-2 rounded">
                                Auto-Mode (Enabled)
                              </div>
                            </div>
                          )} */}
                        </div>
                      </CustomTooltip>
                      <div className="lg:flex hidden w-14 h-14 rounded-full p-1 border-2 border-solid border-white overflow-hidden">
                        <div className="w-full h-full rounded-full flex items-center justify-center text-2xl bg-[#FFDE5A] sora-medium uppercase">
                          {user?.first_name ? user?.first_name[0] : "U"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-[20vh] w-full text-transparent"></div>
                </div>

                {/* right */}
                {checked ? (
                  <div className="lg:w-[30%] w-full">
                    <div className="flex flex-col gap-2">
                      {/* card top */}
                      {/* <div className="border border-solid border-[#14558C4D] bg-[linear-gradient(90deg,rgba(20,85,140,0.3)_0%,rgba(20,85,140,0)_50%,rgba(20,85,140,0.3)_100%)] relative">
                        <div className="flex flex-col gap-2 p-4">
                          <div className="relative flex items-center justify-start">
                            <div className="w-10 h-10 bg-[#14558C] rounded-full" />
                            <p class="absolute left-1 rounded-[5px] bg-[linear-gradient(90deg,#14558C_0%,#5586B0_100%)] w-fit sora-regular text-sm text-white px-3 py-1 capitalize">
                              Response Tips
                            </p>
                          </div>
                          <div className="w-full flex items-start gap-2">
                            <div className="w-16 hg-16 p-1 border border-solid border-white rounded-full">
                              <Image
                                src={personaExtra}
                                alt="personaExtra"
                                className="w-full h-full rounded-full"
                              />
                            </div>
                            <div className="flex flex-col">
                              <h1 className="text-white text-[20px] m-plus-rounded-1c-regular">
                                Understand the Context
                              </h1>
                              <p className="text-white text-[14px] m-plus-rounded-1c-light w-[80%]">
                                Lorem Ipsum is the simply dummy text of t...
                              </p>
                            </div>
                          </div>
                        </div>
                        <p class="absolute right-0 top-4 bg-[linear-gradient(90deg,rgba(38,173,53,0.8)_0%,rgba(38,173,53,0)_100%)] w-fit sora-regular text-[12px] text-white px-2.5 py-1 capitalize">
                          Acknowledged
                        </p>
                      </div> */}
                      {/* card stack */}
                      <div className="relative">
                        <div
                          className={`flex flex-col gap-2 ${
                            coachingData?.length ? "h-[85vh]" : ""
                          } overflow-y-auto`}
                        >
                          {coachingData?.length
                            ? coachingData.map((v, idx) => (
                                <div
                                  className={`border-l-4 border-solid relative ${
                                    idx % 2 === 0
                                      ? "border-[#26AD35B2] bg-[linear-gradient(90deg,rgba(38,173,53,0.2)_0%,rgba(38,173,53,0)_63.5%)]"
                                      : "border-[#E59E2CB2] bg-[linear-gradient(90deg,rgba(229,158,44,0.2)_0%,rgba(229,158,44,0)_63.5%)]"
                                  }`}
                                >
                                  <div className="flex flex-col gap-2 p-4">
                                    <div className="relative flex items-center justify-start">
                                      <div
                                        className={`w-10 h-10 ${
                                          idx % 2 === 0
                                            ? "bg-[#26AD35]"
                                            : "bg-[#E59E2C]"
                                        } rounded-full`}
                                      />
                                      <p
                                        class={`absolute left-1 rounded-[5px] ${
                                          idx % 2 === 0
                                            ? "bg-[linear-gradient(90deg,#26AD35_0%,#077A15_100%)]"
                                            : "bg-[linear-gradient(90deg,#E59E2C_0%,#A36B12_100%)]"
                                        } w-fit sora-regular text-sm text-white px-3 py-1 capitalize`}
                                      >
                                        Response Tips
                                      </p>
                                    </div>
                                    <div className="w-full flex flex-col items-start gap-2">
                                      <div className="w-full flex items-start gap-2">
                                        <div className="w-16 hg-16 p-1 border border-solid border-white rounded-full">
                                          <Image
                                            src={personaExtra}
                                            alt="personaExtra"
                                            className="w-full h-full rounded-full"
                                          />
                                        </div>
                                        <div className="flex flex-col w-[80%]">
                                          <h1 className="text-white text-[20px] m-plus-rounded-1c-regular">
                                            Here's your coaching feedback:
                                          </h1>
                                        </div>
                                      </div>
                                      <div
                                        className="text-white text-[14px] m-plus-rounded-1c-light cursor-pointer"
                                        onClick={() => {
                                          if (showCoachingData === "") {
                                            setShowCoachingData(v?.id);
                                          } else {
                                            setShowCoachingData("");
                                          }
                                        }}
                                        dangerouslySetInnerHTML={{
                                          __html:
                                            showCoachingData !== ""
                                              ? v?.coaching_feedback
                                              : v?.coaching_feedback.slice(
                                                  0,
                                                  80
                                                ) + "...",
                                        }}
                                      />
                                    </div>
                                    {coachingAccept.some(
                                      (val) => val?.id === v?.id
                                    ) ? null : (
                                      <div className="w-full flex items-center justify-end gap-2">
                                        <div
                                          onClick={() =>
                                            setCoachingAccept((pre) => [
                                              ...pre,
                                              { id: v?.id },
                                            ])
                                          }
                                          class="bg-[linear-gradient(90deg,#26AD35_0%,#0C7618_100%)] flex items-center gap-1 px-2 pt-0.5 pb-1 rounded-full w-fit cursor-pointer"
                                        >
                                          <p className="text-white text-[12px]">
                                            Check
                                          </p>
                                          <CheckCircleOutlineOutlinedIcon className="text-white !text-[17px]" />
                                        </div>
                                        <div
                                          onClick={() => {
                                            setCoachingData((prev) =>
                                              prev.filter(
                                                (item) => item.id !== v?.id
                                              )
                                            );
                                          }}
                                          class="bg-[linear-gradient(90deg,#CF2427_0%,#ED3B3E_100%)] flex items-center gap-1 px-2 pt-0.5 pb-1 rounded-full w-fit cursor-pointer"
                                        >
                                          <p className="text-white text-[12px]">
                                            Ignore
                                          </p>
                                          <CheckCircleOutlineOutlinedIcon className="text-white !text-[17px]" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <p
                                    class={`absolute right-0 top-4 ${
                                      coachingAccept.some(
                                        (val) => val?.id === v?.id
                                      )
                                        ? "bg-[linear-gradient(90deg,rgba(38,173,53,0.8)_0%,rgba(38,173,53,0)_100%)]"
                                        : "bg-[linear-gradient(90deg,rgba(207,36,39,0.8)_0%,rgba(207,36,39,0)_100%)]"
                                    } w-fit sora-regular text-[12px] text-white px-2.5 py-1 capitalize`}
                                  >
                                    Acknowledged
                                  </p>
                                </div>
                              ))
                            : null}
                          {/* <div class="z-10 absolute bottom-0 bg-[linear-gradient(0deg,#262D3E_0%,rgba(38,45,62,0)_100%)] w-[calc(100%_-_8px)] h-[20vh]"></div> */}
                        </div>
                      </div>

                      {/* <FormControlLabel
                        defaultChecked
                        value="end"
                        control={
                          <Radio
                            checked={true}
                            sx={{
                              cursor: "default",
                              color: "#FFDE5A",
                              "&.Mui-checked": {
                                color: "#FFDE5A", // checked color
                              },
                            }}
                          />
                        }
                        label={
                          <p className="sora-semilight text-sm">
                            RealSales Coaching Panel:
                          </p>
                        }
                        sx={{
                          cursor: "default",
                          color: "#FFFFFF", // label text color
                        }}
                      />
                      <div className="flex flex-col gap-2 h-[40vh] overflow-y-auto">
                        {qnaArr?.map((v, i) => (
                          <div key={i} className="w-full flex flex-col gap-1">
                            <div
                              className="bg-[#FFDE5AE5] border-2 border-solid border-[#7d7349] rounded-[5px] p-2 flex items-start gap-1 cursor-pointer"
                              onClick={() => {
                                setOpenAnswer(i);
                              }}
                            >
                              <Image
                                src={ideaIcon}
                                alt="ideaIcon"
                                className=""
                              />
                              <p className="sora-light text-[#060606] text-[15px] mt-1">
                                {v?.question}
                              </p>
                            </div>
                            {openAnswer === i ? (
                              <p
                                className="bg-[#00000000] border-2 border-solid border-[#7d7349] rounded-[5px] py-2 px-3 flex items-start gap-1 m-plus-rounded-1c-regular text-white text-[14px]"
                                onClick={() => {}}
                              >
                                {v?.answer}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div> */}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {/* Audio element removed - ElevenLabs WebSocket handles audio internally */}
      {/* <Modal open={isChatPosting}>
        <Box className="h-screen w-full flex items-center justify-center">
          <div className="w-full flex items-center justify-center">
            <div class="h-20 w-20 rounded-full border-8 border-white border-t-[#FFE942] animate-spin"></div>
          </div>
        </Box>
      </Modal> */}
      <CommonModal
        width={width > 720 ? "80%" : "90%"}
        open={viewDoc}
        onClose={() => setViewDoc(false)}
      >
        <div>
          <h1 className="w-full text-center text-2xl sora-medium mb-4">
            Used Files
          </h1>
          {addDocTextAll?.length
            ? addDocTextAll.map((v, i) => (
                <Accordion key={i} className="border border-solid border-black mb-1">
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography
                      component="span"
                      className="text-lg m-plus-rounded-1c-medium"
                    >
                      {v?.filename}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className="text-base m-plus-rounded-1c-regular">
                    {v?.summary}
                  </AccordionDetails>
                </Accordion>
              ))
            : null}
        </div>
      </CommonModal>
    </div>
  );
};

export default Chat;
