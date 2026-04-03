import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, MessageCircle, CheckSquare, Square, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  Tooltip, ResponsiveContainer, Area, AreaChart, XAxis, YAxis, CartesianGrid
} from 'recharts';
import axios from 'axios';
import { Sidebar } from '../components/layout/Sidebar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
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

// ─── Score helpers ────────────────────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 750) return '#06B6D4';
  if (score >= 700) return '#10B981';
  if (score >= 550) return '#F59E0B';
  return '#EF4444';
}

function getScoreLabel(score: number): { label: string; variant: 'success' | 'warning' | 'danger' | 'info' } {
  if (score >= 750) return { label: 'Excellent', variant: 'info' };
  if (score >= 700) return { label: 'Good', variant: 'success' };
  if (score >= 550) return { label: 'Fair', variant: 'warning' };
  return { label: 'Poor', variant: 'danger' };
}

// ─── Score Gauge (SVG arc) ────────────────────────────────────────────────────
const ScoreGauge = ({ score }: { score: number }) => {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2 + 20;
  const R = 90;
  const startAngle = 225; // degrees from right (CW)
  const sweepDeg = 270;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  function polarToCart(cx: number, cy: number, r: number, angle: number) {
    const rad = toRad(angle - 90);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(startDeg: number, endDeg: number) {
    const s = polarToCart(cx, cy, R, startDeg);
    const e = polarToCart(cx, cy, R, endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const trackPath = describeArc(startAngle, startAngle + sweepDeg);

  const pct = Math.max(0, Math.min(1, (score - 300) / 600));
  const scoreDeg = sweepDeg * pct;
  const scoreEndAngle = startAngle + scoreDeg;
  const scorePath = scoreDeg > 1 ? describeArc(startAngle, Math.min(scoreEndAngle, startAngle + sweepDeg - 0.5)) : '';

  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * R;
  const dashLen = (scoreDeg / 360) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Track */}
      <path d={trackPath} fill="none" stroke="#1F2937" strokeWidth={14} strokeLinecap="round" />

      {/* Score arc */}
      {scorePath && (
        <motion.path
          d={scorePath}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      )}

      {/* Glow at end */}
      {scorePath && (
        <circle
          cx={polarToCart(cx, cy, R, Math.min(scoreEndAngle, startAngle + sweepDeg - 0.5)).x}
          cy={polarToCart(cx, cy, R, Math.min(scoreEndAngle, startAngle + sweepDeg - 0.5)).y}
          r={7}
          fill={color}
          style={{ filter: `blur(4px)`, opacity: 0.7 }}
        />
      )}

      {/* Center score */}
      <text x={cx} y={cy - 10} textAnchor="middle" fill="white" fontSize={44} fontWeight="800" fontFamily="sans-serif">
        {score}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#6B7280" fontSize={12}>CIBIL Score</text>

      {/* Min / Max labels */}
      <text x={18} y={cy + 30} fill="#4B5563" fontSize={11}>300</text>
      <text x={size - 18} y={cy + 30} fill="#4B5563" fontSize={11} textAnchor="end">900</text>
      <text x={21} y={cy + 44} fill="#4B5563" fontSize={10}>Poor</text>
      <text x={size - 21} y={cy + 44} fill="#4B5563" fontSize={10} textAnchor="end">Excellent</text>
    </svg>
  );
};

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const LineTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1F2937] border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
      <p className="font-semibold">{payload[0].payload.label}</p>
      <p className="text-sky-400">Score: {payload[0].value}</p>
    </div>
  );
};

// ─── RECOVERY PLAN ────────────────────────────────────────────────────────────
const RECOVERY_STEPS = [
  { id: 'pay_emis', text: 'Pay all EMIs on time for 3 months', gain: '+25–40 pts in 90 days' },
  { id: 'utilization', text: 'Reduce credit card utilization below 30%', gain: '+15–25 pts' },
  { id: 'no_new_credit', text: "Don't apply for new credit for 6 months", gain: '+10–15 pts' },
];

const STORAGE_KEY = 'paysense_recovery_plan';

