import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../ui/Spinner';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, initialized } = useAuthStore();
  const location = useLocation();
  const [showSpinner, setShowSpinner] = useState(true);

  // Give a small minimum render time to prevent flashes
  useEffect(() => {
    if (initialized) {
      const timer = setTimeout(() => setShowSpinner(false), 300);
      return () => clearTimeout(timer);
    }
  }, [initialized]);

  if (!initialized || showSpinner) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-sky-500 w-16 h-16 animate-spin [animation-duration:3s]" />
          <div className="absolute inset-0 rounded-full border-r-2 border-indigo-500 w-16 h-16 animate-spin [animation-duration:2s]" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg relative z-10">
            <span className="text-white font-bold font-logo text-2xl leading-none">P</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm font-medium tracking-widest animate-pulse">AUTHENTICATING</p>
      </div>
    );
  }

  if (!user) {
    sessionStorage.setItem('intendedPath', location.pathname);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
