import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar, setActiveModal, activeModal } = useUiStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // Escape: close any open modal
      if (e.key === 'Escape' && activeModal) {
        e.preventDefault();
        setActiveModal(null);
        return;
      }

      // Cmd/Ctrl+/ → toggle sidebar
      if (meta && e.key === '/') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Cmd/Ctrl+K → focus quick-ask or open chat
      if (meta && e.key === 'k') {
        e.preventDefault();
        if (location.pathname === '/dashboard') {
          // Focus the quick ask bar — Dashboard listens for this via its own useEffect
          window.dispatchEvent(new CustomEvent('paysense:focus-quick-ask'));
        } else {
          navigate('/chat');
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, location.pathname, toggleSidebar, setActiveModal, activeModal]);
}
