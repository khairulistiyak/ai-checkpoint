import React from 'react';
import { Brain, Settings, Search, Menu, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassButton } from './ui/GlassButton';
import { InputField } from './ui/InputField';

export default function Header({ onOpenSettings, onOpenCommandPalette, onToggleMenu, onOpenLibrary }) {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mt-4 mx-4 mb-3 md:mt-6 md:mx-6 md:mb-4 rounded-2xl border border-white/10 bg-[#0c101a] flex items-center justify-between px-4 md:px-6 py-3 sticky top-4 md:top-6 z-20"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleMenu}
          className="md:hidden p-2 -ml-2 text-white/50 hover:text-white rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div
          className="bg-white/5 border border-white/15 p-2 rounded-xl hidden sm:flex items-center justify-center text-sky-400"
        >
          <Brain className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold tracking-tight text-white font-outfit">
              AI-CHECKPOINT
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-white/60 uppercase">
              PRO v2.0
            </span>
          </div>
          <span 
            onClick={onOpenLibrary}
            className="text-[10px] font-mono text-white/40 cursor-pointer hover:text-white/80 transition-colors"
            title="Open Component Library"
          >
            Developer Control Studio
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="relative group hidden md:block cursor-pointer"
          onClick={onOpenCommandPalette}
        >
          <div className="flex items-center justify-between w-48 lg:w-64 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 text-white/50 text-xs font-mono transition-all">
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-white/40" />
              <span>Search commands...</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/60 font-mono">⌘K</span>
          </div>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 text-white/50 hover:text-white rounded-xl bg-white/5 border border-white/10 transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-white/50 hover:text-white rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </motion.header>
  );
}
