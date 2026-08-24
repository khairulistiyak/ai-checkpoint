import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import PlanStepBlock from './PlanStepBlock.jsx';
import PlanCodeBlock from './PlanCodeBlock.jsx';
import PlanTableBlock from './PlanTableBlock.jsx';
import PlanAlertBlock from './PlanAlertBlock.jsx';

export default function PlanPhaseList({
  filteredModules, collapsedModules, toggleCollapse,
  copiedStepBadge, copyStepCommand, generateStepPrompt,
  copiedCodeIndex, copySnippet, formatTextWithBadges, formatCodeWithTheme
}) {
  if (filteredModules.length === 0) {
    return (
      <div className="text-center py-14 text-white/40 font-mono text-xs bg-white/[0.01] rounded-2xl border border-white/5">
        No architectural modules match your search filter.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {filteredModules.map((mod, modIdx) => {
        const modPercent = mod.tasksTotal > 0 ? Math.round((mod.tasksDone / mod.tasksTotal) * 100) : 100;
        const isCollapsed = collapsedModules[modIdx];
        return (
          <div id={`arch-mod-${modIdx}`} key={modIdx} className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] shadow-lg transition-all">
            <button onClick={() => toggleCollapse(modIdx)} className="w-full px-5 py-4 bg-white/[0.02] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 font-mono text-[11px] font-bold">
                  {mod.number ? `0${mod.number}`.slice(-2) : `0${modIdx + 1}`.slice(-2)}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight font-mono">{mod.title}</h2>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {mod.tasksTotal > 0 && <span className="text-xs font-mono text-zinc-400">{mod.tasksDone}/{mod.tasksTotal} ({modPercent}%)</span>}
                <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>
            </button>

            <AnimatePresence>
              {!isCollapsed && (
                <div className="p-5 sm:p-7 space-y-4">
                  {mod.blocks.map((block, idx) => renderBlock(block, idx, { copiedStepBadge, copyStepCommand, generateStepPrompt, copiedCodeIndex, copySnippet, formatTextWithBadges, formatCodeWithTheme }))}
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function renderBlock(block, idx, ctx) {
  if (block.type === 'step') {
    return <PlanStepBlock key={idx} block={block} idx={idx} copiedStepBadge={ctx.copiedStepBadge} copyStepCommand={ctx.copyStepCommand} generateStepPrompt={ctx.generateStepPrompt} formatTextWithBadges={ctx.formatTextWithBadges} />;
  }
  if (block.type === 'table') {
    return <PlanTableBlock key={idx} block={block} idx={idx} formatTextWithBadges={ctx.formatTextWithBadges} />;
  }
  if (block.type === 'alert') {
    return <PlanAlertBlock key={idx} block={block} idx={idx} formatTextWithBadges={ctx.formatTextWithBadges} />;
  }
  if (block.type === 'hr') {
    return <hr key={idx} className="border-0 h-px bg-white/[0.07] my-6" />;
  }
  if (block.type === 'h3') {
    return (
      <div key={idx} className="flex items-center gap-2 pt-2 pb-1 border-b border-white/[0.06]">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200 font-mono">{block.text}</h3>
      </div>
    );
  }
  if (block.type === 'checklist') {
    return (
      <div key={idx} className="bg-black/50 border border-white/[0.06] rounded-xl p-4 sm:p-5 space-y-3 my-4 shadow-inner relative overflow-hidden">
        <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest pb-2 border-b border-white/[0.06] flex items-center justify-between relative z-10">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /><span>Execution Checkpoints</span></span>
          <span className="text-zinc-300 font-bold bg-white/[0.06] px-2 py-0.2 rounded border border-white/10 text-[10px]">{block.items.length} Tasks</span>
        </div>
        {block.items.map((item, i) => (
          <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg transition-all border ${item.checked ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:border-white/15'}`}>
            <div className="mt-0.5 shrink-0">{item.checked ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-white/30" />}</div>
            <div className="flex-1 text-xs leading-relaxed font-mono"><span className={item.checked ? 'line-through opacity-70' : ''}>{ctx.formatTextWithBadges(item.text)}</span></div>
          </div>
        ))}
      </div>
    );
  }
  if (block.type === 'codeblock') {
    return <PlanCodeBlock key={idx} block={block} idx={idx} copiedCodeIndex={ctx.copiedCodeIndex} copySnippet={ctx.copySnippet} formatCodeWithTheme={ctx.formatCodeWithTheme} />;
  }
  if (block.type === 'quote') {
    return <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-zinc-300 my-3">{ctx.formatTextWithBadges(block.text)}</div>;
  }
  if (block.type === 'list') {
    return (
      <ul key={idx} className="space-y-2 pl-2 my-3">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs font-mono leading-relaxed text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-1.5 shrink-0" />
            <span>{ctx.formatTextWithBadges(item)}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p key={idx} className="text-xs font-mono leading-relaxed text-zinc-300 my-2.5">{ctx.formatTextWithBadges(block.text)}</p>;
}
