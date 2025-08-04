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

  // Load voices asynchronously with a promise
  const loadVoicesForCameroon = () => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('Voices loaded immediately:', voices.length);
        resolve(voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          const loadedVoices = window.speechSynthesis.getVoices();
          console.log('Voices loaded asynchronously:', loadedVoices.length);
          resolve(loadedVoices);
        };
      }
    });
  };

  // Enhanced voice selection for African accents
  const findCameroonFriendlyVoice = (voices, language) => {
    const isEnglish = !language.startsWith('fr');
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));

    const voicePreferences = isEnglish
      ? [
          voice => voice.lang === 'en-ZA',
          voice => voice.lang === 'en-NG',
          voice => voice.lang === 'en-KE',
          voice => voice.lang === 'en-GH',
          voice => voice.lang === 'en-CM',
          voice => voice.lang.startsWith('en') && 
                   /nkosana|thabo|kanyinsola|adaora|zara|amara|kofi|akosua|deep|warm|rich|bass/i.test(voice.name),
          voice => voice.lang === 'en-US' && 
                   /aaron|fred|junior|ralph|kathy|princess|cellos|bahh/i.test(voice.name),
          voice => voice.lang.startsWith('en')
        ]
      : [
          voice => voice.lang === 'fr-CM',
          voice => voice.lang === 'fr-SN',
          voice => voice.lang === 'fr-CI',
          voice => voice.lang === 'fr-ML',
          voice => voice.lang === 'fr-BF',
          voice => voice.lang.startsWith('fr') && 
                   /aminata|fatou|mariama|aicha|khadija|binta|coumba|rama|grave|profond|chaud|riche/i.test(voice.name),
          voice => voice.lang === 'fr-FR' && !/marie|julie|celine/i.test(voice.name),
          voice => voice.lang === 'fr-CA',
          voice => voice.lang.startsWith('fr')
        ];

    for (const preference of voicePreferences) {
      const matchingVoice = voices.find(preference);
      if (matchingVoice) {
        console.log(`Selected ${isEnglish ? 'English' : 'French'} voice:`, matchingVoice.name, matchingVoice.lang);
        return matchingVoice;
      }
    }

    console.log('No suitable African voice found, using default browser voice');
    return voices.find(voice => voice.lang.startsWith(isEnglish ? 'en' : 'fr')) || null;
  };

  // Preprocess text for natural African speech
  const prepareTextForSpeech = (text) => {
    if (!text) return '';
    let cleanedText = text.replace(/[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Modifier_Base}\p{Emoji_Component}\u{200D}\u{FE0F}]+/gu, '').trim();
    cleanedText = cleanedText.replace(/[.!?]/g, '$& ');
    cleanedText = cleanedText.replace(/,/g, ', ');
    return cleanedText;
  };

  // Enhanced language detection for African context
  const detectCameroonLanguagePreference = (text, userLanguage) => {
    const africanFrenchIndicators = [
      'bonjour', 'bonsoir', 'salut', 'comment', 'allez', 'vous', 'ça', 'va',
      'merci', 'beaucoup', 'au revoir', 'oui', 'non', 'peut-être', 'pourquoi',
      'comment', 'quand', 'où', 'qui', 'quoi', 'pardon', 'excusez', 'moi',
      'santé', 'maladie', 'docteur', 'hôpital', 'médicament', 'traitement',
      'foufou', 'ndolé', 'poulet', 'poisson', 'marché', 'village', 'famille',
      'frère', 'sœur', 'mama', 'papa', 'école', 'travail', 'argent', 'temps'
    ];

    const africanEnglishIndicators = [
      'hello', 'good', 'morning', 'evening', 'how', 'are', 'you', 'fine',
      'thank', 'welcome', 'please', 'sorry', 'excuse', 'me', 'yes', 'no',
      'health', 'doctor', 'hospital', 'medicine', 'treatment', 'disease',
      'small', 'no', 'wahala', 'greet', 'family', 'brother', 'sister',
      'mother', 'father', 'school', 'work', 'money', 'time', 'food', 'water'
    ];

    const textLower = text.toLowerCase();
    const frenchMatches = africanFrenchIndicators.filter(word => textLower.includes(word)).length;
    const englishMatches = africanEnglishIndicators.filter(word => textLower.includes(word)).length;

    if (userLanguage?.startsWith('fr')) return 'fr-CM';
    if (userLanguage?.startsWith('en')) return 'en-ZA';
    return frenchMatches > englishMatches ? 'fr-CM' : 'en-ZA';
  };

  // Enhanced speech synthesis with African characteristics
  const speakTextCameroonStyle = (text, language = 'en-US') => {
    return new Promise(async (resolve, reject) => {
      window.speechSynthesis.cancel();

      const cleanedText = prepareTextForSpeech(text);
      if (!cleanedText) {
        reject(new Error('No valid text to speak'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const targetLang = language.startsWith('fr') ? 'fr-CM' : 'en-ZA';
      utterance.lang = targetLang;

      const voices = await loadVoicesForCameroon();
      const selectedVoice = findCameroonFriendlyVoice(voices, language);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      const isEnglish = !language.startsWith('fr');
      utterance.rate = isEnglish ? 0.75 : 0.72;
      utterance.pitch = isEnglish ? 0.9 : 0.92;
      utterance.volume = 0.9;

      if (cleanedText.includes('!')) {
        utterance.pitch = isEnglish ? 1.0 : 1.05;
        utterance.rate = isEnglish ? 0.7 : 0.68;
      } else if (cleanedText.includes('?')) {
        utterance.pitch = isEnglish ? 1.05 : 1.08;
      }
      if (cleanedText.length > 200) {
        utterance.rate += 0.05;
      } else if (cleanedText.length < 50) {
        utterance.rate -= 0.05;
        utterance.pitch -= 0.05;
      }

      utterance.onstart = () => {
        console.log(`Speech started in ${utterance.lang} with voice: ${utterance.voice?.name}`);
        if (isListening) {
          wasListeningRef.current = true;
          setIsListening(false);
          SpeechRecognition.stopListening();
          SpeechRecognition.abortListening();
          console.log('Mic stopped during speech playback');
        }
        setAudioError(null);
      };

      utterance.onend = () => {
        console.log('Speech ended');
        if (wasListeningRef.current && networkStatus === 'online') {
          setIsListening(true);
          const listeningLang = language.startsWith('fr') ? 'fr-FR' : 'en-US';
          SpeechRecognition.startListening({ 
            continuous: true, 
            interimResults: true, 
            language: listeningLang
          });
          console.log('Mic restarted after speech playback');
        }
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        reject(new Error(`Speech synthesis failed: ${error.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  // Updated TTS function
  const generateTtsAudio = async (text, language = 'en') => {
    if (!text || text.trim() === '') {
      return [null, 'Invalid or empty text for audio generation'];
    }

    if (!('speechSynthesis' in window)) {
      return [null, 'Speech synthesis not supported in this browser'];
    }

    try {
      const africanLanguage = detectCameroonLanguagePreference(text, language);
      await speakTextCameroonStyle(text, africanLanguage);
      return [true, null];
    } catch (error) {
      console.error('TTS error:', error);
      return [null, error.message];
    }
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

    const detectedLang = user?.language || detectCameroonLanguagePreference(transcript || '', user?.language);
    const listeningLang = detectedLang.startsWith('fr') ? 'fr-FR' : 'en-US'; // Use fr-FR as fr-CM may not be supported

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
        setAudioError('Failed to stop speech recognition. Please try again.');
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
        language: listeningLang
      });
      console.log(`Mic started with language: ${listeningLang}`);
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
          const detectedLang = detectCameroonLanguagePreference(finalTranscript, user?.language);
          const listeningLang = detectedLang.startsWith('fr') ? 'fr-FR' : 'en-US';
          SpeechRecognition.startListening({ 
            continuous: true, 
            interimResults: true, 
            language: listeningLang
          });
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
          setAudioError('Failed to stop speech recognition due to network issue.');
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

  useEffect(() => {
    if ('speechSynthesis' in window) {
      loadVoicesForCameroon().then(voices => {
        console.log(`Loaded ${voices.length} voices for Cameroon users`);
        const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        console.log(`French voices: ${frenchVoices.map(v => v.name).join(', ')}`);
        console.log(`English voices: ${englishVoices.map(v => v.name).join(', ')}`);
      }).catch(error => {
        console.error('Error loading voices:', error);
        setAudioError('Failed to load voices. Please try again later.');
      });
    } else {
      console.warn('Speech synthesis not supported');
      setAudioError('Voice features not supported. Please use Chrome, Edge, or Safari.');
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
          const detectedLang = detectCameroonLanguagePreference(cleanText, user?.language);
          const [audioSuccess, audioError] = await generateTtsAudio(cleanText, detectedLang);
          if (!audioSuccess) {
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