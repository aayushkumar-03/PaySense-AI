import React, {
  useState, useEffect, useRef, useCallback, useLayoutEffect
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenLine, Trash2, Search, ArrowUp, Mic, MicOff,
  Copy, ThumbsUp, ThumbsDown, AlertTriangle, ChevronDown,
  Wallet, Target, TrendingUp, Check, LayoutDashboard
} from 'lucide-react';
import axios from 'axios';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getCurrentUserToken } from '../lib/firebase';

// ─── Types ─────────────────────────────────────────────────────────────────
interface ChatSession { id: string; title: string; language: string; updated_at: string; }
interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; metadata?: any; created_at: string; }

// ─── API helpers ────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function authHeader() {
  const token = await getCurrentUserToken();
  return { Authorization: `Bearer ${token}` };
}

async function apiGet<T>(path: string): Promise<T> {
  const { data } = await axios.get<T>(`${API_BASE}${path}`, { headers: await authHeader() });
  return data;
}

async function apiPost<T>(path: string, body?: any): Promise<T> {
  const { data } = await axios.post<T>(`${API_BASE}${path}`, body, { headers: await authHeader() });
  return data;
}

async function apiDelete(path: string): Promise<void> {
  await axios.delete(`${API_BASE}${path}`, { headers: await authHeader() });
}

async function apiPatch<T>(path: string, body?: any): Promise<T> {
  const { data } = await axios.patch<T>(`${API_BASE}${path}`, body, { headers: await authHeader() });
  return data;
}

// ─── Quick suggestions ────────────────────────────────────────────────────
const WELCOME_CHIPS = [
  'What did I spend this month?',
  'Why did my credit score change?',
  'Mera food budget kya hai?',
  'Can I afford a ₹3,000 EMI?',
];

const CONTEXT_QUESTIONS = [
  'How is my spending compared to last month?',
  'Which category am I overspending in?',
  'Suggest a savings plan for me',
  'Is any of my spending suspicious?',
  'What is my CIBIL score and how to improve it?',
];

