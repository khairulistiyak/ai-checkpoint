import React, { useState } from 'react';
import { CheckCircle2, Circle, Loader2, AlertTriangle, FileCode2, Play, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './ToastProvider';
import * as api from '../utils/api';

export default function StepItem({ step, index, projectId, hasPlanFiles, onRefresh }) {
  const { showToast } = useToast();
  const [executing, setExecuting] = useState(false);
  let Icon = Circle;
  let color = 'text-cyber-text-muted';
  let bg = 'bg-cyber-dark hover:bg-cyber-card-border/10';
  let border = 'border-cyber-card-border';

  if (step.status === 'done') {
    Icon = CheckCircle2;
    color = 'text-cyber-text-primary';
    bg = 'bg-cyber-accent/10 hover:bg-cyber-accent/20';
    border = 'border-cyber-accent/30';
  } else if (step.status === 'running') {
    Icon = Loader2;
    color = 'text-cyber-text-primary';
    bg = 'bg-cyber-card/30 hover:bg-cyber-card/50';
    border = 'border-cyber-accent';
  } else if (step.status === 'blocked') {
    Icon = AlertTriangle;
    color = 'text-cyber-text-secondary';
    bg = 'bg-cyber-dark hover:bg-cyber-card-border/10';
    border = 'border-cyber-card-border border-dashed';
  }

  const handleCommand = async (command) => {
    try {
      setExecuting(true);
      await api.executeCommand(projectId, command, step.number, command === 'complete' ? 'Completed from Dashboard' : '');
      if (onRefresh) await onRefresh();
      showToast(`Step ${command === 'start' ? 'started' : 'completed'} successfully`, 'success');
    } catch (err) {
      showToast(`Command failed: ${err.message}`, 'error');
    } finally {
      setExecuting(false);
    }
  };

  // Parse file path from title if present
  const fileMatch = step.title.match(/[`(]([^`)]+\.[a-zA-Z0-9]+)[`)]/);
  const filePath = fileMatch ? fileMatch[1] : null;
  const cleanTitle = fileMatch ? step.title.replace(fileMatch[0], '').trim() : step.title;

  const getFormattedCompletedAt = () => {
    if (!step.completedAt) return '';
    try {
      const parts = step.completedAt.split(' ');
      if (parts.length < 2) return step.completedAt;
      const dateParts = parts[0].split('-');
      const timeParts = parts[1].split(':');
      if (dateParts.length < 3 || timeParts.length < 2) return step.completedAt;
      
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const day = parseInt(dateParts[2]);
      const hour = parseInt(timeParts[0]);
      const minute = parseInt(timeParts[1]);
      
      const date = new Date(year, month, day, hour, minute);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return step.completedAt;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring" }}
      className={`p-4 rounded-xl border ${border} ${bg} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group`}
    >
      <div className="flex items-start gap-4 w-full sm:w-auto">
        <div className="mt-0.5 shrink-0">
          <motion.div
            animate={step.status === 'running' || executing ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Icon className={`w-5 h-5 ${color}`} />
          </motion.div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className={`text-xs font-bold tracking-wider shrink-0 ${step.status === 'done' ? 'text-cyber-text-muted' : 'text-cyber-text-secondary'}`}>
              STEP {step.number}
            </span>
            {step.status === 'done' && step.completedAt && (
              <span className="text-[10px] font-mono text-cyber-text-primary bg-cyber-accent/10 px-2 py-0.5 rounded-full border border-cyber-accent/30 shrink-0">
                ✅ {getFormattedCompletedAt()}
              </span>
            )}
            <div className={`w-1 h-1 rounded-full shrink-0 ${step.status === 'done' ? 'bg-cyber-card-border' : 'bg-cyber-text-muted'}`}></div>
            <span className={`text-sm font-medium break-all ${step.status === 'done' ? 'text-cyber-text-muted line-through decoration-cyber-card-border' : 'text-cyber-text-primary'}`}>
              {cleanTitle}
            </span>
          </div>
          {filePath && (
            <div className="mt-2 flex items-center">
              <span className="flex items-center gap-1.5 text-xs font-mono bg-cyber-dark text-cyber-text-secondary px-2 py-1 rounded-md border border-cyber-card-border break-all">
                <FileCode2 className="w-3 h-3 text-cyber-text-muted shrink-0" />
                <span className="truncate">{filePath}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-2 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
        {step.status !== 'running' && step.status !== 'done' && (
          <button
            disabled={executing || !hasPlanFiles}
            onClick={() => handleCommand('start')}
            className={`p-2 rounded-lg transition-colors border flex items-center justify-center ${!hasPlanFiles ? 'bg-cyber-card/30 text-cyber-text-muted border-cyber-card-border cursor-not-allowed' : 'bg-cyber-accent/20 text-cyber-text-primary hover:bg-cyber-accent hover:text-cyber-dark border-cyber-accent/50'}`}
            title={!hasPlanFiles ? "Generate a plan using the ai-checkpoint CLI first" : "Start Step"}
          >
            <Play className="w-4 h-4" />
          </button>
        )}
        {step.status === 'running' && (
          <button
            disabled={executing}
            onClick={() => handleCommand('complete')}
            className="p-2 rounded-lg transition-colors border flex items-center justify-center bg-cyber-accent/20 text-cyber-text-primary hover:bg-cyber-accent hover:text-cyber-dark border-cyber-accent/50"
            title="Mark as Complete"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
