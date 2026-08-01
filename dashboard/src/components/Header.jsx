import React from 'react';
import { Brain, Settings, Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassButton } from './ui/GlassButton';
import { InputField } from './ui/InputField';

export default function Header({ onOpenSettings, onOpenCommandPalette, onToggleMenu, onOpenLibrary }) {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      className="mt-4 mx-4 mb-3 md:mt-6 md:mx-6 md:mb-4 rounded-2xl border border-cyber-card-border bg-cyber-card/70 backdrop-blur-2xl shadow-lg flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 sticky top-4 md:top-6 z-20"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <GlassButton
          variant="ghost"
          onClick={onToggleMenu}
          className="md:hidden !p-2 -ml-2 text-slate-400 hover:text-white rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </GlassButton>
        <div
          className="bg-cyber-accent/20 border border-cyber-accent/30 p-2 md:p-2 rounded-lg hidden sm:block shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        >
          <Brain className="w-5 h-5 text-cyber-text-primary drop-shadow-md" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
            AI-CHECKPOINT
          </h1>
          <span 
            onClick={onOpenLibrary}
            className="text-[9px] uppercase font-bold tracking-widest text-cyber-text-secondary drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] cursor-pointer hover:text-cyber-text-primary transition-colors"
            title="Open Component Library"
          >
            Developer Dashboard
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="relative group hidden md:block cursor-pointer"
          onClick={onOpenCommandPalette}
        >
          <InputField
            icon={Search}
            placeholder="Search commands... (⌘K)"
            readOnly
            className="w-48 lg:w-64 pointer-events-none"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.05] text-[10px] text-cyber-text-secondary font-mono pointer-events-none z-10">⌘K</div>
        </div>

        <GlassButton
          variant="ghost"
          onClick={onOpenCommandPalette}
          className="md:hidden !p-2 text-slate-400 hover:text-white rounded-lg"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </GlassButton>

        <GlassButton
          variant="ghost"
          onClick={onOpenSettings}
          className="!p-2 text-slate-400 hover:text-white rounded-lg"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </GlassButton>
      </div>
    </motion.header>
  );
}
