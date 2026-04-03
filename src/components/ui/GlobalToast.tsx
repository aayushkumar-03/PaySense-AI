import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useUiStore, type ToastItem } from '../../store/uiStore';

const ICONS = {
  success: <CheckCircle size={16} className="text-emerald-400" />,
  error:   <XCircle    size={16} className="text-red-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
  info:    <Info       size={16} className="text-sky-400" />,
};

const BG = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error:   'border-red-500/30    bg-red-500/10',
  warning: 'border-amber-500/30  bg-amber-500/10',
  info:    'border-sky-500/30    bg-sky-500/10',
};

function Toast({ toast }: { toast: ToastItem }) {
  const { removeToast } = useUiStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3 bg-[#111827] border rounded-2xl px-4 py-3 shadow-2xl
        min-w-[280px] max-w-[360px] ${BG[toast.type]}`}
    >
      <span className="shrink-0 mt-0.5">{ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-snug line-clamp-3">{toast.message}</p>
        {toast.actionLabel && (
          <button
            onClick={() => { toast.onAction?.(); removeToast(toast.id); }}
            className="mt-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
          >
            {toast.actionLabel} →
          </button>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-gray-500 hover:text-white transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function GlobalToastContainer() {
  const { toasts } = useUiStore();

  return (
    <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
