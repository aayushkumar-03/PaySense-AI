import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, AlertTriangle, Search,
  TrendingUp, ShoppingBag, Utensils
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';
import axios from 'axios';
import { Sidebar } from '../components/layout/Sidebar';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { getCurrentUserToken } from '../lib/firebase';

// ─── API ──────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
async function apiGet<T>(path: string): Promise<T> {
  const token = await getCurrentUserToken();
  const { data } = await axios.get<T>(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  food: '#f97316', transport: '#3b82f6', shopping: '#a855f7',
  bills: '#eab308', entertainment: '#ec4899', health: '#22c55e',
  investment: '#14b8a6', other: '#6b7280'
};

const ALL_TABS = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Flagged'];

function formatINR(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function groupByDate(txs: any[]) {
  const groups: Record<string, any[]> = {};
  txs.forEach(tx => {
    const d = new Date(tx.transaction_date);
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    let label: string;
    if (d >= today) label = 'Today';
    else if (d >= yesterday) label = 'Yesterday';
    else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return groups;
}

function getPrevMonth(month: string) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getNextMonth(month: string) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-[#1F2937] border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
      <p className="font-semibold capitalize">{name}</p>
      <p>{formatINR(value)}</p>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1F2937] border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill }}>{p.name}: {formatINR(p.value)}</p>
      ))}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skel = ({ h = 'h-4', w = 'w-full', className = '' }) => (
  <div className={`${h} ${w} rounded-lg bg-white/5 animate-pulse ${className}`} />
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export const SpendAnalysis = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentMonthDefault = new Date().toISOString().slice(0, 7);
  const month = searchParams.get('month') || currentMonthDefault;

  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [txOffset, setTxOffset] = useState(0);
  const [totalTxCount, setTotalTxCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setTxLoading(true);
    try {
      const [sumData, txData] = await Promise.all([
        apiGet<any>(`/api/transactions/summary?month=${month}`),
        apiGet<any>(`/api/transactions?month=${month}&limit=20&offset=0`)
      ]);
      setSummary(sumData);
      setTransactions(txData.transactions || []);
      setTotalTxCount(txData.totalCount || 0);
      setTxOffset(20);
    } catch { /* silent */ } finally {
      setLoading(false);
      setTxLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadData();
    setSelectedCategory(null);
    setActiveTab('All');
    setSearchTerm('');
  }, [loadData]);

  const loadMore = async () => {
    try {
      const txData = await apiGet<any>(`/api/transactions?month=${month}&limit=20&offset=${txOffset}`);
      setTransactions(prev => [...prev, ...(txData.transactions || [])]);
      setTxOffset(prev => prev + 20);
    } catch { /* silent */ }
  };

  const setMonth = (m: string) => setSearchParams({ month: m });

  // ─── Derived ───────────────────────────────────────────────────────────────
  const pieData = (summary?.categoryBreakdown || []).map((c: any) => ({
    name: c.category, value: c.amount, color: CATEGORY_COLORS[c.category] || '#6b7280'
  }));

  const biggestCategory = summary?.categoryBreakdown?.reduce((a: any, b: any) => a.amount > b.amount ? a : b, {});
  const topMerchant = summary?.topMerchants?.[0];

  const filteredTxs = transactions.filter(tx => {
    const tabMatch = activeTab === 'All'
      ? true
      : activeTab === 'Flagged'
      ? tx.is_flagged
      : tx.category.toLowerCase() === activeTab.toLowerCase();
    const catMatch = selectedCategory ? tx.category === selectedCategory : true;
    const searchMatch = !searchTerm || tx.merchant_name.toLowerCase().includes(searchTerm.toLowerCase());
    return tabMatch && catMatch && searchMatch;
  });

  const flaggedCount = transactions.filter(t => t.is_flagged).length;
  const grouped = groupByDate(filteredTxs);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Sidebar alertCount={0} />

      <main className="md:ml-[240px] px-4 md:px-6 py-6 pb-24 md:pb-6">

        {/* Header + Month picker */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Spend Analysis</h1>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-2 py-1.5">
            <button onClick={() => setMonth(getPrevMonth(month))} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-white px-2 min-w-[140px] text-center">{monthLabel(month)}</span>
            <button
              onClick={() => setMonth(getNextMonth(month))}
              disabled={month >= currentMonthDefault}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total Spent" loading={loading}
            value={loading ? '—' : formatINR(summary?.totalSpent || 0)}
            change={loading ? undefined : Math.round(summary?.vsLastMonth?.pctChange || 0)}
            changeLabel="vs last month"
            icon={<TrendingUp size={18} />} iconColor="text-sky-400"
          />
          <StatCard
            title="Biggest Category" loading={loading}
            value={loading ? '—' : (biggestCategory?.category || '—')}
            changeLabel={loading ? undefined : formatINR(biggestCategory?.amount || 0)}
            icon={<ShoppingBag size={18} />} iconColor="text-purple-400"
          />
          <StatCard
            title="Top Merchant" loading={loading}
            value={loading ? '—' : (topMerchant?.name || '—')}
            changeLabel={loading ? undefined : `${topMerchant?.count || 0} transactions`}
            icon={<Utensils size={18} />} iconColor="text-amber-400"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* LEFT — Category Breakdown */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-white mb-4">Where Your Money Went</h2>
            {loading ? (
              <div className="flex justify-center py-8"><Skel w="w-48" h="h-48" className="rounded-full" /></div>
            ) : pieData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No spending data this month</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      isAnimationActive animationDuration={800}
                    >
                      {pieData.map((entry: any, i: number) => (
                        <Cell
                          key={i} fill={entry.color}
                          opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1}
                          onClick={() => setSelectedCategory(selectedCategory === entry.name ? null : entry.name)}
                          className="cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend + rows */}
                <div className="space-y-3 mt-2">
                  {(summary?.categoryBreakdown || []).map((c: any) => {
                    const pct = Math.round(c.percentage || 0);
                    const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : CATEGORY_COLORS[c.category] || '#6b7280';
                    return (
                      <motion.div
                        key={c.category}
                        whileHover={{ x: 2 }}
                        onClick={() => setSelectedCategory(selectedCategory === c.category ? null : c.category)}
                        className={`cursor-pointer rounded-xl p-2.5 transition-colors
                          ${selectedCategory === c.category ? 'bg-white/8 border border-white/10' : 'hover:bg-white/4'}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[c.category] }} />
                            <span className="text-sm capitalize text-white">{c.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-white">{formatINR(c.amount)}</span>
                            {c.budget && <span className="text-xs text-gray-500 ml-2">/{formatINR(c.budget)} budget</span>}
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${Math.min(100, pct)}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: barColor }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>

          {/* RIGHT — Transaction List */}
          <Card className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Transactions</h2>
              <span className="text-xs text-gray-500">{totalTxCount} total</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none mb-3 pb-1">
              {ALL_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedCategory(null); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1
                    ${activeTab === tab ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {tab}
                  {tab === 'Flagged' && flaggedCount > 0 && (
                    <span className="bg-amber-500 text-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {flaggedCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search merchants..."
                className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-300 placeholder-gray-600 outline-none focus:border-sky-500/30"
              />
            </div>

            {/* Grouped tx list */}
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[420px] pr-1">
              {txLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <Skel w="w-8" h="h-8" className="rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skel w="w-32" h="h-3" />
                      <Skel w="w-20" h="h-2" />
                    </div>
                    <Skel w="w-16" h="h-4" />
                  </div>
                ))
              ) : Object.keys(grouped).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No transactions found</p>
              ) : (
                Object.entries(grouped).map(([dateLabel, txs]) => (
                  <div key={dateLabel}>
                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-2">{dateLabel}</p>
                    <div className="space-y-1">
                      {txs.map((tx: any) => (
                        <div key={tx.id}>
                          <button
                            onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                            className="w-full flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-white/4 transition-colors text-left"
                          >
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ backgroundColor: (CATEGORY_COLORS[tx.category] || '#6b7280') + '22', color: CATEGORY_COLORS[tx.category] || '#6b7280' }}
                            >
                              {tx.merchant_name[0].toUpperCase()}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{tx.merchant_name}</p>
                              {tx.description && <p className="text-xs text-gray-500 truncate">{tx.description}</p>}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {tx.is_flagged && <AlertTriangle size={13} className="text-amber-400" />}
                              <span className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tx.type === 'credit' ? '+' : '-'}₹{Math.round(tx.amount).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </button>
                          <AnimatePresence>
                            {expandedTx === tx.id && tx.fraud_reason && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-11 mb-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                  <p className="text-xs text-amber-300">⚠️ {tx.fraud_reason}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {transactions.length < totalTxCount && (
              <button onClick={loadMore} className="mt-3 w-full text-xs text-sky-400 hover:text-sky-300 py-2 rounded-xl hover:bg-sky-500/10 transition-colors">
                Load 20 more ({totalTxCount - transactions.length} remaining)
              </button>
            )}
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-4">
            💡 AI Insights for {monthLabel(month)}
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skel key={i} h="h-24" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(summary?.categoryBreakdown || []).slice(0, 3).map((cat: any, i: number) => {
                const lastMonthAmt = (summary?.vsLastMonth?.lastMonthTotal || 0) / (summary?.categoryBreakdown?.length || 1);
                const barData = [
                  { name: 'Last Month', value: lastMonthAmt, fill: '#374151' },
                  { name: 'This Month', value: cat.amount, fill: CATEGORY_COLORS[cat.category] || '#6b7280' }
                ];
                return (
                  <motion.div
                    key={cat.category}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border-l-4 rounded-xl bg-white/3 p-4"
                    style={{ borderLeftColor: CATEGORY_COLORS[cat.category] || '#6b7280' }}
                  >
                    <p className="text-sm text-gray-300 mb-3 capitalize font-medium">{cat.category}</p>
                    <p className="text-xs text-gray-400 mb-3">
                      Spent {formatINR(cat.amount)} {cat.budget ? `of ${formatINR(cat.budget)} budget (${Math.round(cat.percentage)}%)` : 'this month'}
                    </p>
                    <ResponsiveContainer width="100%" height={50}>
                      <BarChart data={barData} layout="vertical" barCategoryGap={4}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} width={70} />
                        <Bar dataKey="value" radius={[3, 3, 3, 3]} barSize={10}>
                          {barData.map((b, idx) => <Cell key={idx} fill={b.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};
