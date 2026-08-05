import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, BookOpen } from 'lucide-react';
import { useToast } from './ToastProvider';

const WORKFLOW_COMMANDS = [
  { title: 'Start a Step', cmd: './l start X.Y', desc: 'Creates the target file and marks step as running in PROGRESS.md' },
  { title: 'Complete a Step', cmd: './l c X.Y "implemented feature"', desc: 'Validates code, runs git diff check, and marks step complete' },
  { title: 'Save Recovery Snapshot', cmd: './l cp save "Checkpoint description"', desc: 'Instantly saves atomic checkpoint snapshot into git ledger' },
  { title: 'Audit System Health', cmd: './l doctor', desc: 'Runs self-diagnostics on .agents/, PROGRESS.md, and plan/ files' }
];

export default function AuditRulesTab({ onOpenConfig }) {
  const { showToast } = useToast();
  const [copiedCmd, setCopiedCmd] = useState(null);

  const handleCopyCli = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCmd(text);
      showToast(`Copied ${label || text}`, 'info');
      setTimeout(() => setCopiedCmd(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-outfit">AI Agent Workflow Conventions & Audit</h3>
            <p className="text-[11px] text-white/50 font-mono">Zero-token logging, single-step execution, and checkpoint validation rules.</p>
          </div>
        </div>
        <button
          onClick={onOpenConfig}
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-mono transition-all cursor-pointer"
        >
          Edit Config
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-white/40 font-bold">Recommended CLI Workflows</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WORKFLOW_COMMANDS.map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="text-xs font-bold text-white font-outfit mb-1">{item.title}</div>
                <div className="text-[11px] text-white/50 font-mono">{item.desc}</div>
              </div>
              <button
                onClick={() => handleCopyCli(item.cmd, item.title)}
                className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/25 text-white text-xs font-mono flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="truncate">{item.cmd}</span>
                {copiedCmd === item.cmd ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-white/40 shrink-0" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs font-mono text-white/70">
        <div className="text-white font-bold flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-white/60" />
          <span>Golden Rules for Autonomous Execution:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-white/50 pl-2">
          <li><strong className="text-white/80">1 step = 1 file:</strong> Finish one step completely before starting the next.</li>
          <li><strong className="text-white/80">Zero token waste:</strong> Background activity logger writes directly to local filesystem.</li>
          <li><strong className="text-white/80">Never skip steps:</strong> Execute incrementally in strictly ordered sequence.</li>
          <li><strong className="text-white/80">Auto-recovery:</strong> Use GitVisualizer or <code className="text-white">./l rollback</code> to restore states.</li>
        </ul>
      </div>
    </div>
  );
}
