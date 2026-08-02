import React from 'react';
import { motion } from 'framer-motion';
import { StatusBadge } from '../ui/StatusBadge';
import { CheckCircle2, Circle, PlayCircle, AlertCircle } from 'lucide-react';

export const LedgerTaskCard = ({
  stepId,
  title,
  description,
  status = 'pending',
  fileTarget,
}) => {
  const isDone = status === 'done' || status === 'success';
  const isRunning = status === 'running' || status === 'active';
  const isBlocked = status === 'blocked' || status === 'error';

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      className={`p-4 rounded-2xl border transition-all duration-300 ${
        isDone
          ? 'bg-workflow-success/[0.04] border-workflow-success/20'
          : isRunning
            ? 'bg-workflow-running/[0.06] border-workflow-running/25'
            : isBlocked
              ? 'bg-workflow-error/[0.05] border-workflow-error/20'
              : 'bg-white/[0.02] border-white/[0.06]'
      } flex flex-col gap-2.5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 shrink-0">
            {isDone ? (
              <CheckCircle2 className="w-4 h-4 text-workflow-success" />
            ) : isRunning ? (
              <PlayCircle className="w-4 h-4 text-workflow-running animate-pulse" />
            ) : isBlocked ? (
              <AlertCircle className="w-4 h-4 text-workflow-error" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-500" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h4
              className={`text-xs font-mono font-bold truncate ${
                isDone ? 'text-zinc-300' : 'text-white'
              }`}
            >
              <span
                className={`mr-1.5 ${
                  isDone
                    ? 'text-workflow-success'
                    : isRunning
                      ? 'text-workflow-running'
                      : 'text-zinc-500'
                }`}
              >
                Step {stepId}
              </span>
              {title}
            </h4>
            {description && (
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {fileTarget && (
        <div className="ml-7 flex items-center gap-2 mt-1">
          <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 tracking-wider">
            Target File:
          </span>
          <code className="text-[10px] bg-black/40 px-2 py-0.5 rounded-md text-zinc-300 font-mono border border-white/10">
            {fileTarget}
          </code>
        </div>
      )}
    </motion.div>
  );
};
