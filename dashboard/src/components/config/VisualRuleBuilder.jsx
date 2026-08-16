import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, FileCode, Check } from 'lucide-react';

const ARCH_PRESETS = [
  { id: 'clean', title: 'Clean Architecture', desc: 'Core domain isolated from UI, DB, and external APIs', rules: ['Core Domain: Pure business logic (never imports UI, DB, or APIs)', 'Use Cases: Orchestrate operations (1 file = 1 use-case)', 'Adapters: Frameworks & external I/O kept isolated', '100% testable pure functions'] },
  { id: 'monorepo', title: 'Strict Monorepo', desc: 'CommonJS core packages & ESM frontend dashboard boundaries', rules: ['packages/ = CommonJS (require/module.exports)', 'dashboard/ = ESM (import/export)', 'Strict boundary separation, never mix module types'] },
  { id: 'react', title: 'React UI Standards', desc: 'Pure functional components, custom hooks, and design tokens', rules: ['Functional components + custom hooks only', 'Co-locate styles, components, and tests', 'Use studio design system tokens'] },
  { id: 'backend', title: 'Node.js Backend API', desc: 'Controllers -> Services -> Repositories layered architecture', rules: ['Layered: Controllers -> Services -> Repositories', 'Input validation with Zod schemas on all endpoints', 'Centralized async error handling middleware'] }
];

export default function VisualRuleBuilder({ initialArch = 'clean', onGenerate }) {
  const [arch, setArch] = useState(initialArch);
  const [lineLimit, setLineLimit] = useState(150);
  const [moduleType, setModuleType] = useState('mixed');
  const [guards, setGuards] = useState({
    noConsole: true,
    noAny: true,
    stepFileIso: true,
    testVerify: true
  });

  const compileMarkdown = () => {
    const selected = ARCH_PRESETS.find((a) => a.id === arch) || ARCH_PRESETS[0];
    let md = `# Project Architecture & Coding Rules\n\n`;
    md += `## 1. Core Architecture Pattern (${selected.title})\n`;
    selected.rules.forEach((r) => { md += `- ${r}\n`; });
    md += `\n## 2. File Size & Granularity (Rule 0)\n`;
    md += `- Max ${lineLimit} effective lines per file (Rule 0 strict enforcement)\n`;
    md += `- Split complex logic into focused single-responsibility micro-files\n\n`;
    md += `## 3. Module Boundaries\n`;
    if (moduleType === 'mixed') md += `- packages/ = CommonJS (require) | dashboard/ = ESM (import)\n- Never mix import/require in the same file\n\n`;
    else if (moduleType === 'cjs') md += `- Strict CommonJS (require/module.exports only)\n\n`;
    else md += `- Strict ESM (import/export only)\n\n`;
    md += `## 4. Guardrails & Safety\n`;
    if (guards.stepFileIso) md += `- 1 step = 1 file: Complete each step before starting next\n`;
    if (guards.noConsole) md += `- No raw debug console.log in production code (use // keep for backend)\n`;
    if (guards.noAny) md += `- Avoid explicit 'any' types; use strict interfaces & schemas\n`;
    if (guards.testVerify) md += `- Verify code syntax and tests before marking steps complete\n`;
    return md;
  };

  useEffect(() => {
    onGenerate(compileMarkdown());
  }, [arch, lineLimit, moduleType, guards]);

  const toggleGuard = (k) => setGuards((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-4 text-xs font-mono">
      <div>
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <Layers size={13} className="text-zinc-300" /> 1. Architecture Pattern
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ARCH_PRESETS.map((p) => {
            const isSel = arch === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setArch(p.id)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSel ? 'bg-white/[0.08] border-white/20 text-white shadow-sm' : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:border-white/15'
                }`}
              >
                <div className="font-bold text-xs text-white">{p.title}</div>
                <div className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <FileCode size={13} className="text-zinc-300" /> 2. Max File Line Limit
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[100, 150, 200, 300].map((limit) => (
              <button
                key={limit}
                onClick={() => setLineLimit(limit)}
                className={`py-1.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                  lineLimit === limit ? 'bg-white/10 border-white/25 text-white' : 'bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">3. Module Boundary</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'mixed', label: 'Mixed' },
              { id: 'cjs', label: 'CJS' },
              { id: 'esm', label: 'ESM' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModuleType(m.id)}
                className={`py-1.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                  moduleType === m.id ? 'bg-white/10 border-white/25 text-white' : 'bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-zinc-300" /> 4. Guardrails & Safety
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { k: 'stepFileIso', label: '1 Step = 1 File Isolation' },
            { k: 'noConsole', label: 'No Debug console.log' },
            { k: 'noAny', label: 'Strict Types (No Any)' },
            { k: 'testVerify', label: 'Pre-completion Verification' }
          ].map((g) => (
            <button
              key={g.k}
              onClick={() => toggleGuard(g.k)}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                guards[g.k] ? 'bg-white/[0.06] border-white/20 text-white' : 'bg-white/[0.01] border-white/[0.04] text-zinc-500'
              }`}
            >
              <span>{g.label}</span>
              {guards[g.k] ? <Check size={13} className="text-zinc-200 stroke-[2.5]" /> : <div className="w-3.5 h-3.5 rounded-md border border-white/15" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
