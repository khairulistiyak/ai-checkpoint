import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, X, BookOpen, Search } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { InputField } from '../ui/InputField';
import { StatusBadge } from '../ui/StatusBadge';
import { LedgerTaskCard } from './LedgerTaskCard';
import { TerminalExecutionFrame } from './TerminalExecutionFrame';

export const ComponentLibrary = ({ onClose, asPage = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [termRunning, setTermRunning] = useState(true);

  const termLogs = [
    "[ai-checkpoint] Loading context...",
    "[ai-checkpoint] Parsing .agents/PROGRESS.md",
    "Found 3 pending steps.",
    termRunning ? "Executing Step 1.1: Create UI components..." : "Execution stopped by user."
  ];

  const layoutClasses = asPage 
    ? "w-full h-full flex flex-col overflow-hidden bg-transparent"
    : "fixed inset-0 z-[9999] bg-[#020617]/90 backdrop-blur-3xl flex flex-col overflow-hidden m-4 md:m-8 rounded-2xl border border-white/10 shadow-2xl";

  return (
    <motion.div 
      initial={asPage ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.95 }}
      animate={asPage ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={asPage ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.95 }}
      className={layoutClasses}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
            <Layers className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Component Sandbox <StatusBadge status="Active" className="!bg-accent-500/20 !text-accent-300" />
            </h2>
            <p className="text-xs text-slate-400">UI staging and dynamic element playground.</p>
          </div>
        </div>
        {!asPage && (
          <GlassButton variant="ghost" size="sm" onClick={onClose} className="!rounded-full !p-2">
            <X className="w-5 h-5" />
          </GlassButton>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          
          {/* Atomic UI Section */}
          <div className="glass-card p-5 flex flex-col gap-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <BookOpen className="w-3.5 h-3.5 text-primary-400" /> Atomic UI
            </h3>
            
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">GlassButtons</span>
              <div className="flex flex-wrap gap-3">
                <GlassButton variant="primary">Primary</GlassButton>
                <GlassButton variant="secondary">Secondary</GlassButton>
                <GlassButton variant="danger">Danger</GlassButton>
                <GlassButton variant="ghost">Ghost</GlassButton>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Button Sizes</span>
              <div className="flex flex-wrap items-center gap-3">
                <GlassButton size="xs">Extra Small</GlassButton>
                <GlassButton size="sm">Small</GlassButton>
                <GlassButton size="md">Medium</GlassButton>
                <GlassButton size="lg">Large</GlassButton>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Inputs & Forms</span>
              <InputField 
                label="Search Workspace" 
                placeholder="Find a component..." 
                icon={Search}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <InputField 
                label="Read Only Data" 
                value="/Users/istiyak/projects/ai-checkpoint" 
                readOnly 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Status Badges</span>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="pending" />
                <StatusBadge status="running" />
                <StatusBadge status="done" />
                <StatusBadge status="blocked" />
              </div>
            </div>
          </div>

          {/* Ledger & Terminal Section */}
          <div className="glass-card p-5 flex flex-col gap-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <BookOpen className="w-3.5 h-3.5 text-accent-400" /> Ledger & Executions
            </h3>
            
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Task Ledger Cards</span>
              <div className="flex flex-col gap-3">
                <LedgerTaskCard 
                  stepId="1.1" 
                  title="Bootstrap Tailwind UI" 
                  status="done" 
                  fileTarget="index.css"
                />
                <LedgerTaskCard 
                  stepId="1.2" 
                  title="Generate Implementation Plan" 
                  description="Use write_to_file to create artifact."
                  status="running" 
                  fileTarget="implementation_plan.md"
                />
                <LedgerTaskCard 
                  stepId="1.3" 
                  title="Verify Visual States" 
                  status="pending" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Terminal Frame</span>
              <TerminalExecutionFrame 
                command="./l start 1.2"
                logs={termLogs}
                isRunning={termRunning}
                onStart={() => setTermRunning(true)}
                onStop={() => setTermRunning(false)}
                onClear={() => alert('Terminal Cleared')}
              />
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};
