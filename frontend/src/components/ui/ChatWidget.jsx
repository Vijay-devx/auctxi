import React, { useState, useRef, useEffect } from 'react';
import { IconMessageChatbot, IconX, IconSend } from '@tabler/icons-react';
import { api } from '../../services/api';

import ReactMarkdown from 'react-markdown';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AuctXI AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // The API Gateway routes /api/v1/ai to the Python AI service
      const auctionIdMatch = window.location.pathname.match(/live-auction\/([^/]+)/);
      const currentAuctionId = auctionIdMatch ? auctionIdMatch[1] : null;
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ message: userMessage, auctionId: currentAuctionId })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setIsLoading(false); // Stop loading animation since stream is starting
      setMessages(prev => [...prev, { role: 'ai', content: '' }]); // Append empty message for streaming

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finalContent = "";
      
      // Buffer for incomplete SSE lines
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // The last line might be incomplete, so we keep it in the buffer
        buffer = lines.pop() || "";
        
        for (let line of lines) {
          line = line.trim();
          if (line.startsWith('data:')) {
            const dataStr = line.slice(5).trim();
            if (!dataStr) continue;
            try {
              const dataObj = JSON.parse(dataStr);
              if (dataObj.text) {
                finalContent += dataObj.text;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = finalContent;
                  return newMessages;
                });
              }
              if (dataObj.error) {
                finalContent += `\n\n[Error: ${dataObj.error}]`;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = finalContent;
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('SSE JSON parse error:', e, dataStr);
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to the AI service right now.' }]);
      console.error('Chat error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
        >
          <IconMessageChatbot size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[400px] h-[550px] flex flex-col border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-amber-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconMessageChatbot size={24} />
              <h3 className="font-bold">AuctXI AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-amber-100 transition-colors">
              <IconX size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm prose prose-sm ${msg.role === 'user' ? 'bg-amber-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                  {msg.role === 'user' ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-full p-2 flex items-center justify-center transition-colors"
            >
              <IconSend size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
