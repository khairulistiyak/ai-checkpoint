import React from 'react';
import { Brain, Settings, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ onOpenSettings }) {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="m-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-6 py-3 sticky top-6 z-20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/30">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AI-CHECKPOINT
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-widest text-fuchsia-400 text-glow">
            Pro Dashboard
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fuchsia-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="bg-slate-950/50 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all w-72 placeholder-slate-500"
          />
        </div>
        
        <button 
          onClick={onOpenSettings}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  );
}