// ─── SpeechRecognition ────────────────────────────────────────────────────
const SpeechRecognitionAPI: any =
  typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = diff / 3600000;
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${Math.floor(h)}h ago`;
  if (h < 48) return 'Yesterday';
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d ago` : new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// ─── ChatPage ───────────────────────────────────────────────────────────────
export const ChatPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [input, setInput] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('New Chat');
  const [isListening, setIsListening] = useState(false);
  const [queriesRemaining, setQueriesRemaining] = useState<number | 'unlimited'>(5);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
    loadDashboardSnapshot();
    // Check for pre-filled message from quick ask bar
    const preMsg = searchParams.get('message');
    if (preMsg) setInput(decodeURIComponent(preMsg));
  }, []);

  // Auto-scroll
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
  }, [input]);

  const loadSessions = async () => {
    try {
      const data = await apiGet<ChatSession[]>('/api/chat/sessions');
      setSessions(data);
    } catch { /* silent */ }
  };

  const loadDashboardSnapshot = async () => {
    try {
      const data = await apiGet<any>('/api/dashboard');
      setDashboardData(data);
    } catch { /* silent */ }
  };

  const loadMessages = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const data = await apiGet<ChatMessage[]>(`/api/chat/sessions/${sessionId}/messages`);
      setMessages(data);
    } catch { /* silent */ } finally {
      setIsLoading(false);
    }
  };

  const selectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setSessionTitle(session.title);
    setLanguage((session.language as any) || 'en');
    loadMessages(session.id);
  };

  const newChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setSessionTitle('New Chat');
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await apiDelete(`/api/chat/sessions/${id}`);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) newChat();
  };

  const saveTitle = async () => {
    setEditingTitle(false);
    if (!activeSessionId || !sessionTitle.trim()) return;
    await apiPatch(`/api/chat/sessions/${activeSessionId}`, { title: sessionTitle });
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: sessionTitle } : s));
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    setInput('');

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId, role: 'user', content: msg,
      created_at: new Date().toISOString(), metadata: {}
    };
    setMessages(prev => [...prev, optimistic]);
    setIsTyping(true);
    setIsLoading(true);

    try {
      const res: any = await apiPost('/api/chat/message', {
        userMessage: msg,
        sessionId: activeSessionId,
        language
      });

      // Replace temp + add AI response
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { id: `user-${res.messageId}`, role: 'user', content: msg, created_at: new Date().toISOString(), metadata: {} },
        { id: res.messageId, role: 'assistant', content: res.response, created_at: new Date().toISOString(), metadata: { suggestedActions: res.suggestedActions } }
      ]);

      if (res.sessionId && !activeSessionId) {
        setActiveSessionId(res.sessionId);
        loadSessions();
      }

      setQueriesRemaining(res.queriesRemaining ?? 'unlimited');

    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      if (err.response?.data?.error === 'QUERY_LIMIT_REACHED') {
        setShowLimitModal(true);
      }
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  }, [input, activeSessionId, language, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVoice = () => {
    if (!SpeechRecognitionAPI) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0A0F1E] text-white overflow-hidden">

      {/* ── Column 1: Sessions Panel ─────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 border-r border-white/5 flex-col bg-[#0D1525] shrink-0">
        <div className="p-3 border-b border-white/5">
          <Button variant="primary" fullWidth leftIcon={<PenLine size={15} />} onClick={newChat}>
            New Chat
          </Button>
          <div className="relative mt-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={sessionSearch}
              onChange={e => setSessionSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-white/5 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-300 placeholder-gray-600 outline-none focus:ring-1 focus:ring-sky-500/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {filteredSessions.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-6 px-4">No chats yet. Start a conversation!</p>
          )}
          {filteredSessions.map(session => (
            <div
              key={session.id}
              onClick={() => selectSession(session)}
              className={`group relative mx-2 p-3 rounded-xl cursor-pointer transition-colors
                ${activeSessionId === session.id
                  ? 'bg-sky-500/10 border border-sky-500/20'
                  : 'hover:bg-white/5 border border-transparent'}`}
            >
              <p className="text-sm text-white truncate pr-6">{session.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{relativeDate(session.updated_at)}</p>
              <button
                onClick={(e) => deleteSession(session.id, e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Back to Dashboard */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors w-full p-2 rounded-xl hover:bg-white/5"
          >
            <LayoutDashboard size={14} />
            Back to Dashboard
          </button>
        </div>
      </aside>

      {/* ── Column 2: Chat Area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0 bg-[#0A0F1E]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile back */}
            <button onClick={() => navigate('/dashboard')} className="md:hidden text-gray-400 hover:text-white">
              <ChevronDown size={20} className="rotate-90" />
            </button>

            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={sessionTitle}
                onChange={e => setSessionTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => e.key === 'Enter' && saveTitle()}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white outline-none focus:border-sky-500/50 min-w-[200px]"
                autoFocus
              />
            ) : (
              <button
                onClick={() => { setEditingTitle(true); setTimeout(() => titleInputRef.current?.select(), 50); }}
                className="text-sm font-semibold text-white hover:text-sky-400 transition-colors truncate"
              >
                {sessionTitle}
              </button>
            )}
          </div>

          <select
            value={language}
            onChange={e => setLanguage(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">

          {/* Welcome state */}
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center mb-5 shadow-2xl shadow-sky-500/20">
                <span className="text-white font-bold text-3xl font-logo">P</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Namaste! I'm PaySense AI 👋</h2>
              <p className="text-gray-400 text-sm mb-8 max-w-sm">Ask me anything about your finances in Hindi, Hinglish, or English</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {WELCOME_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => { setInput(chip); textareaRef.current?.focus(); }}
                    className="text-left text-sm text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message list */}
          <div className="max-w-3xl mx-auto space-y-1">
            <AnimatePresence mode="popLayout">
              {messages.map(msg => (
                <div key={msg.id} className="group relative">
                  <ChatBubble
                    role={msg.role}
                    content={msg.content}
                    timestamp={relativeDate(msg.created_at)}
                  />

                  {/* Copy + feedback controls on hover */}
                  <div className={`absolute top-0 ${msg.role === 'user' ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#1F2937] border border-white/10 rounded-lg px-2 py-1`}>
                    <button onClick={() => copyMessage(msg.content, msg.id)} className="text-gray-400 hover:text-white p-0.5">
                      {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                    {msg.role === 'assistant' && (
                      <>
                        <button className="text-gray-400 hover:text-emerald-400 p-0.5"><ThumbsUp size={12} /></button>
                        <button className="text-gray-400 hover:text-red-400 p-0.5"><ThumbsDown size={12} /></button>
                      </>
                    )}
                  </div>

                  {/* Suggested action card */}
                  {msg.role === 'assistant' && msg.metadata?.suggestedActions?.length > 0 && (
                    <div className="ml-10 mb-2 max-w-[80%]">
                      {msg.metadata.suggestedActions.map((action: any, i: number) => (
                        <div key={i} className="bg-[#1F2937] border border-white/10 rounded-xl px-4 py-3 mt-2">
                          <p className="text-xs text-gray-400 mb-1">💡 Suggested Action</p>
                          <p className="text-sm text-white mb-2">
                            {action.type === 'SET_BUDGET' && `Set ${action.category} budget to ₹${action.amount?.toLocaleString('en-IN')}`}
                            {action.type === 'SAVINGS_SUGGESTION' && `Start a ₹${action.amount?.toLocaleString('en-IN')} SIP`}
                          </p>
                          <Button variant="primary" size="sm">Apply</Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fraud alert card */}
                  {msg.metadata?.fraudAlert && (
                    <div className="ml-10 mb-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">{msg.metadata.fraudAlert}</p>
                    </div>
                  )}
                </div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <ChatBubble role="typing" />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Query limit banner */}
        {queriesRemaining === 0 && (
          <div className="mx-4 mb-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <p className="text-sm text-amber-300">You've used all 5 free queries today. Upgrade to Pro for unlimited.</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/settings')}>Upgrade</Button>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-white/5 px-4 py-3 shrink-0 bg-[#0A0F1E]">
          <div className="max-w-3xl mx-auto">
            {/* Language pill */}
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="info">
                {language === 'en' ? 'English' : language === 'hi' ? 'हिन्दी' : 'Hinglish'}
              </Badge>
            </div>

            <div className="flex items-end gap-2 bg-white/5 border border-white/10 focus-within:border-sky-500/40 rounded-2xl px-3 py-2 transition-colors">
              {/* Voice button */}
              <button
                type="button"
                onClick={toggleVoice}
                className={`transition-colors shrink-0 mb-1 p-1 rounded-lg ${isListening ? 'text-red-400 bg-red-500/10 animate-pulse' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask PaySense anything..."
                disabled={queriesRemaining === 0}
                className="flex-1 bg-transparent resize-none text-sm text-white placeholder-gray-600 outline-none py-1 max-h-[120px] scrollbar-none"
                style={{ height: 'auto' }}
              />

              {/* Character count */}
              {input.length > 200 && (
                <span className="text-xs text-gray-500 shrink-0 mb-1">{input.length}</span>
              )}

              {/* Send button */}
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || queriesRemaining === 0}
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all
                  ${input.trim() && !isLoading
                    ? 'bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Column 3: Context Panel ───────────────────────────────────────── */}
      <aside className="hidden lg:flex w-72 border-l border-white/5 flex-col px-4 py-4 bg-[#0D1525] shrink-0 overflow-y-auto">
        <p className="text-sm font-semibold text-gray-400 mb-3">Your Snapshot</p>

        {/* Mini stat cards */}
        <div className="space-y-2 mb-4">
          {[
            { label: "Today's Spend", value: dashboardData ? `₹${Number(dashboardData?.monthlySpend?.total || 0).toLocaleString('en-IN')}` : '—', icon: <Wallet size={14} />, color: 'text-sky-400' },
            { label: 'Budget Left', value: dashboardData ? `₹${Number(dashboardData?.budgetRemaining?.amount || 0).toLocaleString('en-IN')}` : '—', icon: <Target size={14} />, color: 'text-emerald-400' },
            { label: 'Credit Score', value: dashboardData?.latestCreditScore?.score ? String(dashboardData.latestCreditScore.score) : '—', icon: <TrendingUp size={14} />, color: 'text-purple-400' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center justify-between bg-white/3 border border-white/5 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={stat.color}>{stat.icon}</span>
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <span className="text-sm font-semibold text-white">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-white/5 my-2" />

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ask Me</p>
        <div className="space-y-1">
          {CONTEXT_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => { setInput(q); textareaRef.current?.focus(); }}
              className="w-full text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl px-3 py-2.5 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Limit Exceeded Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLimitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111827] border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <div className="w-14 h-14 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Daily Limit Reached</h3>
              <p className="text-sm text-gray-400 mb-6">You've used all 5 free queries for today. Upgrade to PaySense Pro for unlimited AI conversations.</p>
              <div className="space-y-2">
                <Button variant="primary" fullWidth onClick={() => { setShowLimitModal(false); navigate('/settings'); }}>
                  Upgrade to Pro
                </Button>
                <Button variant="ghost" fullWidth onClick={() => setShowLimitModal(false)}>
                  Maybe Tomorrow
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
