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
    '[ai-checkpoint] Loading context...',
    '[ai-checkpoint] Parsing .agents/PROGRESS.md',
    'Found 3 pending steps.',
    termRunning ? 'Executing Step 1.1: Create UI components...' : 'Execution stopped by user.',
  ];

  const layoutClasses = asPage
    ? 'w-full h-full flex flex-col overflow-hidden bg-transparent'
    : 'fixed inset-0 z-[9999] bg-[#09090b]/90 backdrop-blur-3xl flex flex-col overflow-hidden m-4 md:m-8 rounded-3xl border border-white/10 shadow-2xl';

  return (
    <motion.div
      initial={asPage ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
      animate={asPage ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={asPage ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
      className={layoutClasses}
    >
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-[#121214]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/[0.04] rounded-xl border border-white/10">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <span>Component Sandbox</span>
              <StatusBadge status="Active" />
            </h2>
            <p className="text-xs text-zinc-400 font-mono">UI staging & Studio Monochrome elements.</p>
          </div>
        </div>
        {!asPage && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#09090b]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls Sandbox */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-white/10 pb-2">
              Buttons & Form Inputs
            </h3>
            <div className="flex flex-wrap gap-3">
              <GlassButton variant="primary">Primary</GlassButton>
              <GlassButton variant="secondary">Secondary</GlassButton>
              <GlassButton variant="danger">Danger</GlassButton>
            </div>
            <div className="space-y-4">
              <InputField label="Text Input" placeholder="Search components..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} icon={Search} />
              <div className="flex items-center gap-2">
                <StatusBadge status="Active" />
                <StatusBadge status="Pending" />
                <StatusBadge status="Error" />
              </div>
            </div>
          </div>

          {/* Ledger Cards & Terminal */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-white/10 pb-2">
              Ledger Task Cards & Terminal
            </h3>
            <div className="space-y-3">
              <LedgerTaskCard stepId="1.1" title="Bootstrap Studio Monochrome UI" status="done" fileTarget="index.css" />
              <LedgerTaskCard stepId="1.2" title="Generate Implementation Plan" description="Use write_to_file to create artifact." status="running" fileTarget="implementation_plan.md" />
            </div>
            <TerminalExecutionFrame
              command="./l start 1.2"
              logs={termLogs}
              isRunning={termRunning}
              onStart={() => setTermRunning(true)}
              onStop={() => setTermRunning(false)}
              onClear={() => {}}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
