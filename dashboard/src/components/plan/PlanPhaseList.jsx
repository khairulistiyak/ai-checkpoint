import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronDown, Check, Play, CheckCircle2, 
  Bot, ShieldCheck, Circle, Copy 
} from 'lucide-react';

export default function PlanPhaseList({
  filteredModules,
  collapsedModules,
  toggleCollapse,
  copiedStepBadge,
  copyStepCommand,
  generateStepPrompt,
  copiedCodeIndex,
  copySnippet,
  formatTextWithBadges,
  formatCodeWithTheme
}) {
  return (
    <div className="space-y-5">
      {filteredModules.length === 0 ? (
        <div className="text-center py-14 text-white/40 font-mono text-xs bg-white/[0.01] rounded-2xl border border-white/5">
          No architectural modules match your search filter.
        </div>
      ) : (
        filteredModules.map((mod, modIdx) => {
          const modPercent = mod.tasksTotal > 0 ? Math.round((mod.tasksDone / mod.tasksTotal) * 100) : 100;
          const isCollapsed = collapsedModules[modIdx];
          return (
            <div
              id={`arch-mod-${modIdx}`}
              key={modIdx}
              className="relative overflow-hidden rounded-2xl bg-[#0b0b0e] border border-white/15 shadow-xl transition-all"
            >
              <div className={`absolute top-0 bottom-0 left-0 w-0.5 transition-colors duration-500 ${isCollapsed ? 'bg-white/5' : 'bg-cyber-accent/60'}`} />

              {/* Collapsible Module Header */}
              <button
                onClick={() => toggleCollapse(modIdx)}
                className="w-full px-5 py-4 bg-white/[0.02] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyber-accent/10 text-cyber-accent font-mono text-xs font-bold">
                    LAYER {mod.number}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {mod.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {mod.tasksTotal > 0 && (
                    <span className="text-xs font-mono text-white/60">
                      {mod.tasksDone}/{mod.tasksTotal} ({modPercent}%)
                    </span>
                  )}

                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </button>

              {/* Module Content */}
              <AnimatePresence>
                {!isCollapsed && (
                  <div className="p-5 sm:p-7 space-y-4">
                    {mod.blocks.map((block, idx) => {
                      // 1. DEDICATED STEP EXECUTION BLOCK
                      if (block.type === 'step') {
                        const startCmd = `./l start ${block.stepNum}`;
                        const completeCmd = `./l c ${block.stepNum} "Implemented ${block.stepTitle.replace(/"/g, '')}"`;
                        const isStartCopied = copiedStepBadge === `${block.stepNum}-start`;
                        const isCompCopied = copiedStepBadge === `${block.stepNum}-complete`;
                        const isPromptCopied = copiedStepBadge === `${block.stepNum}-prompt`;

                        return (
                          <div key={idx} className="bg-[#121215]/80 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-4 sm:p-5 my-5 space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all relative overflow-hidden group">
                            {/* Subtle Glow Background */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl pointer-events-none group-hover:bg-white/[0.03] transition-colors" />
                            
                            {/* Step Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08] relative z-10">
                              <div className="flex items-center gap-2.5">
                                <span className="px-2.5 py-1 rounded-lg bg-white text-black font-mono text-xs font-black">
                                  Step {block.stepNum}
                                </span>
                                <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">
                                  {block.stepTitle}
                                </h3>
                              </div>

                              {/* Step CLI Triggers */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  onClick={() => copyStepCommand(startCmd, block.stepNum, 'start')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                    isStartCopied
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : 'bg-white/5 hover:bg-white/15 text-white/90 border-white/15'
                                  }`}
                                  title="Copy: ./l start command"
                                >
                                  {isStartCopied ? <Check className="w-3 h-3" /> : <Play className="w-3 h-3 text-white/60" />}
                                  <span>./l start {block.stepNum}</span>
                                </button>

                                <button
                                  onClick={() => copyStepCommand(completeCmd, block.stepNum, 'complete')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                    isCompCopied
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : 'bg-white/5 hover:bg-white/15 text-white/90 border-white/15'
                                  }`}
                                  title="Copy: ./l c complete command"
                                >
                                  {isCompCopied ? <Check className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3 text-white/60" />}
                                  <span>./l c {block.stepNum}</span>
                                </button>

                                <button
                                  onClick={() => {
                                    const prompt = generateStepPrompt(block);
                                    copyStepCommand(prompt, block.stepNum, 'prompt');
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                    isPromptCopied
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : 'bg-white/10 hover:bg-white/20 text-white border-white/25'
                                  }`}
                                  title="Copy ready-to-run AI agent prompt for this step"
                                >
                                  {isPromptCopied ? <Check className="w-3 h-3" /> : <Bot className="w-3 h-3 text-white" />}
                                  <span>AI Step Prompt</span>
                                </button>
                              </div>
                            </div>

                            {/* Step Body */}
                            {block.body && (
                              <div className="text-xs sm:text-sm font-mono text-white/80 leading-relaxed space-y-2 whitespace-pre-wrap">
                                {formatTextWithBadges(block.body)}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // 2. H3 Heading
                      if (block.type === 'h3') {
                        return (
                          <div key={idx} className="flex items-center gap-2 pt-2 pb-1 border-b border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent shadow-[0_0_8px_rgba(var(--cyber-accent-rgb),0.8)]" />
                            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-mono">
                              {block.text}
                            </h3>
                          </div>
                        );
                      }

                      // 3. Checklist Tasks
                      if (block.type === 'checklist') {
                        return (
                          <div key={idx} className="bg-black/50 border border-white/[0.06] rounded-xl p-4 sm:p-5 space-y-3 my-4 shadow-inner relative overflow-hidden">
                            <div className="text-[11px] font-mono text-white/50 uppercase tracking-widest pb-2 border-b border-white/5 flex items-center justify-between relative z-10">
                              <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-white/70" />
                                <span>Execution Checkpoints</span>
                              </span>
                              <span className="text-white/80 font-bold bg-white/10 px-2 py-0.2 rounded border border-white/15 text-[10px]">
                                {block.items.length} Tasks
                              </span>
                            </div>
                            {block.items.map((item, i) => (
                              <div
                                key={i}
                                className={`flex items-start gap-3 p-2.5 rounded-lg transition-all border ${
                                  item.checked
                                    ? 'bg-white/10 border-white/25 text-white'
                                    : 'bg-white/[0.02] border-white/5 text-white/90 hover:border-white/15'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {item.checked ? (
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-white/30" />
                                  )}
                                </div>
                                <div className="flex-1 text-xs leading-relaxed font-mono">
                                  <span className={item.checked ? 'line-through opacity-70' : ''}>
                                    {formatTextWithBadges(item.text)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // 4. Code Block
                      if (block.type === 'codeblock') {
                        return (
                          <div key={idx} className="bg-[#070709]/90 backdrop-blur-md rounded-xl border border-white/[0.12] overflow-hidden my-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10 text-xs font-mono">
                              <span className="uppercase tracking-wider text-[11px] font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                                {block.language}
                              </span>
                              <button
                                onClick={() => copySnippet(block.code, idx)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all text-xs font-mono border border-white/10 cursor-pointer"
                              >
                                {copiedCodeIndex === idx ? (
                                  <>
                                    <Check className="w-3 h-3 text-white" />
                                    <span className="text-white font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Code</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="p-4 overflow-x-auto custom-scrollbar">
                              <pre className="text-xs font-mono leading-relaxed text-[#abb2bf]">
                                <code dangerouslySetInnerHTML={{ __html: formatCodeWithTheme(block.code) }} />
                              </pre>
                            </div>
                          </div>
                        );
                      }

                      // 5. Quote
                      if (block.type === 'quote') {
                        return (
                          <div key={idx} className="p-4 rounded-xl bg-white/5 border-l-2 border-white text-xs font-mono text-zinc-300 my-3">
                            {formatTextWithBadges(block.text)}
                          </div>
                        );
                      }

                      // 6. List
                      if (block.type === 'list') {
                        return (
                          <ul key={idx} className="space-y-2 pl-2 my-3">
                            {block.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs font-mono leading-relaxed text-white/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent mt-1.5 shrink-0 shadow-[0_0_8px_rgba(var(--cyber-accent-rgb),0.8)]" />
                                <span>{formatTextWithBadges(item)}</span>
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      // 7. Paragraph
                      return (
                        <p key={idx} className="text-xs font-mono leading-relaxed text-white/80 my-2.5">
                          {formatTextWithBadges(block.text)}
                        </p>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
}
