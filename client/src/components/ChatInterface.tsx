import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  chips?: string[];
}

interface ChatInterfaceProps {
  sessionId: string;
  initialMessage: string;
  initialChips: string[];
  onFinished: (formData: any) => void;
}

// Renders assistant message text — converts **bold** to <strong>
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-none px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-slate-400"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
        />
      ))}
    </div>
  </div>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  initialMessage,
  initialChips,
  onFinished,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: initialMessage, chips: initialChips },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chipsUsed, setChipsUsed] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
      const { data } = await axios.post(`/api/formations/${sessionId}/message`, {
        userMessage: text,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.message, chips: data.chips || [] },
      ]);

      if (data.done && data.formData) {
        setTimeout(() => onFinished(data.formData), 1200);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I'm having trouble connecting right now. Please try again in a moment.",
          chips: [],
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [sessionId, isLoading, onFinished]);

  const handleChipClick = (chip: string, msgIndex: number) => {
    if (isLoading || chipsUsed.has(msgIndex)) return;
    setChipsUsed((prev) => new Set(prev).add(msgIndex));
    sendMessage(chip);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">LLC Formation Assistant</p>
          <p className="text-[11px] text-white/70">Powered by AI · Typically takes 5–10 min</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/80">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-slate-50/60"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <FormattedText text={msg.text} />
                ) : (
                  msg.text
                )}
              </div>

              {/* Quick-reply chips */}
              {msg.role === 'assistant' && msg.chips && msg.chips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-wrap gap-2 mt-2 max-w-[82%]"
                >
                  {msg.chips.map((chip, ci) => (
                    <button
                      key={ci}
                      onClick={() => handleChipClick(chip, i)}
                      disabled={isLoading || chipsUsed.has(i)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        chipsUsed.has(i)
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-white'
                          : 'border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95 cursor-pointer shadow-sm'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Type your message or choose an option above…"
          disabled={isLoading}
          className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 disabled:opacity-60"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md hover:opacity-90 active:scale-95"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
