import { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useUiStore } from '../store/uiStore';
import { getCurrentUserToken } from '../lib/firebase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const POLL_INTERVAL = 30_000; // 30 seconds
const INACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export function useAlertPolling(enabled = true) {
  const { setUnreadAlertCount, addToast } = useUiStore();
  const prevCountRef = useRef<number>(-1);
  const lastActivityRef = useRef<number>(Date.now());

  // Track user activity
  useEffect(() => {
    const bump = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', bump);
    window.addEventListener('keydown', bump);
    window.addEventListener('click', bump);
    return () => {
      window.removeEventListener('mousemove', bump);
      window.removeEventListener('keydown', bump);
      window.removeEventListener('click', bump);
    };
  }, []);

  const poll = useCallback(async () => {
    // Skip if tab hidden or user inactive > 5 min
    if (document.visibilityState === 'hidden') return;
    if (Date.now() - lastActivityRef.current > INACTIVE_THRESHOLD) return;

    try {
      const token = await getCurrentUserToken();
      if (!token) return;

      const { data } = await axios.get<any[]>(
        `${API_BASE}/api/alerts?unread_only=true&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const count = Array.isArray(data) ? data.length : 0;
      setUnreadAlertCount(count);

      // Show toast for each new alert since last poll
      if (prevCountRef.current >= 0 && count > prevCountRef.current) {
        const newAlerts = data.slice(0, count - prevCountRef.current);
        newAlerts.forEach((alert: any) => {
          const type =
            alert.alert_type === 'fraud' ? 'error'
            : alert.alert_type === 'savings_opportunity' ? 'success'
            : 'warning';
          addToast({
            type,
            message: alert.title || alert.message?.slice(0, 80) || 'New alert',
            duration: type === 'error' ? 6000 : 4000,
            actionLabel: 'View',
          });
        });
      }

      prevCountRef.current = count;
    } catch {
      /* silent — don't spam toasts on network errors */
    }
  }, [setUnreadAlertCount, addToast]);

  useEffect(() => {
    if (!enabled) return;

    // Initial poll
    poll();

    const interval = setInterval(poll, POLL_INTERVAL);
    const onVisible = () => { if (document.visibilityState === 'visible') poll(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, poll]);
}
