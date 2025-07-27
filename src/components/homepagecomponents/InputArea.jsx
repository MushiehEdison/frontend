import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send } from 'lucide-react';

const InputArea = ({ onSendMessage, isListening, onToggleListening, isDarkMode }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  // Detect Android for Enter key behavior
  const isAndroid = /Android/i.test(navigator.userAgent);

  // Handle keyboard visibility
  useEffect(() => {
    const handleKeyboard = () => {
      if (!containerRef.current) return;
      
      // Use visualViewport to detect keyboard height
      const viewport = window.visualViewport;
      if (viewport) {
        const keyboardHeight = window.innerHeight - viewport.height;
        // Adjust container position
        containerRef.current.style.bottom = `${keyboardHeight}px`;
        // Ensure smooth transition
        containerRef.current.style.transition = 'bottom 0.2s ease-in-out';
      }
    };

    // Fallback for browsers without visualViewport
    const handleResize = () => {
      if (!containerRef.current) return;
      // Approximate keyboard height (adjust as needed)
      const keyboardHeight = window.innerHeight - document.documentElement.clientHeight;
      containerRef.current.style.bottom = `${keyboardHeight > 0 ? keyboardHeight : 0}px`;
    };

    window.visualViewport?.addEventListener('resize', handleKeyboard);
    window.addEventListener('resize', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleKeyboard);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isAndroid) {
        // Non-Android: Enter sends message
        handleSend();
      }
      // Android: Enter adds new line (handled by default textarea behavior)
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

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
            transition: bottom 0.2s ease-in-out;
          }
          .button-transition {
            transition: all 0.2s ease-in-out;
          }
          .textarea-transition {
            transition: height 0.2s ease-in-out;
          }
        `}
      </style>
      <div
        ref={containerRef}
        className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t border-gray-200 p-3 shadow-lg input-container`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter diagnoses..."
                rows={1}
                className={`w-full px-4 py-2.5 pr-10 rounded-3xl border resize-none max-h-32 scrollbar-hide textarea-transition ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`}
                style={{ minHeight: '44px' }}
                aria-label="Message input"
              />
            </div>
            <div className="relative">
              {message.trim() ? (
                <button
                  onClick={handleSend}
                  className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md button-transition active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={onToggleListening}
                  className={`p-3 rounded-full button-transition active:scale-95 ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 scale-105'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white shadow-md`}
                  aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InputArea;