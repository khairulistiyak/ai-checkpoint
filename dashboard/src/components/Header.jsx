import React from 'react';
import { Brain, Settings, Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ onOpenSettings, onOpenCommandPalette, onToggleMenu }) {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      className="m-4 md:m-6 rounded-xl border border-white/[0.05] bg-[#0a0f1c]/70 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 py-3 sticky top-4 md:top-6 z-20 shadow-lg"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleMenu}
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <motion.div 
          animate={{ boxShadow: ["0 0 10px rgba(168,85,247,0.3)", "0 0 25px rgba(168,85,247,0.6)", "0 0 10px rgba(168,85,247,0.3)"] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 md:p-2 rounded-lg hidden sm:block relative overflow-hidden"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Brain className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            AI-CHECKPOINT
          </h1>
          <span className="text-[9px] uppercase font-bold tracking-widest text-purple-400">
            Developer Dashboard
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative group hidden md:block" 
          onClick={onOpenCommandPalette}
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search commands... (⌘K)"
            readOnly
            className="cursor-pointer bg-white/[0.03] border border-white/[0.05] rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-purple-500/50 transition-all w-64 placeholder-slate-500 text-slate-300"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.05] text-[10px] text-slate-400 font-mono">⌘K</div>
        </motion.div>

        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        <motion.button
          whileHover={{ rotate: 90 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.header>
  );
}
