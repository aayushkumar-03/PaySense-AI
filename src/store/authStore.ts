import { create } from 'zustand';
import type { User, ConfirmationResult } from 'firebase/auth';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, signOut, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  confirmationResult: ConfirmationResult | null;
  
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPhoneOTP: (phoneNumber: string) => Promise<void>;
  verifyPhoneOTP: (otp: string) => Promise<void>;
  clearError: () => void;
  setInitialized: (val: boolean) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen to auth state changes
  auth.onAuthStateChanged((user) => {
    set({ user, loading: false, initialized: true });
  });

  return {
    user: null,
    loading: false,
    error: null,
    initialized: false,
    confirmationResult: null,

    setInitialized: (val) => set({ initialized: val }),
    setUser: (user) => set({ user }),

    signInWithGoogle: async () => {
      set({ loading: true, error: null });
      try {
        const result = await signInWithPopup(auth, googleProvider);
        // Additional navigation logic is handled in the components/hooks
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },

    signInWithEmail: async (email, password) => {
      set({ loading: true, error: null });
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },

    signUpWithEmail: async (email, password, displayName) => {
      set({ loading: true, error: null });
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        // Trigger a force refresh of the user state to pick up the displayName
        set({ user: { ...result.user } as User });
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },

    sendPasswordReset: async (email) => {
      set({ loading: true, error: null });
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },

    signOut: async () => {
      set({ loading: true, error: null });
      try {
        await signOut(auth);
        set({ user: null });
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },

    sendPhoneOTP: async (phoneNumber) => {
      set({ loading: true, error: null });
      try {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
        }
        
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        set({ confirmationResult });
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },

    verifyPhoneOTP: async (otp) => {
      const { confirmationResult } = get();
      if (!confirmationResult) {
        set({ error: 'No OTP requested' });
        return;
      }
      
      set({ loading: true, error: null });
      try {
        await confirmationResult.confirm(otp);
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ loading: false });
      }
    },

    clearError: () => set({ error: null })
  };
});
