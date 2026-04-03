import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { create } from 'zustand';

// Global store for the Auth Modal visibility
interface AuthModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

export const useAuthModal = () => {
  return useAuthModalStore();
};

export const useRequireAuth = () => {
  const { user, initialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !user) {
      sessionStorage.setItem('intendedPath', window.location.pathname);
      navigate('/');
    }
  }, [user, initialized, navigate]);
};

export const useRedirectIfAuth = () => {
  const { user, initialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && user) {
      navigate('/dashboard');
    }
  }, [user, initialized, navigate]);
};
