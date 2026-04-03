import { create } from 'zustand';

interface UiState {
  language: 'en' | 'hi' | 'mix';
  setLanguage: (lang: 'en' | 'hi' | 'mix') => void;

  unreadAlertCount: number;
  setUnreadAlertCount: (n: number) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;

  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),

  unreadAlertCount: 0,
  setUnreadAlertCount: (n) => set({ unreadAlertCount: n }),

  sidebarCollapsed: false,
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),

  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const item: ToastItem = { ...toast, id };
    set(s => ({ toasts: [...s.toasts.slice(-2), item] })); // max 3
    const duration = toast.duration ?? (toast.type === 'error' ? 6000 : 4000);
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
