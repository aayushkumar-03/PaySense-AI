import { useState, useEffect, useRef } from 'react';

const DISMISSED_KEY = 'paysense_pwa_install_dismissed';

export function usePWAInstall() {
  const promptRef = useRef<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e;
      setCanInstall(true);

      // Show banner after 60 seconds on mobile
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      if (isMobile) {
        setTimeout(() => setShowBanner(true), 60_000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
      setCanInstall(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const showInstallPrompt = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!promptRef.current) return 'unavailable';
    promptRef.current.prompt();
    const { outcome } = await promptRef.current.userChoice;
    promptRef.current = null;
    setCanInstall(false);
    setShowBanner(false);
    return outcome;
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  return { canInstall, showBanner, dismissBanner, showInstallPrompt, installed };
}
