import React, { useState } from 'react';
import { Folder, Terminal, RefreshCw, Link2, Trash2, Cpu, Sliders, Code, Check } from 'lucide-react';
import VisualRuleBuilder from './VisualRuleBuilder';
import ArchitectureRadar from './ArchitectureRadar';

export function GeneralTab({ project, stackInfo, compliance, onUpdateName, onSyncPlans, onRelinkBridge, onClearLogs, onOpenIde }) {
  const [name, setName] = useState(project?.name || '');
  return (
    <div className="space-y-3.5 text-xs font-mono">
      <ArchitectureRadar compliance={compliance} />
      {stackInfo && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2"><Cpu size={14} className="text-zinc-300" /><span className="font-bold text-white text-xs">{stackInfo.stack}</span></div>
          <div className="flex gap-1.5">{(stackInfo.badges || []).map((b) => (<span key={b} className="px-2 py-0.5 bg-white/5 border border-white/10 text-zinc-300 rounded-lg text-[10px]">{b}</span>))}</div>
        </div>
      )}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-3">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Project Display Name</label>
        <div className="flex gap-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-white/30 focus:outline-none" />
          <button onClick={() => onUpdateName(name)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl font-bold cursor-pointer">Update</button>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-3">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Workspace Directory</label>
        <div className="p-2.5 bg-black/50 border border-white/10 rounded-xl text-zinc-300 truncate">{project?.path}</div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={onOpenIde} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 flex items-center gap-1.5 cursor-pointer"><Terminal size={13} /> Open in IDE</button>
          <button onClick={() => navigator.clipboard.writeText(`cd "${project?.path}"`)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 flex items-center gap-1.5 cursor-pointer"><Folder size={13} /> Copy cd</button>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-3">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Workspace Control Engine</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button onClick={onSyncPlans} className="p-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-xl text-left cursor-pointer group"><RefreshCw size={14} className="text-zinc-300 mb-1 group-hover:rotate-180 transition-transform duration-500" /><div className="font-bold text-white text-[11px]">Sync Plan Ledger</div><div className="text-[10px] text-zinc-500">Run ./l sync</div></button>
          <button onClick={onRelinkBridge} className="p-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-xl text-left cursor-pointer"><Link2 size={14} className="text-zinc-300 mb-1" /><div className="font-bold text-white text-[11px]">Re-link Bridge</div><div className="text-[10px] text-zinc-500">Refresh AGENTS.md</div></button>
          <button onClick={onClearLogs} className="p-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-xl text-left cursor-pointer"><Trash2 size={14} className="text-zinc-300 mb-1" /><div className="font-bold text-white text-[11px]">Clear Logs</div><div className="text-[10px] text-zinc-500">Flush activity log</div></button>
        </div>
      </div>
    </div>
  );
}

export function RulesTab({ content, onChange, onInjectPreset }) {
  const [mode, setMode] = useState('visual');
  const [activePreset, setActivePreset] = useState('clean');
  const presets = [
    { id: 'clean', label: 'Clean Architecture', text: '# Universal Clean Architecture Standards\n- Core Domain: Pure business logic (never imports UI, DB, or APIs)\n- Use Cases: Orchestrate operations (1 file = 1 use-case)\n- Adapters: Frameworks & external I/O kept isolated\n- Rule 0: Maximum 150 lines per file\n- 100% testable pure functions\n' },
    { id: 'monorepo', label: 'Strict Monorepo', text: '# Monorepo Rules\n- packages/ = CommonJS (require)\n- dashboard/ = ESM (import)\n- Max 150 lines per file (Rule 0)\n- 1 step = 1 file\n' },
    { id: 'react', label: 'React UI', text: '# React Standards\n- Functional components + hooks only\n- Max 150 lines per component\n- Studio design tokens & clean CSS\n' },
    { id: 'backend', label: 'Clean Backend', text: '# Node Backend Standards\n- Layered: Controllers -> Services -> Repositories\n- Input validation with Zod schemas\n- Centralized async error handling\n' }
  ];

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button onClick={() => setMode('visual')} className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${mode === 'visual' ? 'bg-white/15 text-white shadow-sm' : 'text-zinc-400'}`}><Sliders size={11} /> Visual</button>
          <button onClick={() => setMode('raw')} className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${mode === 'raw' ? 'bg-white/15 text-white shadow-sm' : 'text-zinc-400'}`}><Code size={11} /> Raw</button>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-zinc-500">Presets:</span>
          {presets.map((p) => {
            const isSel = activePreset === p.id;
            return (
              <button key={p.id} onClick={() => { setActivePreset(p.id); onInjectPreset(p.text); }} className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all ${isSel ? 'bg-white text-zinc-950 font-bold border border-white shadow-sm' : 'bg-white/[0.04] hover:bg-white/10 border border-white/10 text-zinc-300'}`}>
                {isSel && <Check size={10} className="stroke-[3]" />} {p.label}
              </button>
            );
          })}
        </div>
      </div>
      {mode === 'visual' ? (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex-1 overflow-y-auto custom-scrollbar"><VisualRuleBuilder onGenerate={onChange} /></div>
      ) : (
        <textarea value={content} onChange={(e) => onChange(e.target.value)} className="w-full flex-1 min-h-[260px] bg-black/60 border border-white/10 rounded-2xl p-4 font-mono text-xs text-zinc-200 resize-none focus:outline-none focus:border-white/30 custom-scrollbar leading-relaxed" placeholder="# Project Rules..." spellCheck={false} />
      )}
    </div>
  );
}

export function AgentsTab({ content, onChange, onInjectPreset }) {
  const [activeMode, setActiveMode] = useState('strict');
  const modes = [
    { id: 'strict', label: 'Step-by-Step', text: '# Agent Workflow\n1. Read .agents/SYSTEM_GUIDE.md\n2. Read .agents/PROGRESS.md\n3. 1 step = 1 file\n4. Start: ./l start X.Y\n5. Complete: ./l c X.Y "note"\n' },
    { id: 'tdd', label: 'TDD Test-First', text: '# TDD Workflow\n1. Write failing unit test\n2. Implement minimum code\n3. Run npm test to verify\n4. Mark step done with ./l c\n' }
  ];

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
        <span className="text-[11px] font-mono text-zinc-400">Agent instructions & workflow guide</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-500">Modes:</span>
          {modes.map((m) => {
            const isSel = activeMode === m.id;
            return (
              <button key={m.id} onClick={() => { setActiveMode(m.id); onInjectPreset(m.text); }} className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all ${isSel ? 'bg-white text-zinc-950 font-bold border border-white shadow-sm' : 'bg-white/[0.04] hover:bg-white/10 border border-white/10 text-zinc-300'}`}>
                {isSel && <Check size={10} className="stroke-[3]" />} {m.label}
              </button>
            );
          })}
        </div>
      </div>
      <textarea value={content} onChange={(e) => onChange(e.target.value)} className="w-full flex-1 min-h-[260px] bg-black/60 border border-white/10 rounded-2xl p-4 font-mono text-xs text-zinc-200 resize-none focus:outline-none focus:border-white/30 custom-scrollbar leading-relaxed" placeholder="# Agent Workflow..." spellCheck={false} />
    </div>
  );
}