const RecoveryPlan = () => {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  });

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const completedPct = Math.round((Object.values(checked).filter(Boolean).length / RECOVERY_STEPS.length) * 100);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-white">Your 3-Step Recovery Plan</h2>
        <Badge variant="info">{completedPct}% complete</Badge>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-5">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${completedPct}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
        />
      </div>
      <div className="space-y-3">
        {RECOVERY_STEPS.map(step => (
          <button
            key={step.id}
            onClick={() => toggle(step.id)}
            className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
          >
            {checked[step.id]
              ? <CheckSquare size={20} className="text-sky-400 shrink-0 mt-0.5" />
              : <Square size={20} className="text-gray-500 shrink-0 mt-0.5" />
            }
            <div>
              <p className={`text-sm ${checked[step.id] ? 'text-gray-400 line-through' : 'text-white'}`}>{step.text}</p>
              <p className="text-xs text-emerald-400 mt-0.5">{step.gain}</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

// ─── Factor Row ───────────────────────────────────────────────────────────────
const FACTOR_DEFAULTS = [
  { factor: 'Payment History', impact: 'High', description: '100% on-time payments', tip: 'Keep all EMIs and bills paid on time', pct: 95 },
  { factor: 'Credit Utilization', impact: 'High', description: 'Using 45% of credit limit', tip: 'Pay down card balances to below 30%', pct: 55 },
  { factor: 'Credit History Length', impact: 'Medium', description: '3.5 years average account age', tip: 'Avoid closing old credit accounts', pct: 65 },
  { factor: 'Credit Mix', impact: 'Medium', description: 'Only unsecured credit visible', tip: 'A home or auto loan can diversify your mix', pct: 50 },
  { factor: 'New Credit Enquiries', impact: 'Low', description: '1 enquiry in past 12 months', tip: 'Avoid multiple loan applications in short period', pct: 85 },
];

const IMPACT_VARIANT: Record<string, any> = { High: 'danger', Medium: 'warning', Low: 'success' };
const IMPACT_BAR_COLOR: Record<string, string> = { High: '#EF4444', Medium: '#F59E0B', Low: '#22C55E' };

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export const CreditCoach = () => {
  const navigate = useNavigate();
  const [latestScore, setLatestScore] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [scoreData, historyData] = await Promise.all([
          apiGet<any>('/api/credit'),
          apiGet<any[]>('/api/credit/history')
        ]);
        setLatestScore(scoreData);
        setHistory(historyData);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const mockRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1800));
    setRefreshing(false);
  };

  const score = latestScore?.score || 750;
  const scoreInfo = getScoreLabel(score);
  const color = getScoreColor(score);

  const factors: any[] = latestScore?.factors?.length ? latestScore.factors : FACTOR_DEFAULTS;

  const chartData = history.map((h: any) => ({
    label: new Date(h.recorded_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    score: h.score
  }));

  // Previous score
  const prevScore = history.length >= 2 ? history[history.length - 2]?.score : null;
  const scoreDelta = prevScore ? score - prevScore : null;

  const Skel = ({ h = 'h-4', w = 'w-full', className = '' }) => (
    <div className={`${h} ${w} rounded-lg bg-white/5 animate-pulse ${className}`} />
  );

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Sidebar alertCount={0} />

      <main className="md:ml-[240px] px-4 md:px-6 py-6 pb-24 md:pb-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-white mb-6">Credit Coach</h1>

        {/* ── HERO ── */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Gauge */}
            <div>
              {loading
                ? <Skel h="h-60" className="rounded-full mx-auto" />
                : <ScoreGauge score={score} />
              }
              <div className="text-center mt-2">
                <Badge variant={scoreInfo.variant}>{scoreInfo.label}</Badge>
              </div>
            </div>

            {/* Quick stats */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                <p className="text-sm text-white">
                  {latestScore ? new Date(latestScore.recorded_at || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>

              {scoreDelta !== null && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Change from Previous</p>
                  <p className={`text-sm font-semibold flex items-center gap-1 ${scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {scoreDelta >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {scoreDelta >= 0 ? '+' : ''}{scoreDelta} points
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bureau</p>
                <p className="text-sm text-white">{latestScore?.bureau || 'CIBIL'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Score Range</p>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${((score - 300) / 600) * 100}%`, backgroundColor: color }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>300 Poor</span><span>900 Excellent</span>
                </div>
              </div>

              <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />} onClick={mockRefresh} loading={refreshing}>
                Refresh Score
              </Button>
            </div>
          </div>
        </Card>

        {/* ── HISTORY CHART ── */}
        <Card className="p-6 mb-6">
          <h2 className="text-base font-semibold text-white mb-4">6-Month Score History</h2>
          {loading ? <Skel h="h-48" /> : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No history data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[300, 900]} ticks={[600, 700, 800]} tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<LineTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: '#0ea5e9', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ── FACTORS ── */}
        <Card className="p-6 mb-6">
          <h2 className="text-base font-semibold text-white mb-4">What's Affecting Your Score</h2>
          <div className="space-y-3">
            {factors.map((factor: any, i: number) => {
              const pct = factor.pct ?? (factor.impact === 'High' ? 60 : factor.impact === 'Medium' ? 75 : 90);
              return (
                <motion.div
                  key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white/3 border border-white/5 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white">{factor.factor}</p>
                    <Badge variant={IMPACT_VARIANT[factor.impact] || 'neutral'}>{factor.impact} Impact</Badge>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.07 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: IMPACT_BAR_COLOR[factor.impact] || '#0ea5e9' }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{factor.description}</p>
                  {factor.tip && (
                    <p className="text-xs text-sky-400">💡 Tip: {factor.tip}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* ── RECOVERY PLAN (shown if score < 750) ── */}
        {score < 750 && <div className="mb-6"><RecoveryPlan /></div>}

        {/* ── CTA ── */}
        <Card className="p-6 text-center bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border-sky-500/20">
          <p className="text-base font-semibold text-white mb-2">Want to understand your score better?</p>
          <p className="text-sm text-gray-400 mb-4">Ask PaySense AI and get personalised advice in Hindi or English</p>
          <Button
            variant="primary"
            leftIcon={<MessageCircle size={16} />}
            onClick={() => navigate('/chat?message=' + encodeURIComponent('Why did my credit score change?'))}
          >
            💬 Ask PaySense about your credit score
          </Button>
        </Card>
      </main>
    </div>
  );
};
