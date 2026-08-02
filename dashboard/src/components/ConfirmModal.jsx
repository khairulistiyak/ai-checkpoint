import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { GlassButton } from './ui/GlassButton';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  danger,
}) {
  const readyRef = React.useRef(false);
  React.useEffect(() => {
    readyRef.current = false;
    const timer = setTimeout(() => {
      readyRef.current = true;
    }, 200);
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
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#121214] p-6 rounded-3xl shadow-2xl w-full max-w-sm relative z-10 border border-white/[0.08]"
      >
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              danger ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/[0.04] border border-white/10'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-zinc-300'}`}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-outfit">
              {title || 'Confirm Action'}
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <GlassButton onClick={onCancel} variant="ghost">
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
