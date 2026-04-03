import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Globe, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../store/authStore';
import { useAuthModal } from '../../hooks/useAuth';

export const AuthModal = () => {
  const { isOpen, closeModal } = useAuthModal();
  const { 
    signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset,
    sendPhoneOTP, verifyPhoneOTP, error, clearError, loading 
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'email' | 'phone' | 'google'>('email');
  
  // Email state
  const [emailMode, setEmailMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Phone state
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setTimeout(() => {
        setActiveTab('email');
        setEmailMode('login');
        setPhoneStep(1);
        clearError();
      }, 300);
    }
  }, [isOpen, clearError]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (emailMode === 'login') {
      await signInWithEmail(email, password);
      if (!useAuthStore.getState().error) closeModal();
    } else if (emailMode === 'signup') {
      await signUpWithEmail(email, password, name);
      if (!useAuthStore.getState().error) closeModal();
    } else if (emailMode === 'reset') {
      await sendPasswordReset(email);
      // Stay open, potentially show success msg
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const fullNumber = `${countryCode}${phoneNumber}`;
    await sendPhoneOTP(fullNumber);
    if (!useAuthStore.getState().error) {
      setPhoneStep(2);
      setCountdown(30);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const otpCode = otp.join('');
    await verifyPhoneOTP(otpCode);
    if (!useAuthStore.getState().error) closeModal();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const tabs = [
    { id: 'email', label: 'Email', icon: <Mail size={16} /> },
    { id: 'phone', label: 'Phone', icon: <Phone size={16} /> },
    { id: 'google', label: 'Google', icon: <Globe size={16} /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md">
      <div className="flex flex-col gap-6">
        {/* Header & Tabs */}
        <div>
          <h2 className="text-2xl font-bold font-heading text-white mb-6">Welcome to PaySense AI</h2>
          
          <div className="flex relative border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); clearError(); }}
                className={`flex-1 flex justify-center items-center gap-2 pb-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-sky-400' : 'text-gray-400 hover:text-white'}`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute bottom-0 h-[2px] bg-sky-500 w-1/3"
                    initial={false}
                    animate={{ left: `${tabs.findIndex(t => t.id === tab.id) * 33.33}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2"
            >
              <AlertCircle size={16} className="shrink-0" />
              <p className="flex-1">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form area */}
        <div className="min-h-[250px]">
          
          {/* TAB 1: EMAIL */}
          {activeTab === 'email' && (
            <motion.form 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              onSubmit={handleEmailSubmit} className="flex flex-col gap-4"
            >
              {emailMode === 'signup' && (
                <Input label="Full Name" placeholder="e.g. Rahul Sharma" value={name} onChange={e => setName(e.target.value)} required />
              )}
              
              <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              
              {emailMode !== 'reset' && (
                <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              )}
              
              {emailMode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setEmailMode('reset')} className="text-xs text-sky-400 hover:text-sky-300">
                    Forgot Password?
                  </button>
                </div>
              )}
              
              <Button type="submit" variant="primary" fullWidth loading={loading} className="mt-2">
                {emailMode === 'login' ? 'Sign In' : emailMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </Button>
              
              <div className="text-center text-sm text-gray-400 mt-2">
                {emailMode === 'login' ? (
                  <>Don't have an account? <button type="button" onClick={() => setEmailMode('signup')} className="text-white hover:underline">Sign up</button></>
                ) : (
                  <>Already have an account? <button type="button" onClick={() => setEmailMode('login')} className="text-white hover:underline">Log in</button></>
                )}
              </div>
            </motion.form>
          )}

          {/* TAB 2: PHONE */}
          {activeTab === 'phone' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              
              {phoneStep === 1 ? (
                <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
                  <div className="text-sm text-gray-400 mb-2">We'll send you a verification code via SMS.</div>
                  <div className="flex gap-2">
                    <select 
                      className="bg-[#1F2937] border border-white/10 rounded-xl px-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 w-24 shrink-0"
                      value={countryCode} onChange={e => setCountryCode(e.target.value)}
                    >
                      <option value="+91">IN (+91)</option>
                      <option value="+1">US (+1)</option>
                    </select>
                    <Input 
                      placeholder="10-digit number" 
                      type="tel" 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      required
                    />
                  </div>
                  
                  <div id="recaptcha-container" className="my-2" />
                  
                  <Button type="submit" variant="primary" fullWidth loading={loading} disabled={phoneNumber.length < 10}>
                    Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4 items-center">
                  <div className="text-sm text-gray-400 mb-4 text-center">
                    Sent to {countryCode} {phoneNumber}. <button type="button" onClick={() => setPhoneStep(1)} className="text-sky-400 hover:underline">Change</button>
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        className="w-12 h-14 bg-[#1F2937] border border-white/10 rounded-xl text-center text-xl text-white font-bold focus:outline-none focus:ring-2 focus:border-sky-500"
                        type="text"
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                      />
                    ))}
                  </div>

                  <Button type="submit" variant="primary" fullWidth loading={loading} className="mt-4" disabled={otp.join('').length < 6}>
                    Verify OTP
                  </Button>

                  <div className="text-center mt-2">
                    {countdown > 0 ? (
                      <span className="text-sm text-gray-500">Wait {countdown}s to resend</span>
                    ) : (
                      <button type="button" onClick={handlePhoneSubmit} className="text-sm text-sky-400 hover:text-white flex items-center gap-1 mx-auto">
                        <RefreshCw size={14} /> Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* TAB 3: GOOGLE */}
          {activeTab === 'google' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center justify-center h-full text-center py-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg glow-blue">
                <svg width="32" height="32" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Continue with Google</h3>
              <p className="text-sm text-gray-400 mb-8">No passwords needed. Simple and secure.</p>
              
              <Button 
                onClick={async () => {
                  await signInWithGoogle();
                  if (!useAuthStore.getState().error) closeModal();
                }} 
                variant="primary" 
                fullWidth 
                loading={loading}
              >
                Sign in with Google
              </Button>
            </motion.div>
          )}

        </div>
      </div>
    </Modal>
  );
};
