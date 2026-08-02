import React from 'react';
import { Brain, Settings, Search, Menu, Command } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ onOpenSettings, onOpenCommandPalette, onToggleMenu, onOpenLibrary }) {
  return (
    <motion.header
      initial={{ y: -15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full h-14 bg-[#09090b] border-b border-white/10 flex items-center justify-between px-4 md:px-6 z-20 shrink-0 select-none"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMenu}
          className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white font-outfit">
              AI-CHECKPOINT
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-400 uppercase font-semibold">
              STUDIO
            </span>
          </div>
        </div>
        <div className="hidden sm:block h-4 w-px bg-white/10" />
        <span
          onClick={onOpenLibrary}
          className="hidden sm:inline-block text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Open Developer Control Studio"
        >
          Workspaces & Execution
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <div
          className="relative group hidden md:block cursor-pointer"
          onClick={onOpenCommandPalette}
        >
          <div className="flex items-center justify-between w-56 lg:w-64 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 text-zinc-400 text-xs font-mono transition-all">
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span>Search commands...</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-mono font-bold">
              ⌘K
            </span>
          </div>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5 border border-white/10 transition-colors cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </motion.header>
  );
}
