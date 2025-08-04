import React, { useState, useEffect, useRef, createContext, useCallback, useMemo } from 'react';
import { Mic, Send, User, Heart, Menu, X, Edit3, Moon, Sun, Phone, Calendar, Activity, WifiOff } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import StatusIndicator from './components/homepagecomponents/StatusIndicator';
import MessageBubble from './components/homepagecomponents/MessageBubble';
import Sidebar from './components/homepagecomponents/Sidebar';
import InputArea from './components/homepagecomponents/InputArea';
import Navbar from './components/homepagecomponents/Navbar';
import { useAuth } from './App';

// Create a context for resetting messages
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
  const [micPermission, setMicPermission] = useState('unknown');
  const messagesEndRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const messageIdCounter = useRef(1);
  const wasListeningRef = useRef(false);
  const isProcessingAudioRef = useRef(false);
  const lastTranscriptRef = useRef('');
  const speechTimeoutRef = useRef(null);

  const { transcript, interimTranscript, finalTranscript, resetTranscript, listening } = useSpeechRecognition();

  // Check microphone permission
  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setMicPermission(result.state);
        
        result.addEventListener('change', () => {
          setMicPermission(result.state);
          if (result.state === 'denied' && isListening) {
            handleStopListening();
            setAudioError('Microphone permission denied. Please enable in browser settings.');
          }
        });
        
        return result.state !== 'denied';
      } else {
        // Fallback for browsers without permissions API
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicPermission('granted');
          return true;
        } catch (error) {
          setMicPermission('denied');
          return false;
        }
      }
    } catch (error) {
      console.warn('Could not check microphone permission:', error);
      setMicPermission('unknown');
      return true; // Assume granted if can't check
    }
  }, [isListening]);

  // Debounced function to prevent rapid state changes
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

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

  const clearAllTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  };

  const handleStopListening = useCallback(() => {
    console.log('Stopping listening');
    setIsListening(false);
    setIsMicInput(false);
    setStatus('');
    setShowStatus(false);
    clearAllTimers();
    
    try {
      SpeechRecognition.stopListening();
      SpeechRecognition.abortListening();
    } catch (error) {
      console.error('Error stopping SpeechRecognition:', error);
    }
    
    resetTranscript();
    lastTranscriptRef.current = '';
    console.log('Voice input fully stopped');
  }, [resetTranscript]);

  const handleStartListening = useCallback(async () => {
    console.log('Starting listening');
    
    // Check network status
    if (networkStatus === 'offline') {
      setAudioError('No internet connection. Voice input requires an active connection.');
      return;
    }

    // Check browser support
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      setAudioError('Your browser does not support speech recognition.');
      return;
    }

    // Check microphone permission
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      setAudioError('Microphone permission is required for voice input.');
      return;
    }

    // Clear any existing errors and timers
    setAudioError(null);
    clearAllTimers();
    
    // Reset state
    resetTranscript();
    lastTranscriptRef.current = '';
    
    // Start listening
    setIsListening(true);
    setIsMicInput(true);
    setStatus('listening...');
    setShowStatus(true);
    
    try {
      SpeechRecognition.startListening({ 
        continuous: true, 
        interimResults: true, 
        language: user?.language || 'en-US' 
      });
      console.log('Voice input started successfully');
    } catch (error) {
      console.error('Error starting SpeechRecognition:', error);
      setAudioError('Failed to start voice input. Please try again.');
      handleStopListening();
    }
  }, [networkStatus, user?.language, checkMicrophonePermission, resetTranscript, handleStopListening]);

  const playAudio = (base64Audio) => {
    if (!base64Audio) {
      console.warn('No audio data to play');
      setAudioError('No audio data received. Displaying text response.');
      return;
    }
    
    try {
      isProcessingAudioRef.current = true;
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      
      audio.onplay = () => {
        console.log('Audio playback started, isListening:', isListening);
        setAudioError(null);
        if (isListening) {
          wasListeningRef.current = true;
          handleStopListening();
          console.log('Voice input paused during audio playback');
        } else {
          wasListeningRef.current = false;
        }
      };
      
      audio.onended = () => {
        console.log('Audio playback ended, wasListening:', wasListeningRef.current);
        isProcessingAudioRef.current = false;
        
        // Resume listening if it was active before and network is online
        if (wasListeningRef.current && networkStatus === 'online') {
          setTimeout(() => {
            handleStartListening();
            console.log('Voice input resumed after audio playback');
          }, 500); // Small delay to ensure clean transition
        }
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        isProcessingAudioRef.current = false;
        setAudioError('Failed to play audio response. Displaying text response.');
      };
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        isProcessingAudioRef.current = false;
        setAudioError('Failed to play audio response. Displaying text response.');
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
      isProcessingAudioRef.current = false;
      setAudioError('Error setting up audio playback. Displaying text response.');
    }
  };

  const handleToggleListening = useCallback(() => {
    console.log('Toggling listening:', isListening ? 'Stopping' : 'Starting');
    
    if (isListening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  }, [isListening, handleStartListening, handleStopListening]);

  // Debounced version to prevent rapid clicks
  const debouncedToggleListening = useMemo(
    () => debounce(handleToggleListening, 300),
    [handleToggleListening]
  );

  // Handle transcript processing with improved timing
  const processTranscript = useCallback((transcript) => {
    if (!transcript.trim() || transcript === lastTranscriptRef.current) {
      return;
    }
    
    lastTranscriptRef.current = transcript;
    clearAllTimers();
    
    // Set a timeout to process the transcript after a pause in speech
    silenceTimerRef.current = setTimeout(() => {
      if (transcript.trim() && isListening && !isProcessingAudioRef.current) {
        console.log('Processing final transcript:', transcript);
        setIsMicInput(true);
        handleSendMessage(transcript.trim());
        resetTranscript();
        lastTranscriptRef.current = '';
        
        // Restart listening after sending message
        if (networkStatus === 'online') {
          speechTimeoutRef.current = setTimeout(() => {
            if (!isProcessingAudioRef.current) {
              handleStartListening();
            }
          }, 1000);
        }
      }
    }, 2500); // Slightly reduced timeout for better responsiveness
  }, [isListening, networkStatus, resetTranscript]);

  // Initialize microphone permission check
  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

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

  // Handle final transcript with improved processing
  useEffect(() => {
    if (finalTranscript.trim() && isListening && !isProcessingAudioRef.current) {
      console.log('Final transcript received:', finalTranscript);
      processTranscript(finalTranscript);
    }
  }, [finalTranscript, isListening, processTranscript]);

  // Handle network status changes with improved cleanup
  useEffect(() => {
    const handleNetworkChange = () => {
      const newStatus = navigator.onLine ? 'online' : 'offline';
      console.log('Network status changed:', newStatus);
      setNetworkStatus(newStatus);
      
      if (newStatus === 'offline' && isListening) {
        handleStopListening();
        setAudioError('No internet connection. Voice input requires an active connection.');
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      clearAllTimers();
      
      if (isListening) {
        try {
          SpeechRecognition.stopListening();
          SpeechRecognition.abortListening();
        } catch (error) {
          console.error('Error stopping SpeechRecognition on unmount:', error);
        }
      }
    };
  }, [isListening, handleStopListening]);

  const handleSendMessage = async (text, retryCount = 0) => {
    console.log('handleSendMessage called with text:', text, 'isMicInput:', isMicInput, 'retryCount:', retryCount);
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

    console.log('Sending POST request to:', url, 'with body:', { message: text, isMicInput });

    const maxRetries = 3;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ message: text, isMicInput }),
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
          if (data.audio) {
            const cleanText = stripEmojis(
              data.messages.find(
                (msg) => !msg.isUser && msg.timestamp === data.messages[data.messages.length - 1].timestamp
              )?.text
            );
            console.log('Playing audio for cleaned text:', cleanText);
            playAudio(data.audio);
          } else if (retryCount < maxRetries) {
            console.warn(`No audio received, retrying (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => handleSendMessage(text, retryCount + 1), 1000 * (retryCount + 1));
            return;
          } else {
            console.warn('No audio received after max retries, falling back to text');
            setAudioError(data.audio_error || 'Voice response unavailable. Displaying text response.');
            // Ensure the AI response is displayed
            const aiResponse = data.messages.find((msg) => !msg.isUser && msg.timestamp === data.messages[data.messages.length - 1].timestamp);
            if (aiResponse && aiResponse.text) {
              setMessages((prev) => [...prev.filter((m) => m.id !== newMessage.id), ...formattedMessages]);
            }
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
          setAudioError(data.audio_error || 'Voice response unavailable. Displaying text response.');
        }
      }
    } catch (error) {
      console.error('Error during POST request:', error);
      if (retryCount < maxRetries) {
        console.warn(`Request failed, retrying (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => handleSendMessage(text, retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      console.error('Max retries reached, giving up');
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
              {micPermission === 'denied' && (
                <div className="flex items-center text-red-500 mb-2">
                  <Mic className="w-5 h-5 mr-2" />
                  <p className="text-sm font-medium">Microphone permission denied. Please enable in browser settings.</p>
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
                onClick={debouncedToggleListening}
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
              onToggleListening={debouncedToggleListening}
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