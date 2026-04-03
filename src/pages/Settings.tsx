import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Globe, Bell, Shield, AlertTriangle, CreditCard,
  Plus, Check, X, Trash2, Edit3, Camera, Eye, EyeOff
} from 'lucide-react';
import axios from 'axios';
import { Sidebar } from '../components/layout/Sidebar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { getCurrentUserToken, auth } from '../lib/firebase';
import {
  updatePassword, EmailAuthProvider,
  reauthenticateWithCredential, deleteUser
} from 'firebase/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function apiGet<T>(path: string): Promise<T> {
  const token = await getCurrentUserToken();
  const { data } = await axios.get<T>(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  return data;
}
async function apiPatch<T>(path: string, body: any): Promise<T> {
  const token = await getCurrentUserToken();
  const { data } = await axios.patch<T>(`${API_BASE}${path}`, body, { headers: { Authorization: `Bearer ${token}` } });
  return data;
}
async function apiPost<T>(path: string, body?: any): Promise<T> {
  const token = await getCurrentUserToken();
  const { data } = await axios.post<T>(`${API_BASE}${path}`, body, { headers: { Authorization: `Bearer ${token}` } });
  return data;
}
async function apiDelete(path: string): Promise<void> {
  const token = await getCurrentUserToken();
  await axios.delete(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
}

// ── Switch Toggle ──────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none
      ${checked ? 'bg-sky-500' : 'bg-white/10'}`}
  >
    <motion.span
      animate={{ x: checked ? 20 : 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
    />
  </button>
);

// ── Section wrapper ────────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children, className = '' }: any) => (
  <Card className={`p-6 space-y-5 ${className}`}>
    <div className="flex items-center gap-2">
      <Icon size={18} className="text-sky-400" />
      <h2 className="text-base font-semibold text-white">{title}</h2>
    </div>
    {children}
  </Card>
);

// ── Notification prefs key ─────────────────────────────────────────────────────
const NOTIF_KEY = 'paysense_notif_prefs';
const DEFAULT_NOTIFS = { budget: true, fraud: true, credit: true, savings: true };

const BUDGET_CATEGORIES = [
  { id: 'food', label: 'Food' }, { id: 'transport', label: 'Transport' },
  { id: 'shopping', label: 'Shopping' }, { id: 'bills', label: 'Bills' },
  { id: 'entertainment', label: 'Entertainment' }, { id: 'health', label: 'Health' },
];

// ─── Settings Page ─────────────────────────────────────────────────────────────
export const Settings = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Preferences
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [notifs, setNotifs] = useState<Record<string, boolean>>(DEFAULT_NOTIFS);

  // Budgets
  const [budgets, setBudgets] = useState<any[]>([]);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudgetCat, setNewBudgetCat] = useState('food');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  // Security
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Danger zone
  const [confirmText, setConfirmText] = useState('');
  const [dangerModal, setDangerModal] = useState<null | 'data' | 'account'>(null);

  // Plan
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await apiGet<any>('/api/auth/profile');
        setDbProfile(p);
        setDisplayName(p.display_name || user?.displayName || '');
        setPhone(p.phone || '');
        setPhotoUrl(p.photo_url || '');
        setLanguage(p.preferred_language || 'en');
      } catch { /* silent */ }

      try {
        const b = await apiGet<any>('/api/budgets');
        setBudgets(b.budgets || b || []);
      } catch { /* silent */ }

      const saved = localStorage.getItem(NOTIF_KEY);
      if (saved) setNotifs(JSON.parse(saved));
    };
    load();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await apiPatch('/api/auth/profile', {
        display_name: displayName, phone, photo_url: photoUrl, preferred_language: language
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch { /* silent */ } finally {
      setSavingProfile(false);
    }
  };

  const saveNotifs = (key: string, val: boolean) => {
    const next = { ...notifs, [key]: val };
    setNotifs(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  };

  const saveBudgetInline = async (budgetId: string) => {
    const amt = parseFloat(editingValue);
    if (isNaN(amt)) return;
    await apiPatch(`/api/budgets/${budgetId}`, { monthly_limit: amt });
    setBudgets(prev => prev.map(b => b.id === budgetId ? { ...b, monthly_limit: amt } : b));
    setEditingBudget(null);
  };

  const addBudget = async () => {
    const amt = parseFloat(newBudgetAmount);
    if (!amt) return;
    const month = new Date().toISOString().slice(0, 7);
    const result = await apiPost<any>('/api/budgets', { category: newBudgetCat, monthly_limit: amt, month_year: month });
    setBudgets(prev => [...prev, result]);
    setShowAddBudget(false);
    setNewBudgetAmount('');
  };

  const handlePasswordChange = async () => {
    setPwdError('');
    setPwdMsg('');
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match'); return; }
    if (newPwd.length < 6) { setPwdError('Password must be at least 6 characters'); return; }
    try {
      if (!auth.currentUser || !auth.currentUser.email) return;
      const cred = EmailAuthProvider.credential(auth.currentUser.email, oldPwd);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPwd);
      setPwdMsg('Password updated successfully!');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) {
      setPwdError(e.message || 'Failed to update password');
    }
  };

  const handleDeleteData = async () => {
    if (confirmText !== 'DELETE') return;
    await apiDelete('/api/auth/data');
    setDangerModal(null);
    setConfirmText('');
    navigate('/dashboard');
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    await apiDelete('/api/auth/account');
    if (auth.currentUser) await deleteUser(auth.currentUser);
    await signOut();
    navigate('/');
  };

  const handleUpgrade = async () => {
    await apiPatch('/api/auth/profile', { plan: 'pro' });
    setDbProfile((p: any) => ({ ...p, plan: 'pro' }));
    setShowUpgradeModal(false);
  };

  const isEmailUser = auth.currentUser?.providerData?.[0]?.providerId === 'password';
  const plan = dbProfile?.plan || 'free';

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Sidebar alertCount={0} />

      <main className="md:ml-[240px] px-4 md:px-6 py-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-white">Settings</h1>

          {/* ── SECTION 1: Profile ─────────────────────────────────────────── */}
          <Section icon={User} title="Profile">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                {photoUrl
                  ? <img src={photoUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                  : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                      {(displayName || 'U')[0].toUpperCase()}
                    </div>
                  )
                }
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={16} className="text-white" />
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <div>
                <p className="text-sm font-medium text-white">{displayName || 'Your Name'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Display Name" value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your full name"
              />
              <Input
                label="Email" value={user?.email || ''} disabled
                className="opacity-50 cursor-not-allowed"
              />
              <Input
                label="Phone Number" value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                type="tel"
              />
            </div>

            <Button
              variant="primary" size="sm" onClick={saveProfile} loading={savingProfile}
              leftIcon={profileSaved ? <Check size={14} /> : undefined}
            >
              {profileSaved ? 'Saved!' : 'Save Changes'}
            </Button>
          </Section>

          {/* ── SECTION 2: Preferences ─────────────────────────────────────── */}
          <Section icon={Globe} title="Preferences">
            <div>
              <label className="text-sm font-medium text-white block mb-2">Default Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="bg-[#1F2937] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500/50 w-full"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-medium text-white mb-3">Notification Preferences</p>
              <div className="space-y-3">
                {[
                  { key: 'budget',  label: 'Budget warnings' },
                  { key: 'fraud',   label: 'Fraud alerts' },
                  { key: 'credit',  label: 'Credit score changes' },
                  { key: 'savings', label: 'Savings tips' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-300">{label}</span>
                    <Toggle checked={notifs[key]} onChange={v => saveNotifs(key, v)} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-white mb-2">Theme</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl text-sm bg-sky-500/15 border border-sky-500/40 text-sky-400">
                  🌙 Dark
                </button>
                <button className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-gray-400 relative">
                  ☀️ Light
                  <Badge variant="neutral" className="absolute -top-2 -right-2 text-[9px] px-1 py-0">Soon</Badge>
                </button>
              </div>
            </div>
          </Section>

          {/* ── SECTION 3: Budgets ─────────────────────────────────────────── */}
          <Section icon={CreditCard} title="Monthly Budgets">
            <div className="space-y-2">
              {budgets.map((budget: any) => (
                <div key={budget.id} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm capitalize text-white">{budget.category}</span>
                  <div className="flex items-center gap-2">
                    {editingBudget === budget.id ? (
                      <>
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                          <span className="text-gray-400 text-xs">₹</span>
                          <input
                            type="number" value={editingValue}
                            onChange={e => setEditingValue(e.target.value)}
                            className="w-20 bg-transparent text-white text-sm outline-none"
                            autoFocus
                          />
                        </div>
                        <button onClick={() => saveBudgetInline(budget.id)} className="text-emerald-400 hover:text-emerald-300">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingBudget(null)} className="text-gray-500 hover:text-white">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-white">₹{Number(budget.monthly_limit).toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => { setEditingBudget(budget.id); setEditingValue(String(budget.monthly_limit)); }}
                          className="text-gray-500 hover:text-white"
                        >
                          <Edit3 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Budget */}
            {showAddBudget ? (
              <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-white">Add Category Budget</p>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newBudgetCat}
                    onChange={e => setNewBudgetCat(e.target.value)}
                    className="bg-[#1F2937] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  >
                    {BUDGET_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <div className="flex items-center gap-1 bg-[#1F2937] border border-white/10 rounded-xl px-3 py-2">
                    <span className="text-gray-400 text-sm">₹</span>
                    <input
                      type="number" value={newBudgetAmount}
                      onChange={e => setNewBudgetAmount(e.target.value)}
                      placeholder="0" className="flex-1 bg-transparent text-white text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={addBudget}>Add</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddBudget(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddBudget(true)}
                className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
              >
                <Plus size={16} /> Add Category Budget
              </button>
            )}
          </Section>

          {/* ── SECTION 4: Plan & Billing ──────────────────────────────────── */}
          <Section icon={CreditCard} title="Plan & Billing">
            <div className={`rounded-2xl p-5 border ${plan === 'pro' ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white/3 border-white/8'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-white">{plan === 'pro' ? '⭐ Pro Plan' : 'Free Plan'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {plan === 'pro'
                      ? `Unlimited queries · Pro member`
                      : `5 AI queries/day · ${dbProfile?.queries_used_today || 0}/5 used today`}
                  </p>
                </div>
                {plan === 'pro'
                  ? <Badge variant="info">Active</Badge>
                  : <Button variant="primary" size="sm" onClick={() => setShowUpgradeModal(true)}>Upgrade to Pro</Button>
                }
              </div>

              {plan === 'free' && (
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((dbProfile?.queries_used_today || 0) / 5) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </Section>

          {/* ── SECTION 5: Security ──────────────────────────────────────────── */}
          <Section icon={Shield} title="Security">
            {isEmailUser && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-white">Change Password</p>
                <Input
                  label="Current Password" type={showPwd ? 'text' : 'password'}
                  value={oldPwd} onChange={e => setOldPwd(e.target.value)}
                  rightIcon={
                    <button onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <Input
                  label="New Password" type={showPwd ? 'text' : 'password'}
                  value={newPwd} onChange={e => setNewPwd(e.target.value)}
                />
                <Input
                  label="Confirm New Password" type={showPwd ? 'text' : 'password'}
                  value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                  error={pwdError}
                />
                {pwdMsg && <p className="text-emerald-400 text-sm">{pwdMsg}</p>}
                <Button variant="primary" size="sm" onClick={handlePasswordChange}>Update Password</Button>
              </div>
            )}
            <div className="pt-2 border-t border-white/5">
              <Button variant="danger" size="sm" onClick={() => { signOut(); navigate('/'); }}>
                Sign out all devices
              </Button>
            </div>
          </Section>

          {/* ── SECTION 6: Danger Zone ────────────────────────────────────── */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={18} />
              <h2 className="text-base font-semibold">Danger Zone</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white font-medium">Delete All My Data</p>
                  <p className="text-xs text-gray-500">Removes all transactions, budgets, and alerts. Your account stays active.</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => { setDangerModal('data'); setConfirmText(''); }}>
                  Delete Data
                </Button>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white font-medium">Delete Account</p>
                  <p className="text-xs text-gray-500">Permanently deletes your account and all data. Cannot be undone.</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => { setDangerModal('account'); setConfirmText(''); }}>
                  Delete Account
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Upgrade Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111827] border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-white mb-1">Upgrade to PaySense Pro ⭐</h3>
              <p className="text-gray-400 text-sm mb-5">Unlock unlimited AI queries and all premium features</p>
              <div className="space-y-2 mb-5">
                {['Unlimited AI conversations daily', 'Priority fraud detection', 'Advanced credit coaching', 'Export reports to PDF'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={14} className="text-emerald-400" /> {f}
                  </div>
                ))}
              </div>
              <p className="text-2xl font-bold text-white mb-4">₹199 <span className="text-sm text-gray-400 font-normal">/month</span></p>
              <Button variant="primary" fullWidth onClick={handleUpgrade}>Confirm Upgrade</Button>
              <Button variant="ghost" fullWidth onClick={() => setShowUpgradeModal(false)} className="mt-2">Maybe Later</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Danger Confirm Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {dangerModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              className="bg-[#111827] border border-red-500/20 rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={22} className="text-red-400" />
                <h3 className="text-base font-bold text-white">
                  {dangerModal === 'data' ? 'Delete All Data?' : 'Delete Account?'}
                </h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                This action <strong>cannot be undone</strong>. Type <code className="bg-white/10 px-1 rounded text-red-300">DELETE</code> to confirm.
              </p>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none mb-4 focus:border-red-500/50"
              />
              <div className="flex gap-2">
                <Button
                  variant="danger" className="flex-1"
                  disabled={confirmText !== 'DELETE'}
                  onClick={dangerModal === 'data' ? handleDeleteData : handleDeleteAccount}
                >
                  Confirm Delete
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => setDangerModal(null)}>Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
