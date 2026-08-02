import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timerMap = useRef(new Map());

  useEffect(() => {
    return () => {
      timerMap.current.forEach((t) => clearTimeout(t));
      timerMap.current.clear();
    };
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timerMap.current.delete(id);
    }, 3000);
    timerMap.current.set(id, timer);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

function Toast({ toast, onRemove }) {
  let Icon = Info;
  let bg = 'bg-[#121214] border-white/15';
  let iconColor = 'text-white/80';

  if (toast.type === 'success') {
    Icon = CheckCircle2;
    bg = 'bg-[#121214] border-white/20';
    iconColor = 'text-white';
  } else if (toast.type === 'error') {
    Icon = AlertTriangle;
    bg = 'bg-[#161113] border-red-500/25';
    iconColor = 'text-red-400';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      layout
      className={`flex items-center gap-3.5 p-4 pr-12 rounded-2xl border shadow-xl relative overflow-hidden min-w-[300px] ${bg}`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
      <p className="text-xs font-mono text-zinc-200 flex-1">{toast.message}</p>
      <button
        onClick={onRemove}
        className="absolute right-3 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
