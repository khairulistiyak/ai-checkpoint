import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Palette } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const themes = [
  { id: 'default', name: 'Amethyst & Fuchsia', primary: 'bg-primary-500', accent: 'bg-accent-500' },
  { id: 'emerald', name: 'Emerald & Mint', primary: 'bg-emerald-600', accent: 'bg-emerald-400' },
  { id: 'blue', name: 'Ocean Blue', primary: 'bg-blue-600', accent: 'bg-blue-400' },
];

export default function SettingsModal({ isOpen, onClose }) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-md bg-slate-900/95 border-slate-700/80 shadow-2xl relative z-10"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent-400" />
            <h2 className="text-lg font-bold text-white">Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Theme & Accent</h3>
            </div>
            
            <div className="space-y-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    theme === t.id 
                      ? 'bg-accent-500/20 border-accent-500/50' 
                      : 'bg-slate-800/50 border-transparent hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className={`font-medium ${theme === t.id ? 'text-white' : 'text-slate-300'}`}>
                    {t.name}
                  </span>
                  <div className="flex">
                    <div className={`w-4 h-4 rounded-full ${t.primary} shadow-md border border-white/10 relative z-0 -mr-1`}></div>
                    <div className={`w-4 h-4 rounded-full ${t.accent} shadow-md border border-white/10 relative z-10`}></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
