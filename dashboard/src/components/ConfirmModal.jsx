import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { GlassButton } from './ui/GlassButton';

export default function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, danger }) {
  const readyRef = React.useRef(false);
  React.useEffect(() => {
    readyRef.current = false;
    const timer = setTimeout(() => { readyRef.current = true; }, 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && readyRef.current) {
        e.stopPropagation();
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onCancel}></div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-card p-6 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 border border-white/[0.08]"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title || 'Confirm'}</h3>
            <p className="text-sm text-slate-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <GlassButton
            onClick={onCancel}
            variant="ghost"
          >
            {cancelText || 'Cancel'}
          </GlassButton>
          <GlassButton
            onClick={onConfirm}
            variant={danger ? 'danger' : 'primary'}
          >
            {confirmText || 'Confirm'}
          </GlassButton>
        </div>
      </motion.div>
    </div>
  );
}
