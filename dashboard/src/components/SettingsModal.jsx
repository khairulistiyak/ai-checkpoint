import React from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Palette, Check } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const themes = [
  {
    id: 'studio',
    name: 'Apple Studio Monochrome (Default)',
    desc: 'Pure matte black & zinc with zero color glare',
    primary: 'bg-zinc-900',
    accent: 'bg-zinc-100',
  },
  {
    id: 'midnight',
    name: 'Midnight Graphite Matte',
    desc: 'Deep neutral obsidian with soft silver contrasts',
    primary: 'bg-neutral-900',
    accent: 'bg-neutral-400',
  },
  {
    id: 'zinc',
    name: 'Sleek Zinc Studio',
    desc: 'Precision engineering monochrome dark slate',
    primary: 'bg-zinc-800',
    accent: 'bg-zinc-300',
  },
];

export default function SettingsModal({ isOpen, onClose }) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#121214] flex flex-col shadow-2xl w-full max-w-md relative z-10 border border-white/[0.08] rounded-3xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-zinc-300" />
            <h2 className="text-lg font-bold text-white font-outfit">
              Studio Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Studio Monochrome Aesthetics
              </h3>
            </div>

            <div className="space-y-3">
              {themes.map((t) => {
                const isSelected = theme === t.id || (!theme && t.id === 'studio');
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-white/[0.08] border-white/20'
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/15'
                    }`}
                  >
                    <div>
                      <div
                        className={`font-bold text-sm font-outfit ${
                          isSelected ? 'text-white' : 'text-zinc-300'
                        }`}
                      >
                        {t.name}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                        {t.desc}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        <div
                          className={`w-4 h-4 rounded-full ${t.primary} border border-white/20 relative z-0 -mr-1`}
                        />
                        <div
                          className={`w-4 h-4 rounded-full ${t.accent} border border-white/20 relative z-10`}
                        />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white text-zinc-950 flex items-center justify-center ml-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Eye-Comfort Monochrome Engine</span>
            <span className="text-zinc-400 font-bold">STUDIO v2.0</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
