import React from 'react';
import { Brain, Settings, Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ onOpenSettings, onOpenCommandPalette, onToggleMenu }) {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      className="mt-4 mx-4 mb-3 md:mt-6 md:mx-6 md:mb-4 rounded-2xl border border-white/[0.05] bg-[#0f172a]/70 backdrop-blur-2xl shadow-lg flex items-center justify-between px-4 md:px-6 py-3 sticky top-4 md:top-6 z-20"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleMenu}
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div
          className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 md:p-2 rounded-lg hidden sm:block shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          <Brain className="w-5 h-5 text-white drop-shadow-md" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            AI-CHECKPOINT
          </h1>
          <span className="text-[9px] uppercase font-bold tracking-widest text-accent-400 drop-shadow-[0_0_5px_rgba(217,70,239,0.3)]">
            Developer Dashboard
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="relative group hidden md:block cursor-pointer"
          onClick={onOpenCommandPalette}
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search commands... (⌘K)"
            readOnly
            className="cursor-pointer bg-white/[0.03] border border-white/[0.05] rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all w-64 placeholder-slate-500 text-slate-200"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.05] text-[10px] text-slate-400 font-mono">⌘K</div>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  );
}
