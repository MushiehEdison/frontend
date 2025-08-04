import React, { useState, useEffect, useRef, createContext } from 'react';
import { Mic, Send, User, Heart, Menu, X, Edit3, Moon, Sun, Phone, Calendar, Activity, WifiOff } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import StatusIndicator from './components/homepagecomponents/StatusIndicator';
import MessageBubble from './components/homepagecomponents/MessageBubble';
import Sidebar from './components/homepagecomponents/Sidebar';
import InputArea from './components/homepagecomponents/InputArea';
import Navbar from './components/homepagecomponents/Navbar';
import { useAuth } from './App';

export const ChatContext = createContext();

const Home = () => {
  const { user, token, loading } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine ? 'online' : 'offline');
  const [isMicInput, setIsMicInput] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const messagesEndRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const messageIdCounter = useRef(1);
  const wasListeningRef = useRef(false);
  const speechRecognitionRef = useRef(null);
  const lastTranscriptRef = useRef('');
  const isProcessingRef = useRef(false);

  const { transcript, interimTranscript, finalTranscript, resetTranscript, listening } = useSpeechRecognition();

  const generateUniqueId = () => {
    return `msg-${messageIdCounter.current++}`;
  };

  const scrollToBottom = () => {
    console.log('Scrolling to bottom, messages length:', messages.length);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetMessages = () => {
    console.log('Resetting messages');
    setMessages([]);
    messageIdCounter.current = 1;
    localStorage.removeItem('chatMessages');
  };

  const stripEmojis = (text) => {
    if (!text) return '';
    const cleanText = text.replace(/[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Modifier_Base}\p{Emoji_Component}\u{200D}\u{FE0F}]+/gu, '').trim();
    console.log('Original text:', text, 'Cleaned text:', cleanText);
    return cleanText;
  };

  // Enhanced TTS for Cameroonian users with human-friendly, warm tone
  const generateTtsAudio = async (text, language = 'en') => {
    if (!text || text.trim() === '') {
      return [null, 'Invalid or empty text for audio generation'];
    }

    // Check if Web Speech API is supported
    if (!('speechSynthesis' in window)) {
      return [null, 'Speech synthesis not supported in this browser'];
    }

    try {
      // Use Web Speech API with Cameroon-friendly settings
      await speakTextCameroonStyle(text, language);
      return [true, null]; // Success indicator
    } catch (error) {
      console.error('TTS error:', error);
      return [null, error.message];
    }
  };

  const speakTextCameroonStyle = (text, language = 'en-US') => {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Clean and prepare text for more natural speech
      const cleanedText = prepareTextForSpeech(text);
      
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      
      // Set language based on user preference
      if (language.startsWith('fr')) {
        utterance.lang = 'fr-FR'; // French
      } else {
        utterance.lang = 'en-GB'; // British English (closer to Cameroon English accent)
      }
      
      // Optimize for warm, human-like speech (Cameroon style)
      utterance.rate = 0.75;    // Slower, more conversational pace
      utterance.pitch = 1.0;    // Natural pitch
      utterance.volume = 0.85;  // Comfortable volume
      
      // Add natural pauses and emphasis
      addNaturalEmphasis(utterance, cleanedText);

      utterance.onstart = () => {
        console.log('Speech started in', utterance.lang);
        if (isListening) {
          wasListeningRef.current = true;
          setIsListening(false);
          SpeechRecognition.stopListening();
          SpeechRecognition.abortListening();
          console.log('Mic stopped during speech playback');
        } else {
          wasListeningRef.current = false;
        }
        setAudioError(null);
      };

      utterance.onend = () => {
        console.log('Speech ended, wasListening:', wasListeningRef.current);
        if (wasListeningRef.current && networkStatus === 'online') {
          setIsListening(true);
          SpeechRecognition.startListening({ 
            continuous: true, 
            interimResults: true, 
            language: language.startsWith('fr') ? 'fr-FR' : 'en-US'
          });
          console.log('Mic restarted after speech playback');
        }
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        reject(new Error(`Speech synthesis failed: ${error.error}`));
      };

      // Get the best voice for Cameroon users
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = findCameroonFriendlyVoice(voices, language);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Selected voice:', selectedVoice.name, 'Language:', selectedVoice.lang);
      }

      // Speak with natural rhythm
      window.speechSynthesis.speak(utterance);
    });
  };

  const findCameroonFriendlyVoice = (voices, language) => {
    const isEnglish = !language.startsWith('fr');
    
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
    
    if (isEnglish) {
      // Priority for English (Cameroon uses British-influenced English)
      const englishPreferences = [
        // British English voices (closest to Cameroon English)
        voice => voice.lang === 'en-GB' && 
                 (voice.name.toLowerCase().includes('female') ||
                  voice.name.toLowerCase().includes('woman') ||
                  voice.name.toLowerCase().includes('susan') ||
                  voice.name.toLowerCase().includes('emma') ||
                  voice.name.toLowerCase().includes('kate')),
        
        // Any British English voice
        voice => voice.lang === 'en-GB',
        
        // African English variants if available
        voice => (voice.lang === 'en-ZA' || voice.lang === 'en-KE' || voice.lang === 'en-NG'),
        
        // Warm-sounding US English voices as fallback
        voice => voice.lang === 'en-US' && 
                 (voice.name.toLowerCase().includes('samantha') ||
                  voice.name.toLowerCase().includes('allison') ||
                  voice.name.toLowerCase().includes('susan') ||
                  voice.name.toLowerCase().includes('karen')),
        
        // Any English voice
        voice => voice.lang.startsWith('en'),
      ];

      for (const preference of englishPreferences) {
        const matchingVoice = voices.find(preference);
        if (matchingVoice) {
          console.log('Selected English voice:', matchingVoice.name);
          return matchingVoice;
        }
      }
    } else {
      // Priority for French (Cameroon uses French)
      const frenchPreferences = [
        // French female voices (warmer tone)
        voice => voice.lang.startsWith('fr') && 
                 (voice.name.toLowerCase().includes('female') ||
                  voice.name.toLowerCase().includes('amelie') ||
                  voice.name.toLowerCase().includes('virginie') ||
                  voice.name.toLowerCase().includes('claire') ||
                  voice.name.toLowerCase().includes('marie')),
        
        // Any French voice
        voice => voice.lang.startsWith('fr'),
        
        // French Canadian as fallback
        voice => voice.lang === 'fr-CA',
      ];

      for (const preference of frenchPreferences) {
        const matchingVoice = voices.find(preference);
        if (matchingVoice) {
          console.log('Selected French voice:', matchingVoice.name);
          return matchingVoice;
        }
      }
    }

    return null;
  };

  const prepareTextForSpeech = (text) => {
    if (!text) return '';
    
    let cleanText = text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      
      // Add natural pauses
      .replace(/\./g, '. ')
      .replace(/,/g, ', ')
      .replace(/;/g, '; ')
      .replace(/:/g, ': ')
      .replace(/\?/g, '? ')
      .replace(/!/g, '! ')
      
      // Handle common abbreviations for better pronunciation
      .replace(/\bDr\./gi, 'Doctor')
      .replace(/\bMr\./gi, 'Mister')
      .replace(/\bMrs\./gi, 'Missus')
      .replace(/\bMs\./gi, 'Miss')
      .replace(/\betc\./gi, 'etcetera')
      .replace(/\bi\.e\./gi, 'that is')
      .replace(/\be\.g\./gi, 'for example')
      
      // Handle numbers for more natural speech
      .replace(/\b(\d+)%/g, '$1 percent')
      .replace(/\$(\d+)/g, '$1 dollars')
      
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();

    return cleanText;
  };

  const addNaturalEmphasis = (utterance, text) => {
    // Adjust speech parameters based on content type
    if (text.includes('!')) {
      utterance.rate = 0.7; // Slower for emphasis
      utterance.pitch = 1.1; // Slightly higher for excitement
    }
    
    if (text.includes('?')) {
      utterance.pitch = 1.05; // Rising intonation for questions
    }
    
    if (text.length > 200) {
      utterance.rate = 0.8; // Slightly faster for longer texts
    }
    
    if (text.length < 50) {
      utterance.rate = 0.7; // Slower for short responses
    }
  };

  // Enhanced playAudio function with Cameroon-friendly features
  const playAudio = async (audioData, text) => {
    if (audioData === true) {
      console.log('Speech synthesis completed successfully');
      return;
    }
    
    if (text) {
      try {
        // Detect language preference (French or English)
        const userLanguage = user?.language || 'en-US';
        const isUserFrench = userLanguage.startsWith('fr') || 
                            text.match(/\b(bonjour|salut|merci|au revoir|oui|non|comment|pourquoi)\b/i);
        
        const speechLanguage = isUserFrench ? 'fr-FR' : 'en-GB';
        
        await speakTextCameroonStyle(text, speechLanguage);
      } catch (error) {
        console.error('Error playing speech:', error);
        setAudioError('Voice playback failed. Text response displayed.');
      }
    } else {
      setAudioError('No text available for speech synthesis.');
    }
  };

  // Voice loading with Cameroon-specific preferences
  const loadVoicesForCameroon = () => {
    return new Promise((resolve) => {
      const checkVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Log available voices for debugging
          console.log('Available voices for Cameroon users:');
          voices.forEach(voice => {
            if (voice.lang.startsWith('en') || voice.lang.startsWith('fr')) {
              console.log(`- ${voice.name} (${voice.lang})`);
            }
          });
          resolve(voices);
        } else {
          // Voices not loaded yet, wait for the event
          window.speechSynthesis.onvoiceschanged = checkVoices;
        }
      };
      checkVoices();
    });
  };

  // Language detection helper
  const detectCameroonLanguagePreference = (text, userLanguage) => {
    // Common French words used in Cameroon
    const frenchIndicators = [
      'bonjour', 'bonsoir', 'salut', 'comment', 'allez', 'vous', 'ça', 'va',
      'merci', 'beaucoup', 'au revoir', 'oui', 'non', 'peut-être', 'pourquoi',
      'comment', 'quand', 'où', 'qui', 'quoi', 'pardon', 'excusez', 'moi',
      'santé', 'maladie', 'docteur', 'hôpital', 'médicament', 'traitement'
    ];
    
    // Common English words with Cameroon context
    const englishIndicators = [
      'hello', 'good', 'morning', 'evening', 'how', 'are', 'you', 'fine',
      'thank', 'welcome', 'please', 'sorry', 'excuse', 'me', 'yes', 'no',
      'health', 'doctor', 'hospital', 'medicine', 'treatment', 'disease'
    ];
    
    const textLower = text.toLowerCase();
    const frenchMatches = frenchIndicators.filter(word => textLower.includes(word)).length;
    const englishMatches = englishIndicators.filter(word => textLower.includes(word)).length;
    
    // User preference takes priority
    if (userLanguage?.startsWith('fr')) return 'fr-FR';
    if (userLanguage?.startsWith('en')) return 'en-GB';
    
    // Auto-detect based on content
    return frenchMatches > englishMatches ? 'fr-FR' : 'en-GB';
  };

  const handleToggleListening = () => {
    console.log('Toggling listening:', isListening ? 'Stopping' : 'Starting');
    if (networkStatus === 'offline') {
      console.log('Cannot toggle listening: Offline');
      setAudioError('No internet connection. Voice input requires an active connection.');
      return;
    }

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      console.log('Browser does not support speech recognition');
      setAudioError('Your browser does not support speech recognition.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      setIsMicInput(false);
      setStatus('');
      setShowStatus(false);
      resetTranscript();
      lastTranscriptRef.current = '';
      isProcessingRef.current = false;
      try {
        SpeechRecognition.stopListening();
        SpeechRecognition.abortListening();
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.onresult = null;
          speechRecognitionRef.current.onerror = null;
          speechRecognitionRef.current.onend = null;
          speechRecognitionRef.current = null;
          console.log('SpeechRecognition instance cleared');
        }
      } catch (error) {
        console.error('Error stopping SpeechRecognition:', error);
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
        console.log('Silence timer cleared');
      }

      console.log('Mic fully stopped and reset');
    } else {
      setIsListening(true);
      setIsMicInput(true);
      setAudioError(null);
      setStatus('listening...');
      setShowStatus(true);
      resetTranscript();
      lastTranscriptRef.current = '';
      isProcessingRef.current = false;
      speechRecognitionRef.current = SpeechRecognition.getRecognition();
      SpeechRecognition.startListening({ 
        continuous: true, 
        interimResults: true, 
        language: user?.language || 'en-US' 
      });
      console.log('Mic started with new SpeechRecognition instance');
    }
  };

  useEffect(() => {
    console.log('Saving messages to localStorage:', messages);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!user || loading || !token) {
      console.log('Skipping fetch: user, loading, or token missing', { user, loading, token });
      return;
    }

    const isValidId = conversationId && /^\d+$/.test(conversationId);
    console.log('Fetching messages for conversationId:', conversationId, 'Valid:', isValidId);
    const url = isValidId 
      ? `https://backend-b5jw.onrender.com/api/auth/conversation/${conversationId}`
      : 'https://backend-b5jw.onrender.com/api/auth/conversation';

    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })
      .then((res) => {
        console.log('Fetch response status:', res.status);
        if (!res.ok) {
          throw new Error(`Failed to fetch messages: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched messages data:', data);
        const fetchedMessages = data.messages && Array.isArray(data.messages)
          ? data.messages.map((msg, index) => ({
              ...msg,
              id: msg.id || `msg-${index + 1}`,
              timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }))
          : [];
        console.log('Setting messages:', fetchedMessages);
        setMessages(fetchedMessages);
        messageIdCounter.current = fetchedMessages.length + 1;
        if (!isValidId && data.id) {
          console.log('Navigating to valid conversation ID:', data.id);
          navigate(`/chat/${data.id}`);
        }
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
        setMessages([]);
        messageIdCounter.current = 1;
        if (!isValidId) {
          console.log('Invalid conversationId, clearing local storage');
          localStorage.removeItem('chatMessages');
        }
      });
  }, [user, loading, token, conversationId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (finalTranscript.trim() && finalTranscript !== lastTranscriptRef.current && !isProcessingRef.current) {
      console.log('Final transcript received:', finalTranscript, 'isMicInput:', isMicInput);
      lastTranscriptRef.current = finalTranscript;
      isProcessingRef.current = true;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(() => {
        setIsMicInput(true);
        handleSendMessage(finalTranscript.trim());
        resetTranscript();
        lastTranscriptRef.current = '';
        isProcessingRef.current = false;
        if (isListening && networkStatus === 'online') {
          SpeechRecognition.startListening({ continuous: true, interimResults: true, language: user?.language || 'en-US' });
        }
      }, 5000);
    }
  }, [finalTranscript, isListening, networkStatus]);

  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
      if (!navigator.onLine && isListening) {
        setIsListening(false);
        setIsMicInput(false);
        setStatus('');
        setShowStatus(false);
        resetTranscript();
        lastTranscriptRef.current = '';
        isProcessingRef.current = false;
        try {
          SpeechRecognition.stopListening();
          SpeechRecognition.abortListening();
          if (speechRecognitionRef.current) {
            speechRecognitionRef.current.onresult = null;
            speechRecognitionRef.current.onerror = null;
            speechRecognitionRef.current.onend = null;
            speechRecognitionRef.current = null;
          }
        } catch (error) {
          console.error('Error stopping SpeechRecognition on offline:', error);
        }
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        setAudioError('No internet connection. Voice input requires an active connection.');
        console.log('Mic stopped due to offline status');
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (isListening) {
        try {
          SpeechRecognition.stopListening();
          SpeechRecognition.abortListening();
          if (speechRecognitionRef.current) {
            speechRecognitionRef.current.onresult = null;
            speechRecognitionRef.current.onerror = null;
            speechRecognitionRef.current.onend = null;
            speechRecognitionRef.current = null;
          }
        } catch (error) {
          console.error('Error stopping SpeechRecognition on unmount:', error);
        }
      }
    };
  }, [isListening]);

  // Add voice initialization for Cameroon users
  useEffect(() => {
    if ('speechSynthesis' in window) {
      loadVoicesForCameroon().then(voices => {
        console.log(`Loaded ${voices.length} voices for Cameroon users`);
        
        // Show available French and English voices
        const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        
        console.log(`French voices available: ${frenchVoices.length}`);
        console.log(`English voices available: ${englishVoices.length}`);
      });
    } else {
      console.warn('Speech synthesis not supported in this browser');
      setAudioError('Voice features not supported in this browser. Please use Chrome, Firefox, or Safari.');
    }
  }, []);

  const handleSendMessage = async (text) => {
    console.log('handleSendMessage called with text:', text, 'isMicInput:', isMicInput);
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          text: 'Please sign in to send messages.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (isMicInput) {
        setAudioError('Please sign in to use voice features.');
      }
      isProcessingRef.current = false;
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const exp = decoded.exp * 1000;
      if (Date.now() >= exp) {
        console.error('Token is expired');
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            text: 'Your session has expired. Please sign in again.',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        localStorage.removeItem('token');
        navigate('/signin');
        isProcessingRef.current = false;
        return;
      }
    } catch (error) {
      console.error('Invalid token format:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          text: 'Invalid token. Please sign in again.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      localStorage.removeItem('token');
      navigate('/signin');
      isProcessingRef.current = false;
      return;
    }

    const newMessage = {
      id: generateUniqueId(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    console.log('Sent user message:', newMessage);
    setMessages((prev) => [...prev, newMessage]);

    setStatus('framing...');
    setShowStatus(true);

    const isValidId = conversationId && /^\d+$/.test(conversationId);
    const url = isValidId
      ? `https://backend-b5jw.onrender.com/api/auth/conversation/${conversationId}`
      : 'https://backend-b5jw.onrender.com/api/auth/conversation';

    console.log('Sending POST request to:', url, 'with body:', { message: text });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ message: text, isMicInput: isMicInput }),
      });

      console.log('POST response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('POST response data:', data);
      setShowStatus(false);
      if (data.messages && Array.isArray(data.messages)) {
        const formattedMessages = data.messages.map((msg, index) => ({
          ...msg,
          id: msg.id || `msg-${index + 1}`,
          timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        console.log('Setting formatted messages:', formattedMessages);
        setMessages(formattedMessages);
        messageIdCounter.current = formattedMessages.length + 1;
        if (isMicInput) {
          const latestResponse = data.messages.find(
            (msg) => !msg.isUser && msg.timestamp === data.messages[data.messages.length - 1].timestamp
          );
          const cleanText = stripEmojis(latestResponse?.text);
          console.log('Generating audio for response:', cleanText);
          const [audioBase64, audioError] = await generateTtsAudio(cleanText, user?.language || 'en');
          if (audioBase64) {
            console.log('Playing audio response');
            playAudio(audioBase64, cleanText);
          } else {
            console.warn('No audio generated:', audioError);
            setAudioError(audioError || 'Voice response unavailable. Displaying text response.');
          }
        }
        if (!isValidId && data.id) {
          console.log('Navigating to new conversation ID:', data.id);
          navigate(`/chat/${data.id}`);
        }
      } else {
        console.error('No valid messages in response:', data);
        const errorResponse = {
          id: generateUniqueId(),
          text: 'I apologize, but I encountered an issue processing your request. Please try again.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorResponse]);
        if (isMicInput) {
          setAudioError('Voice response unavailable. Displaying text response.');
        }
      }
      isProcessingRef.current = false;
    } catch (error) {
      console.error('Error during POST request:', error);
      setShowStatus(false);
      const errorResponse = {
        id: generateUniqueId(),
        text: `Failed to connect to server: ${error.message}. Your message was sent but not saved. Please try again.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorResponse]);
      if (isMicInput) {
        setAudioError('Failed to connect to server for audio response. Displaying text response.');
      }
      isProcessingRef.current = false;
    }
  };
  const updatedStyles = `
    .ripple-container {
      position: relative;
      width: 100px;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.3);
      width: 60px;
      height: 60px;
      animation: ripple-effect 1.5s infinite ease-out;
    }
    .ripple:nth-child(2) { animation-delay: 0.3s; }
    .ripple:nth-child(3) { animation-delay: 0.6s; }
    @keyframes ripple-effect {
      0% { transform: scale(0); opacity: 0.8; }
      100% { transform: scale(2); opacity: 0; }
    }
    .safe-area-pb {
      padding-bottom: env(safe-area-inset-bottom);
    }
    .listening-overlay {
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
  `;

  return (
    <ChatContext.Provider value={{ resetMessages }}>
      <div className={`min-h-[100dvh] ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300 flex flex-col`}>
        <style>{updatedStyles}</style>
        <Navbar 
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          toggleSidebar={() => setSidebarOpen(true)}
        />
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isDarkMode={isDarkMode}
        />
        <main className="flex-1 pt-16 pb-20 overflow-hidden">
          <div className="container mx-auto px-2 sm:px-4 lg:px-6 max-w-3xl flex flex-col min-h-0 h-full">
            <div className="flex justify-center my-4">
              <StatusIndicator status={status} isVisible={showStatus} />
            </div>
            {audioError && (
              <div className="px-4 text-red-500 text-sm mb-4">
                {audioError}
              </div>
            )}
            <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent px-1">
              <div className="w-full max-w-full">
                {messages.map((message) => (
                  <div key={message.id} className="w-full max-w-full mb-4">
                    <MessageBubble
                      message={message.text}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                    />
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>
        {isListening ? (
          <div className={`fixed bottom-0 left-0 right-0 h-1/3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-t-xl transition-transform duration-300 ease-in-out transform translate-y-0 z-50`}>
            <div className="flex flex-col items-center justify-center h-full px-2 sm:px-4">
              {networkStatus === 'offline' && (
                <div className="flex items-center text-red-500 mb-2">
                  <WifiOff className="w-5 h-5 mr-2" />
                  <p className="text-sm font-medium">No internet connection. Voice input requires an active connection.</p>
                </div>
              )}
              <div className="ripple-container">
                <div className="ripple"></div>
                <div className="ripple"></div>
                <div className="ripple"></div>
                <Mic className={`w-12 h-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} ${listening ? '' : 'opacity-50'}`} />
              </div>
              <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} text-center max-w-full overflow-hidden text-ellipsis`}>
                {transcript || (status === 'listening' ? 'Listening...' : 'Processing...')}
              </p>
              <button
                onClick={handleToggleListening}
                className={`mt-4 p-2 rounded-full border-2 border-red-500 ${isDarkMode ? 'text-red-400 hover:text-white active:text-white' : 'text-red-500 hover:text-white active:text-white'} hover:bg-red-500 active:bg-red-500 transition-colors`}
                aria-label="Stop listening"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 left-0 right-0 bg-inherit px-2 sm:px-4">
            <InputArea
              onSendMessage={handleSendMessage}
              isListening={isListening}
              onToggleListening={handleToggleListening}
              isDarkMode={isDarkMode}
              transcript={transcript}
              interimTranscript={interimTranscript}
            />
          </div>
        )}
      </div>
    </ChatContext.Provider>
  );
};

export default Home;