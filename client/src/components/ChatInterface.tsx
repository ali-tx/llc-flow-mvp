import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  sessionId: string;
  initialMessage: string;
  onFinished: (formData: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, initialMessage, onFinished }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialMessage },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const { data } = await axios.post(`/api/formations/${sessionId}/message`, {
        userMessage: userMsg,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: data.agentResponse }]);

      if (data.requiresSubmission && data.formData) {
        setTimeout(() => {
          onFinished(data.formData);
        }, 1500);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
      <div className="bg-primary p-4 text-white flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-bold">LLC Formation Assistant</h2>
          <p className="text-xs text-white/70">Online & ready to help</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-xs text-muted-foreground font-medium">Assistant is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            input.trim() && !isLoading
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-slate-100 text-slate-400'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
