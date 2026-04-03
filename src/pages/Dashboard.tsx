import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Target, TrendingUp, Bell, RefreshCw,
  AlertTriangle, Send, Lightbulb, ArrowRight, Zap
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import axios from 'axios';
import { Sidebar } from '../components/layout/Sidebar';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { getCurrentUserToken } from '../lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardData {
  monthlySpend: { total: number; vsLastMonth_pct: number };
  budgetRemaining: { amount: number; usedPct: number };
  latestCreditScore: { score: number | null; change: number };
  unreadAlertsCount: number;
  recentTransactions: any[];
  categoryBudgetStatus: Array<{ category: string; spent: number; limit: number; pct: number }>;
  aiInsights: string[];
  dailySpendTrend: Array<{ date: string; amount: number }>;
  savingsSuggestionsCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function apiGet<T>(path: string): Promise<T> {
  const token = await getCurrentUserToken();
  const { data } = await axios.get<T>(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

async function apiPost<T>(path: string, body?: object): Promise<T> {
  const token = await getCurrentUserToken();
  const { data } = await axios.post<T>(`${API}${path}`, body, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

const CATEGORY_COLORS: Record<string, string> = {
  food: '#f97316', transport: '#3b82f6', shopping: '#a855f7',
  bills: '#eab308', entertainment: '#ec4899', health: '#22c55e',
  investment: '#14b8a6', other: '#6b7280'
};

function formatINR(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = diff / 3600000;
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${Math.floor(h)}h ago`;
  if (h < 48) return 'Yesterday';
  return `${Math.floor(h / 24)}d ago`;
}

function CategoryCircle({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] || '#6b7280';
  return (
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: color + '33', color }}
    >
      {category[0].toUpperCase()}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonBlock = ({ w = 'w-full', h = 'h-4', className = '' }) => (
  <div className={`${w} ${h} rounded-lg bg-white/5 animate-pulse ${className}`} />
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1F2937] border border-white/10 rounded-xl px-3 py-2 text-xs text-white shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const quickAskRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertRunning, setAlertRunning] = useState(false);
  const [quickAsk, setQuickAsk] = useState('');

  const firstName = user?.displayName?.split(' ')[0] || 'there';
  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await apiGet<DashboardData>('/api/dashboard');
      setData(d);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ⌘K / Ctrl+K to focus quick ask
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        quickAskRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const runAlertCheck = async () => {
    setAlertRunning(true);
    try {
      await apiPost('/api/alerts/run-check');
      await fetchDashboard(); // refresh
    } finally {
      setAlertRunning(false);
    }
  };

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAsk.trim()) return;
    navigate(`/chat?message=${encodeURIComponent(quickAsk)}`);
  };

  // ─── Budget bar data for chart ───────────────────────────────────────────
  const budgetChartData = data?.categoryBudgetStatus?.map(c => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    spent: c.spent,
    limit: c.limit,
    pct: c.pct,
    fill: c.pct >= 90 ? '#ef4444' : c.pct >= 70 ? '#f59e0b' : '#22c55e'
  })) || [];

  // ─── Trend chart data ────────────────────────────────────────────────────
  const trendData = data?.dailySpendTrend?.map(d => ({
    day: new Date(d.date).getDate(),
    amount: d.amount
  })) || [];

  // ─── Stat card animations ────────────────────────────────────────────────
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } }
  };
  const item: any = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Sidebar alertCount={data?.unreadAlertsCount || 0} />

      {/* Main area */}
      <main className="md:ml-[240px] min-h-screen px-4 md:px-6 py-6 pb-24 md:pb-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here's your financial snapshot for {month}</p>
          </div>
          <Button
            variant="secondary" size="sm"
            onClick={runAlertCheck}
            loading={alertRunning}
            leftIcon={<RefreshCw size={14} />}
          >
            Check Alerts
          </Button>
        </div>

        {/* ── Error State ─────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center mb-6">
            <p className="text-red-400 mb-3">{error}</p>
            <Button variant="danger" size="sm" onClick={fetchDashboard}>Retry</Button>
          </div>
        )}

        {/* ── ROW 1 — Stat Cards ──────────────────────────────────────── */}
        <motion.div
          variants={container} initial="hidden" animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <motion.div variants={item}>
            <StatCard
              title="Total Spent"
              value={loading ? '—' : formatINR(data?.monthlySpend.total || 0)}
              change={loading ? undefined : Math.round(data?.monthlySpend.vsLastMonth_pct || 0)}
              changeLabel="vs last month"
              icon={<Wallet size={18} />}
              iconColor="text-sky-400"
              loading={loading}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              title="Budget Remaining"
              value={loading ? '—' : formatINR(data?.budgetRemaining.amount || 0)}
              changeLabel={loading ? undefined : `${Math.round(data?.budgetRemaining.usedPct || 0)}% used`}
              icon={<Target size={18} />}
              iconColor={(data?.budgetRemaining.usedPct || 0) < 80 ? 'text-emerald-400' : 'text-amber-400'}
              loading={loading}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              title="Credit Score"
              value={loading ? '—' : (data?.latestCreditScore.score?.toString() || 'N/A')}
              change={loading ? undefined : data?.latestCreditScore.change}
              changeLabel="vs last reading"
              icon={<TrendingUp size={18} />}
              iconColor="text-purple-400"
              loading={loading}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              title="Active Alerts"
              value={loading ? '—' : String(data?.unreadAlertsCount || 0)}
              changeLabel={(data?.unreadAlertsCount || 0) > 0 ? 'Needs attention' : 'All clear'}
              icon={<Bell size={18} />}
              iconColor="text-amber-400"
              loading={loading}
            />
          </motion.div>
        </motion.div>

        {/* ── ROW 2 — Budget + Recent Transactions ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">

          {/* Budget status chart */}
          <Card className="lg:col-span-3 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Budget Status — {month}</h2>
              <Badge variant="info">This Month</Badge>
            </div>
            {loading ? (
              <div className="space-y-4 py-4">
                {[...Array(4)].map((_, i) => <SkeletonBlock key={i} h="h-8" />)}
              </div>
            ) : budgetChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <p>No budgets set yet.</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/settings')}>
                  Set Budgets
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={budgetChartData.length * 56 + 20}>
                <BarChart data={budgetChartData} layout="vertical" margin={{ left: 10, right: 40 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 13 }} width={90} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="limit" fill="#1F2937" radius={[4, 4, 4, 4]} barSize={10} name="Budget" />
                  <Bar dataKey="spent" radius={[4, 4, 4, 4]} barSize={10} name="Spent">
                    {budgetChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
              <button onClick={() => navigate('/analysis')} className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                View All <ArrowRight size={12} />
              </button>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonBlock w="w-8" h="h-8" className="rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonBlock w="w-32" h="h-3" />
                      <SkeletonBlock w="w-20" h="h-2" />
                    </div>
                    <SkeletonBlock w="w-16" h="h-4" />
                  </div>
                ))}
              </div>
            ) : !data?.recentTransactions?.length ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-center">
                <p className="text-sm mb-2">No transactions yet</p>
                <Button variant="primary" size="sm" onClick={async () => {
                  await apiPost('/api/seed/seed-demo');
                  fetchDashboard();
                }}>
                  Load Demo Data
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {(data?.recentTransactions || []).slice(0, 5).map((tx: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <CategoryCircle category={tx.category || 'other'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{tx.merchant_name}</p>
                      <p className="text-xs text-gray-500">{relativeDate(tx.transaction_date || tx.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {tx.is_flagged && <AlertTriangle size={13} className="text-amber-400" />}
                      <span className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatINR(parseFloat(tx.amount))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── ROW 3 — AI Insights + Spending Trend ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

          {/* AI Insights */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-400" /> PaySense Insights
              </h2>
              <Badge variant="info">
                <Zap size={10} className="mr-1" />Powered by AI
              </Badge>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <SkeletonBlock key={i} h="h-12" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {(data?.aiInsights || ['Analyzing your spending patterns...']).map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 bg-white/3 border border-white/5 rounded-xl p-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb size={13} className="text-amber-400" />
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* 30-Day Spending Trend */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">30-Day Spending Trend</h2>
            </div>
            {loading ? (
              <SkeletonBlock h="h-48" />
            ) : trendData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No trend data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    ticks={[1, 5, 10, 15, 20, 25, 30]}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone" dataKey="amount" stroke="#0ea5e9"
                    strokeWidth={2} dot={false} name="Spent"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* ── Quick Ask Bar ──────────────────────────────────────────── */}
        <Card className="p-4 border-sky-500/20 bg-sky-500/5">
          <form onSubmit={handleQuickAsk} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <input
              ref={quickAskRef}
              value={quickAsk}
              onChange={e => setQuickAsk(e.target.value)}
              placeholder="Ask PaySense anything in Hindi or English...  ⌘K"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
            <Button type="submit" variant="primary" size="sm" disabled={!quickAsk.trim()} rightIcon={<Send size={14} />}>
              Ask
            </Button>
          </form>
        </Card>

      </main>
    </div>
  );
};
