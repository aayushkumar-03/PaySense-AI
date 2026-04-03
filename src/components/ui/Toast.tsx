import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, ToastMessage } from '../../hooks/useToast';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, onRemove }: { toast: ToastMessage, onRemove: () => void }) => {
  
  const variants = {
    success: { border: 'border-l-emerald-500', icon: <CheckCircle className="text-emerald-500" size={18} /> },
    error: { border: 'border-l-red-500', icon: <AlertCircle className="text-red-500" size={18} /> },
    warning: { border: 'border-l-amber-500', icon: <AlertTriangle className="text-amber-500" size={18} /> },
    info: { border: 'border-l-sky-500', icon: <Info className="text-sky-500" size={18} /> },
  };

  const style = variants[toast.variant];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`min-w-72 bg-[#1F2937] border border-white/10 ${style.border} border-l-[3px] rounded-xl px-4 py-3 shadow-2xl pointer-events-auto flex items-start gap-3`}
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1 text-sm text-white font-medium pr-4">
        {toast.message}
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-white transition-colors mt-0.5">
        <X size={16} />
      </button>
    </motion.div>
  );
};
