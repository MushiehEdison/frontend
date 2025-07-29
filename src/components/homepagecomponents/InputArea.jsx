import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, X, MicOff } from 'lucide-react';

const InputArea = ({ onSendMessage, isListening, onToggleListening, isDarkMode, transcript = '', interimTranscript = '' }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const initialHeight = useRef(window.innerHeight);
  const typingTimeoutRef = useRef(null);

  // Detect Android for Enter key behavior
  const isAndroid = /Android/i.test(navigator.userAgent);

  // Handle keyboard visibility with improved logic
  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const keyboardHeight = initialHeight.current - currentHeight;
      
      if (keyboardHeight > 100) { // Only consider significant height changes as keyboard
        document.body.style.paddingBottom = `${Math.min(keyboardHeight, 300)}px`;
        document.body.style.transition = 'padding-bottom 0.3s ease-in-out';
      } else {
        document.body.style.paddingBottom = '0';
      }
    };

    // Debounce resize events
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', debouncedResize);
      document.body.style.paddingBottom = '0';
      document.body.style.transition = '';
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Update message with transcript when listening
  useEffect(() => {
    if (isListening && (transcript || interimTranscript)) {
      const fullTranscript = transcript + (interimTranscript ? ` ${interimTranscript}` : '');
      setMessage(fullTranscript);
      
      // Auto-resize textarea for transcript
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
      }
    }
  }, [transcript, interimTranscript, isListening]);

  // Clear message when stopping listening if it was voice input
  useEffect(() => {
    if (!isListening && message && (transcript || interimTranscript)) {
      // Keep the message for user to review/edit before sending
    }
  }, [isListening]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([30, 10, 30]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey && !isAndroid) {
        e.preventDefault();
        handleSend();
      } else if (e.shiftKey) {
        // Allow Shift+Enter for new line on all platforms
        return;
      }
      // On Android, Enter adds new line by default
    }

    // Handle Escape key to stop listening
    if (e.key === 'Escape' && isListening) {
      onToggleListening();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Typing indicator logic
    setIsTyping(value.length > 0);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing to false after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 120);
      textarea.style.height = newHeight + 'px';
    }
  };

  const handleMicClick = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(isListening ? [50] : [30, 20, 30]);
    }
    
    onToggleListening();
    
    // Focus textarea after stopping listening
    if (isListening && textareaRef.current) {
      setTimeout(() => textareaRef.current.focus(), 100);
    }
  };

  const clearMessage = () => {
    setMessage('');
    setIsTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const hasContent = message.trim().length > 0;
  const showSendButton = hasContent && !isListening;
  const showMicButton = !hasContent || isListening;

  return (
    <>
      <style>
        {`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .input-container {
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .button-transition {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .textarea-transition {
            transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .mic-pulse {
            animation: micPulse 1.5s ease-in-out infinite;
          }
          .mic-recording {
            animation: micRecording 1s ease-in-out infinite alternate;
          }
          @keyframes micPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes micRecording {
            0% { opacity: 0.8; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.1); }
          }
          .voice-indicator {
            background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6);
            background-size: 300% 100%;
            animation: voiceGradient 2s ease-in-out infinite;
          }
          @keyframes voiceGradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .send-button-enter {
            animation: sendButtonEnter 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          @keyframes sendButtonEnter {
            0% { transform: scale(0.8) rotate(-45deg); opacity: 0; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}
      </style>
      
      <div
        className={`fixed bottom-0 left-0 right-0 ${
          isDarkMode 
            ? 'bg-gray-900/95 border-gray-700' 
            : 'bg-white/95 border-gray-200'
        } border-t input-container z-50 safe-area-pb`}
      >
        {/* Voice Input Indicator */}
        {isListening && (
          <div className={`px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full voice-indicator"></div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Listening...
                  </span>
                </div>
                {(transcript || interimTranscript) && (
                  <div className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                    Speaking detected
                  </div>
                )}
              </div>
              <button
                onClick={onToggleListening}
                className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                aria-label="Stop listening"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        )}

        <div className="px-3 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              {/* Main Input Container */}
              <div className="flex-1 relative">
                <div className={`relative rounded-2xl ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-gray-50 border-gray-300'
                } border-2 transition-colors duration-200 ${
                  isListening ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'focus-within:border-blue-500'
                }`}>
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening... Speak now" : "Type a message..."}
                    rows={1}
                    className={`w-full px-4 py-3 pr-12 bg-transparent resize-none max-h-32 scrollbar-hide textarea-transition ${
                      isDarkMode 
                        ? 'text-white placeholder-gray-400' 
                        : 'text-gray-800 placeholder-gray-500'
                    } focus:outline-none`}
                    style={{ minHeight: '44px' }}
                    aria-label="Message input"
                    disabled={isListening}
                  />
                  
                  {/* Clear button for when there's text */}
                  {hasContent && !isListening && (
                    <button
                      onClick={clearMessage}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                          : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                      } transition-colors`}
                      aria-label="Clear message"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Character counter for long messages */}
                {message.length > 100 && (
                  <div className={`text-xs mt-1 text-right ${
                    message.length > 500 
                      ? 'text-red-500' 
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {message.length}/1000
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Send Button */}
                {showSendButton && (
                  <button
                    onClick={handleSend}
                    className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg button-transition active:scale-95 send-button-enter"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}

                {/* Microphone Button */}
                {showMicButton && (
                  <button
                    onClick={handleMicClick}
                    className={`p-3 rounded-full button-transition active:scale-95 shadow-lg ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 mic-recording'
                        : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 mic-pulse'
                    } text-white`}
                    aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Voice Input Preview */}
            {isListening && (transcript || interimTranscript) && (
              <div className={`mt-3 p-3 rounded-xl ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
              } border`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">You said: </span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {transcript}
                  </span>
                  {interimTranscript && (
                    <span className={`italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {interimTranscript}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Help text */}
            <div className={`mt-2 text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {isListening ? (
                "Speak clearly • Press Esc or tap × to stop"
              ) : isAndroid ? (
                "Enter for new line • Tap send button to send"
              ) : (
                "Enter to send • Shift+Enter for new line"
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InputArea;