import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, AlertTriangle, TrendingUp, Calendar,
  Activity, CheckCheck, Trash2, ExternalLink, Check, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { Sidebar } from '../components/layout/Sidebar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';
import { getCurrentUserToken } from '../lib/firebase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function authHeader() {
  const token = await getCurrentUserToken();
  return { Authorization: `Bearer ${token}` };
}

// ── Alert type config ─────────────────────────────────────────────────────────
const ALERT_CONFIG: Record<string, { icon: any; color: string; bg: string; tab: string }> = {
  budget_warning:      { icon: CreditCard,     color: 'text-amber-400',  bg: 'bg-amber-400/10',  tab: 'Budget' },
  fraud:               { icon: AlertTriangle,  color: 'text-red-400',    bg: 'bg-red-400/10',    tab: 'Fraud' },
  savings_opportunity: { icon: TrendingUp,     color: 'text-emerald-400', bg: 'bg-emerald-400/10', tab: 'Savings' },
  emi_due:             { icon: Calendar,       color: 'text-blue-400',   bg: 'bg-blue-400/10',   tab: 'EMI' },
  credit_drop:         { icon: Activity,       color: 'text-purple-400', bg: 'bg-purple-400/10', tab: 'Credit' },
  unusual_activity:    { icon: AlertTriangle,  color: 'text-orange-400', bg: 'bg-orange-400/10', tab: 'Other' },
};

const TABS = ['All', 'Unread', 'Budget', 'Fraud', 'Savings', 'EMI'];

function relTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skel = ({ h = 'h-4', w = 'w-full', r = 'rounded-lg' }) => (
  <div className={`${h} ${w} ${r} bg-white/5 animate-pulse`} />
);

// ═════════════════════════════════════════════════════════════════════════════
export const AlertsPage = () => {
  const navigate = useNavigate();
  const { setUnreadAlertCount } = useUiStore();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/alerts`, {
        headers: await authHeader()
      });
      setAlerts(data);
      const unread = data.filter((a: any) => !a.is_read).length;
      setUnreadAlertCount(unread);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [setUnreadAlertCount]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const markRead = async (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    try {
      await axios.patch(`${API_BASE}/api/alerts/${id}/read`, {}, { headers: await authHeader() });
      const unread = alerts.filter(a => a.id !== id && !a.is_read).length;
      setUnreadAlertCount(unread);
    } catch { /* revert on error */ fetchAlerts(); }
  };

  const markAllRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    setUnreadAlertCount(0);
    try {
      await axios.patch(`${API_BASE}/api/alerts/read-all`, {}, { headers: await authHeader() });
    } catch { fetchAlerts(); }
  };

  const deleteAlert = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(prev => prev.filter(a => a.id !== id));
    try {
      await axios.delete(`${API_BASE}/api/alerts/${id}`, { headers: await authHeader() });
    } catch { fetchAlerts(); }
  };

  const toggleExpand = (id: string, isRead: boolean) => {
    setExpanded(prev => prev === id ? null : id);
    if (!isRead) markRead(id);
  };

  // Filter
  const filtered = alerts.filter(a => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !a.is_read;
    const cfg = ALERT_CONFIG[a.alert_type];
    return cfg?.tab === activeTab;
  });

  // Tab counts
  const tabCounts: Record<string, number> = {
    All: alerts.length,
    Unread: alerts.filter(a => !a.is_read).length,
    Budget: alerts.filter(a => a.alert_type === 'budget_warning').length,
    Fraud: alerts.filter(a => a.alert_type === 'fraud').length,
    Savings: alerts.filter(a => a.alert_type === 'savings_opportunity').length,
    EMI: alerts.filter(a => a.alert_type === 'emi_due').length,
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Sidebar alertCount={tabCounts.Unread} />

      <main className="md:ml-[240px] px-4 md:px-6 py-6 pb-24 md:pb-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Alerts & Notifications</h1>
              <p className="text-gray-400 text-sm mt-1">{tabCounts.Unread} unread</p>
            </div>
            {tabCounts.Unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none mb-5 pb-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all
                  ${activeTab === tab
                    ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {tab === 'Budget' && '💛'}
                {tab === 'Fraud' && '🔴'}
                {tab === 'Savings' && '💚'}
                {tab === 'EMI' && '🔵'}
                {tab}
                {tabCounts[tab] > 0 && (
                  <span className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold
                    ${activeTab === tab ? 'bg-sky-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                    {tabCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Alert list */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-3">
                    <Skel h="h-10" w="w-10" r="rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skel h="h-4" w="w-48" />
                      <Skel h="h-3" w="w-full" />
                      <Skel h="h-3" w="w-3/4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-400/10 flex items-center justify-center mb-4">
                <Check size={36} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">You're all clear!</h2>
              <p className="text-gray-400 text-sm">No alerts in this category. Your finances look healthy!</p>
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((alert, i) => {
                  const cfg = ALERT_CONFIG[alert.alert_type] || ALERT_CONFIG.budget_warning;
                  const Icon = cfg.icon;
                  const isExpanded = expanded === alert.id;

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                      transition={{ delay: i * 0.04 }}
                      layout
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all group
                          ${!alert.is_read ? 'border-white/12 bg-white/4' : 'border-white/5'}
                          hover:border-white/20`}
                        onClick={() => toggleExpand(alert.id, alert.is_read)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                            <Icon size={16} className={cfg.color} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${alert.is_read ? 'text-gray-300' : 'text-white'}`}>
                                {alert.title}
                              </p>
                              <div className="flex items-center gap-2 shrink-0">
                                {!alert.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                                )}
                                <span className="text-xs text-gray-600">{relTime(alert.created_at)}</span>
                              </div>
                            </div>

                            <p className={`text-sm text-gray-400 mt-0.5 ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {alert.message}
                            </p>

                            {alert.action_url && isExpanded && (
                              <button
                                onClick={e => { e.stopPropagation(); navigate(alert.action_url); }}
                                className="mt-2 flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
                              >
                                Take Action <ExternalLink size={11} />
                              </button>
                            )}
                          </div>

                          {/* Actions on hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {!alert.is_read && (
                              <button
                                onClick={e => { e.stopPropagation(); markRead(alert.id); }}
                                title="Mark read"
                                className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={e => deleteAlert(alert.id, e)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                            <ChevronDown
                              size={14}
                              className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
