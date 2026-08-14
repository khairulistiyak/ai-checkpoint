import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, Square, RotateCcw } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';

export const TerminalExecutionFrame = ({
  command = 'npm run dev',
  logs = [],
  isRunning = false,
  onStart,
  onStop,
  onClear,
}) => {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-sm bg-[#09090b]">
      {/* Terminal Header */}
      <div className="bg-[#121214] px-4 py-2.5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] font-mono font-bold text-zinc-400">
            {command}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onStart && !isRunning && (
            <GlassButton
              size="xs"
              variant="ghost"
              onClick={onStart}
              className="!p-1 text-zinc-300 hover:text-white hover:bg-white/10"
            >
              <Play className="w-3 h-3" />
            </GlassButton>
          )}
          {onStop && isRunning && (
            <GlassButton
              size="xs"
              variant="ghost"
              onClick={onStop}
              className="!p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Square className="w-3 h-3" />
            </GlassButton>
          )}
          {onClear && (
            <GlassButton
              size="xs"
              variant="ghost"
              onClick={onClear}
              className="!p-1 text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <RotateCcw className="w-3 h-3" />
            </GlassButton>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 h-40 overflow-y-auto font-mono text-[11px] leading-relaxed custom-scrollbar flex flex-col gap-0.5">
        <div className="text-zinc-300 font-bold">$ {command}</div>
        {logs.map((log, i) => (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            key={i}
            className={`${
              log.includes('error') || log.includes('fail')
                ? 'text-red-400'
                : log.includes('success') || log.includes('Done')
                  ? 'text-zinc-300 font-bold'
                  : 'text-zinc-400'
            }`}
          >
            {log}
          </motion.div>
        ))}
        {isRunning && (
          <div className="flex items-center mt-1">
            <span className="w-2 h-4 bg-zinc-400 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};
