import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Brain, Shield, TrendingUp, Utensils,
  Car, ShoppingBag, Zap, Smile, Heart, ArrowRight, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useAuthStore } from '../store/authStore';
import { getCurrentUserToken } from '../lib/firebase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function apiPatch(path: string, body: any) {
  const token = await getCurrentUserToken();
  const { data } = await axios.patch(`${API_BASE}${path}`, body, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

async function apiPost(path: string, body?: any) {
  const token = await getCurrentUserToken();
  const { data } = await axios.post(`${API_BASE}${path}`, body, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

// ── Budget categories ──────────────────────────────────────────────────────────
const BUDGET_CATEGORIES = [
  { id: 'food',          label: 'Food',          icon: Utensils,  default: 5000,  color: 'text-orange-400' },
  { id: 'transport',     label: 'Transport',      icon: Car,       default: 2000,  color: 'text-blue-400' },
  { id: 'shopping',      label: 'Shopping',       icon: ShoppingBag, default: 4000, color: 'text-purple-400' },
  { id: 'bills',         label: 'Bills',          icon: Zap,       default: 2500,  color: 'text-yellow-400' },
  { id: 'entertainment', label: 'Entertainment',  icon: Smile,     default: 1500,  color: 'text-pink-400' },
  { id: 'health',        label: 'Health',         icon: Heart,     default: 1000,  color: 'text-green-400' },
];

// ── Mini chat preview ──────────────────────────────────────────────────────────
const CHAT_PREVIEW = [
  { role: 'user',      text: 'Mera food budget kya hai?' },
  { role: 'assistant', text: '🍛 You\'ve spent ₹3,800 out of your ₹5,000 food budget this month. Only ₹1,200 left with 8 days to go!' },
  { role: 'user',      text: 'Can I afford a ₹3,000 EMI?' },
];

const SAMPLE_QUESTIONS = [
  'What did I spend this month?',
  'Why did my credit score drop?',
  'सेविंग्स कैसे बढ़ाएं?',
];

import type { Variants } from 'framer-motion';

const variants: Variants = {
  enter: { x: 100, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
};

// ═══════════════════════════════════════════════════════════════════════════════
export const Onboarding = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const [seedError, setSeedError] = useState('');
  const [savingBudgets, setSavingBudgets] = useState(false);
  const [budgetsDone, setBudgetsDone] = useState(false);
  const [budgets, setBudgets] = useState<Record<string, number>>(
    Object.fromEntries(BUDGET_CATEGORIES.map(c => [c.id, c.default]))
  );

  const firstName = user?.displayName?.split(' ')[0] || 'there';
  const totalSteps = 4;
  const monthYear = new Date().toISOString().slice(0, 7);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  // Step 2: seed demo data
  const handleSeedData = async () => {
    setSeedLoading(true);
    setSeedError('');
    try {
      const res = await apiPost('/api/seed/seed-demo');
      if (res.seeded || res.message) setSeedDone(true);
    } catch {
      setSeedError('Failed to load demo data. You can skip and continue.');
    } finally {
      setSeedLoading(false);
    }
  };

  // Step 3: save budgets
  const handleSaveBudgets = async () => {
    setSavingBudgets(true);
    try {
      await Promise.all(
        Object.entries(budgets).map(([category, monthly_limit]) =>
          apiPost('/api/budgets', { category, monthly_limit, month_year: monthYear })
        )
      );
      setBudgetsDone(true);
      setTimeout(() => go(3), 600);
    } catch { /* silent */ } finally {
      setSavingBudgets(false);
    }
  };

  // Step 4: mark onboarding complete
  const handleFinish = async (destination: string) => {
    try {
      await apiPatch('/api/auth/profile', { onboarding_completed: true });
    } catch { /* silent */ }
    navigate(destination);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white flex flex-col">

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? 'w-6 bg-sky-400' : i < step ? 'w-4 bg-sky-500/50' : 'w-4 bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center pt-8 px-4">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div key="step0" variants={variants} initial="enter" animate="center" exit="exit" className="space-y-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">👋</div>
                  <h1 className="text-3xl font-bold mb-3">Welcome to PaySense AI, {firstName}!</h1>
                  <p className="text-gray-400">Your AI-powered financial copilot for smarter money decisions</p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Brain, text: 'Ask anything about your finances in Hindi or English', color: 'text-sky-400' },
                    { icon: Shield, text: 'Detect suspicious transactions instantly with AI fraud detection', color: 'text-emerald-400' },
                    { icon: TrendingUp, text: 'Track budgets, credit score, and savings — all in one place', color: 'text-purple-400' },
                  ].map(({ icon: Icon, text, color }) => (
                    <div key={text} className="flex items-start gap-3 bg-white/3 border border-white/5 rounded-xl p-4">
                      <Icon size={20} className={`${color} shrink-0 mt-0.5`} />
                      <p className="text-sm text-gray-300">{text}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-3">Choose your preferred language:</p>
                  <LanguageToggle />
                </div>

                <Button variant="primary" fullWidth rightIcon={<ArrowRight size={16} />} onClick={() => go(1)}>
                  Let's Set Up
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Load Your Financial Data</h1>
                  <p className="text-gray-400 text-sm">We'll load realistic demo data so you can explore PaySense AI immediately</p>
                </div>

                <div className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-3">
                  <p className="text-sm font-semibold text-white mb-3">What we'll load:</p>
                  {[
                    '~90 transactions spanning 3 months',
                    '6 category budgets with Indian averages',
                    'Credit score history (trending 680 → 720)',
                    '3 sample alerts including a fraud detection',
                    '2 savings suggestions for your idle cash',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                {seedDone ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center"
                  >
                    <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-300 font-semibold">✅ Data loaded successfully!</p>
                    <p className="text-xs text-gray-400 mt-1">90 transactions, 6 months credit history</p>
                  </motion.div>
                ) : (
                  <>
                    {seedError && <p className="text-red-400 text-sm text-center">{seedError}</p>}
                    <Button
                      variant="primary" fullWidth loading={seedLoading}
                      onClick={handleSeedData}
                      leftIcon={!seedLoading ? <Sparkles size={16} /> : undefined}
                    >
                      {seedLoading ? 'Loading your financial data...' : 'Load Demo Data'}
                    </Button>
                  </>
                )}

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => go(0)} className="flex-1">← Back</Button>
                  <Button
                    variant={seedDone ? 'primary' : 'secondary'}
                    onClick={() => go(2)}
                    rightIcon={<ArrowRight size={16} />}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Set Monthly Budgets</h1>
                  <p className="text-gray-400 text-sm">Adjust these to match your lifestyle. You can always change them later.</p>
                </div>

                <div className="space-y-3">
                  {BUDGET_CATEGORIES.map(({ id, label, icon: Icon, color }) => (
                    <div key={id} className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
                      <Icon size={18} className={`${color} shrink-0`} />
                      <span className="text-sm text-white flex-1">{label}</span>
                      <div className="flex items-center gap-1 bg-white/5 rounded-lg px-3 py-1.5">
                        <span className="text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={budgets[id]}
                          onChange={e => setBudgets(prev => ({ ...prev, [id]: parseInt(e.target.value) || 0 }))}
                          className="w-20 bg-transparent text-white text-sm text-right outline-none"
                          min={0}
                          step={500}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => go(1)} className="flex-1">← Back</Button>
                  <Button
                    variant="primary" loading={savingBudgets}
                    onClick={handleSaveBudgets}
                    rightIcon={budgetsDone ? <CheckCircle size={16} /> : <ArrowRight size={16} />}
                    className="flex-1"
                  >
                    {budgetsDone ? 'Saved!' : 'Save Budgets'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl mb-3">🎉</div>
                  <h1 className="text-2xl font-bold mb-2">You're all set!</h1>
                  <p className="text-gray-400 text-sm">PaySense AI is ready to help you make smarter money decisions</p>
                </div>

                {/* Mini chat preview */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-3">
                  {CHAT_PREVIEW.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.25 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm
                        ${msg.role === 'user'
                          ? 'bg-gradient-to-br from-sky-600 to-indigo-600 text-white'
                          : 'bg-[#1F2937] border border-white/8 text-gray-200'}`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_QUESTIONS.map(q => (
                      <span key={q} className="text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="primary" fullWidth rightIcon={<ArrowRight size={16} />} onClick={() => handleFinish('/chat')}>
                    Open AI Chat →
                  </Button>
                  <Button variant="ghost" fullWidth onClick={() => handleFinish('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
