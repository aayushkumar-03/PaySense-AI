import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from './components/ui/Toast';
import { GlobalToastContainer } from './components/ui/GlobalToast';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/Dashboard';
import { ChatPage } from './pages/ChatPage';
import { SpendAnalysis } from './pages/SpendAnalysis';
import { CreditCoach } from './pages/CreditCoach';
import { Onboarding } from './pages/Onboarding';
import { Settings } from './pages/Settings';
import { AlertsPage } from './pages/AlertsPage';
import { useAlertPolling } from './hooks/useAlertPolling';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useAuthStore } from './store/authStore';
import { motion, AnimatePresence as FMPresence } from 'framer-motion';
import { X } from 'lucide-react';

// ── PWA Install Banner ────────────────────────────────────────────────────────
function PWABanner() {
  const { showBanner, dismissBanner, showInstallPrompt } = usePWAInstall();
  return (
    <FMPresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 bg-[#111827] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Add to Home Screen 📱</p>
            <p className="text-xs text-gray-400">PaySense AI works offline too!</p>
          </div>
          <button
            onClick={showInstallPrompt}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 shrink-0"
          >
            Install
          </button>
          <button onClick={dismissBanner} className="text-gray-600 hover:text-gray-400 shrink-0">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </FMPresence>
  );
}

// ── Inner App (needs router context for hooks) ────────────────────────────────
function AppInner() {
  const { user } = useAuthStore();

  // Global hooks
  useAlertPolling(!!user);
  useKeyboardShortcuts();

  return (
    <>
      <ToastContainer />
      <GlobalToastContainer />
      <AuthModal />
      <PWABanner />

      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/"             element={<LandingPage />} />
          <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/chat"         element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/credit-coach" element={<ProtectedRoute><CreditCoach /></ProtectedRoute>} />
          <Route path="/analysis"     element={<ProtectedRoute><SpendAnalysis /></ProtectedRoute>} />
          <Route path="/onboarding"   element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/alerts"       element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0A0F1E] text-white">
        <AppInner />
      </div>
    </BrowserRouter>
  );
}

export default App;
