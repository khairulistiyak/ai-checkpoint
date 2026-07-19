import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
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
  let bg = 'bg-primary-900/40 border-primary-500/50';
  let iconColor = 'text-primary-400';

  if (toast.type === 'success') {
    Icon = CheckCircle2;
    bg = 'bg-emerald-900/40 border-emerald-500/50';
    iconColor = 'text-emerald-400';
  } else if (toast.type === 'error') {
    Icon = AlertTriangle;
    bg = 'bg-red-900/40 border-red-500/50';
    iconColor = 'text-red-400';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      layout
      className={`flex items-center gap-3 p-4 pr-12 rounded-xl border backdrop-blur-xl shadow-2xl relative overflow-hidden min-w-[300px] ${bg}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
      <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
      <p className="text-sm font-medium text-slate-100 flex-1">{toast.message}</p>
      <button 
        onClick={onRemove}
        className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
