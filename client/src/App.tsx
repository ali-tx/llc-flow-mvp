import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  Zap,
  FileText,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import VerificationScreen from './components/VerificationScreen';
import axios from 'axios';

type FlowState = 'landing' | 'chat' | 'verification' | 'success';

const FEATURES = [
  {
    icon: <Zap size={20} className="text-violet-500" />,
    title: 'Conversational Formation',
    desc: 'Just chat — our AI asks the right questions and handles the paperwork.',
    bg: 'bg-violet-50',
  },
  {
    icon: <ShieldCheck size={20} className="text-emerald-500" />,
    title: 'Official State Documents',
    desc: 'Generates a proper Delaware Certificate of Formation — ready to file.',
    bg: 'bg-emerald-50',
  },
  {
    icon: <Building2 size={20} className="text-blue-500" />,
    title: 'Expert Recommendations',
    desc: 'Get tailored advice on entity type, state, and structure for your situation.',
    bg: 'bg-blue-50',
  },
];

const App = () => {
  const [flow, setFlow] = useState<FlowState>('landing');
  const [sessionId, setSessionId] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [initialChips, setInitialChips] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const { data } = await axios.post('/api/formations/start', {});
      setSessionId(data.sessionId);
      setInitialMessage(data.message);
      setInitialChips(data.chips || []);
      setFlow('chat');
    } catch (error) {
      console.error('Failed to start formation:', error);
      // Fallback — still enter chat with a default message
      setSessionId('demo-' + Date.now());
      setInitialMessage("Hi! I'll help you form your LLC. What kind of business are you starting?");
      setInitialChips(['Software / Tech', 'Consulting', 'E-commerce', 'Freelancing', 'Other']);
      setFlow('chat');
    } finally {
      setIsStarting(false);
    }
  };

  const handleChatFinished = (data: any) => {
    setFormData(data);
    setFlow('verification');
  };

  const handleReset = () => {
    setFlow('landing');
    setSessionId('');
    setInitialMessage('');
    setInitialChips([]);
    setFormData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      {/* Gradient blob backgrounds */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-100 opacity-50 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-violet-100 opacity-40 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {/* ── LANDING ── */}
        {flow === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="container max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center space-y-14"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-sm"
            >
              <Sparkles size={13} />
              AI-Powered LLC Formation
            </motion.div>

            {/* Hero */}
            <div className="space-y-5 max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
                Form Your LLC in{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Minutes
                </span>
                , Not Days.
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                Just answer a few questions and our AI advisor walks you through every step —
                recommending the right structure, collecting your details, and generating your
                official Certificate of Formation.
              </p>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-3"
            >
              <button
                onClick={handleStart}
                disabled={isStarting}
                className="group relative h-14 px-10 rounded-2xl font-bold text-base bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl hover:shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center gap-3"
              >
                {isStarting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                {isStarting ? 'Setting up your session…' : 'Start My LLC Formation'}
                {!isStarting && (
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
              <p className="text-xs text-slate-400">
                Takes 5–10 minutes · No account required · Delaware &amp; Wyoming supported
              </p>
            </motion.div>

            {/* Steps Preview */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap justify-center gap-2 text-xs text-slate-500"
            >
              {[
                'Business type',
                'Entity recommendation',
                'State & name',
                'Address',
                'Registered agent',
                'Ownership',
                'Sign & generate PDF',
              ].map((step, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-3 py-1 shadow-sm"
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                    {i + 1}
                  </span>
                  {step}
                </span>
              ))}
            </motion.div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 w-full">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left space-y-3 hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-slate-800">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CHAT ── */}
        {flow === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="h-screen flex flex-col"
          >
            {/* Topbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                <span className="font-bold text-slate-800 text-sm">LLC Formation</span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={13} />
                Start over
              </button>
            </div>

            {/* Chat fills remaining height */}
            <div className="flex-1 overflow-hidden p-4 md:p-6 flex items-stretch justify-center">
              <ChatInterface
                sessionId={sessionId}
                initialMessage={initialMessage}
                initialChips={initialChips}
                onFinished={handleChatFinished}
              />
            </div>
          </motion.div>
        )}

        {/* ── VERIFICATION ── */}
        {flow === 'verification' && formData && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
          >
            {/* Topbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" />
                <span className="font-bold text-slate-800 text-sm">Review & Download</span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={13} />
                Start over
              </button>
            </div>

            <VerificationScreen
              formData={formData}
              sessionId={sessionId}
              onEdit={() => setFlow('chat')}
            />
          </motion.div>
        )}

        {/* ── SUCCESS ── */}
        {flow === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="container max-w-2xl mx-auto px-4 py-24 text-center space-y-8"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="text-4xl font-extrabold">Formation Pack Downloaded!</h2>
            <p className="text-slate-500 text-lg">
              Your Certificate of Formation is ready. Submit it to the Delaware Division of Corporations to officially form your LLC.
            </p>
            <button
              onClick={handleReset}
              className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all"
            >
              Form Another LLC
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      {flow === 'landing' && (
        <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-100">
          © 2026 LLC-Flow · Not a law firm · No legal advice provided
        </footer>
      )}
    </div>
  );
};

export default App;
