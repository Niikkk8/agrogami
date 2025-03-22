'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Mic, MicOff, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const VoiceBot = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Google Generative AI
  const genAI = new GoogleGenerativeAI("AIzaSyDv5AsvRiDXJaY8MD1JdQAvU5pjjFK4Zzs");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const suggestions = [
    "Tell me a short story",
    "What's the weather like today?",
    "Give me a recipe for pancakes",
    "Tell me an interesting fact"
  ];

  // Scroll to bottom of chat when history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Initialize speech recognition
  useEffect(() => {
    // Check if the browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    // Set up speech recognition event handlers
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      
      // Automatically send message after voice input
      sendMessage(transcript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    // Clean up on component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const sendMessage = async (messageToSend) => {
    if (!messageToSend.trim()) return;

    setIsLoading(true);
    const userMessage = { type: 'user', content: messageToSend };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');

    try {
      const chat = model.startChat({
        history: chatHistory.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      const result = await chat.sendMessage(messageToSend);
      const response = await result.response;
      const text = await response.text();
      
      const botMessage = { type: 'bot', content: text };
      setChatHistory(prev => [...prev, botMessage]);
      
      // Speak the response
      speakResponse(text);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(message);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMicrophone = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const speakResponse = (text) => {
    // Check if the browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating chat button */}
      <button 
        onClick={toggleModal} 
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          onClick={toggleModal} // Close when clicking outside
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-gray-800 w-full max-w-3xl rounded-xl shadow-2xl border border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Voice Assistant</h2>
              <p className="text-gray-300 text-sm">Ask me anything. I can respond with voice.</p>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 p-4">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index} 
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full border border-gray-700 transition-colors duration-200"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat History */}
            <div 
              ref={chatContainerRef} 
              className="flex-1 p-4 overflow-y-auto max-h-[400px] min-h-[300px] bg-gray-900 bg-opacity-50"
            >
              {chatHistory.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex mb-4 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-800 text-white rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700 flex">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white rounded-full pl-4 pr-12 py-3 outline-none border border-gray-700 focus:border-blue-500"
                  placeholder="Type your message..."
                  value={message}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <button 
                    className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                    onClick={toggleMicrophone}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <button 
                    className="p-2 text-blue-400 hover:text-blue-300 disabled:text-gray-500"
                    onClick={handleSendMessage}
                    disabled={isLoading || !message.trim()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button 
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={toggleModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceBot;