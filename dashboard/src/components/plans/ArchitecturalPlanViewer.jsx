import React, { useState, useMemo } from 'react';
import { 
  Layers, CheckCircle2, Circle, Code2, Copy, Check, 
  FileCode2, Sparkles, ChevronRight, ChevronDown, BookOpen, ShieldCheck, 
  Terminal, Cpu, GitCommit, ArrowRight, Activity, Zap, CheckCircle, 
  Filter, Eye, Play, Share2, Award, Flame, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArchitecturalPlanViewer({ content, filename }) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'tasks' | 'code'
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedModules, setCollapsedModules] = useState({});
  const [copiedSpec, setCopiedSpec] = useState(false);

  const toggleCollapse = (idx) => {
    setCollapsedModules(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copySnippet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const copyFullSpecAsPrompt = () => {
    const prompt = `# AI ARCHITECTURAL EXECUTION SPEC\n# TARGET FILE: ${filename}\n\n${content}`;
    navigator.clipboard.writeText(prompt);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2500);
  };

  // 1. Parse markdown content into structured architectural blocks grouped by Module (h2)
  const { title, modules, stats } = useMemo(() => {
    if (!content) return { title: filename, modules: [], stats: { totalTasks: 0, completedTasks: 0, codeBlocks: 0 } };
    const lines = content.split('\n');
    let mainTitle = filename;
    let currentModule = {
      number: '00',
      title: 'Overview & Core Architecture',
      blocks: [],
      tasksTotal: 0,
      tasksDone: 0,
      codeCount: 0
    };
    const parsedModules = [];
    let modCount = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let codeBlocks = 0;

    let i = 0;
    while (i < lines.length) {
      const prevI = i;
      const line = lines[i];

      // H1 Title
      if (line.startsWith('# ')) {
        mainTitle = line.slice(2).trim();
        i++;
        continue;
      }

      // H2 -> Start new Module
      if (line.startsWith('## ')) {
        if (currentModule.blocks.length > 0 || modCount > 0) {
          parsedModules.push(currentModule);
        }
        modCount++;
        const numStr = modCount < 10 ? `0${modCount}` : `${modCount}`;
        currentModule = {
          number: numStr,
          title: line.slice(3).trim(),
          blocks: [],
          tasksTotal: 0,
          tasksDone: 0,
          codeCount: 0
        };
        i++;
        continue;
      }

      // H3, H4, H5, H6 headings
      if (/^###+\s/.test(line)) {
        const text = line.replace(/^###+\s*/, '').trim();
        currentModule.blocks.push({ type: 'h3', text });
        i++;
        continue;
      }

      // Code blocks
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim() || 'code';
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        codeBlocks++;
        currentModule.codeCount++;
        currentModule.blocks.push({ type: 'codeblock', language: lang, code: codeLines.join('\n') });
        if (i < lines.length) i++;
        continue;
      }

      // Checklist tasks (- [ ] or - [x] or * [ ])
      if (/^\s*[-*]\s*\[([ xX~_-]?)\]\s*(.*)/.test(line)) {
        const items = [];
        while (i < lines.length) {
          const match = lines[i].match(/^\s*[-*]\s*\[([ xX~_-]?)\]\s*(.*)/);
          if (!match) break;
          const checked = match[1].toLowerCase() === 'x';
          const text = match[2].trim() || 'Task checkpoint';
          items.push({ checked, text });
          totalTasks++;
          currentModule.tasksTotal++;
          if (checked) {
            completedTasks++;
            currentModule.tasksDone++;
          }
          i++;
        }
        if (items.length > 0) {
          currentModule.blocks.push({ type: 'checklist', items });
          continue;
        }
      }

      // Bullet list (- or * )
      if (/^\s*[-*]\s+(.+)/.test(line)) {
        const items = [];
        while (i < lines.length) {
          const match = lines[i].match(/^\s*[-*]\s+(.+)/);
          if (!match || /^\s*[-*]\s*\[/.test(lines[i])) break;
          items.push(match[1].trim());
          i++;
        }
        if (items.length > 0) {
          currentModule.blocks.push({ type: 'list', items });
          continue;
        }
      }

      // Blockquote
      if (line.trim().startsWith('>')) {
        const quotes = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quotes.push(lines[i].trim().replace(/^>\s*/, ''));
          i++;
        }
        currentModule.blocks.push({ type: 'quote', text: quotes.join(' ') });
        continue;
      }

      // Empty line
      if (!line.trim()) {
        i++;
        continue;
      }

      // Paragraph - gather contiguous normal text lines
      const paraLines = [];
      while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].trim().startsWith('```') && !/^\s*[-*]\s/.test(lines[i]) && !lines[i].trim().startsWith('>')) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length > 0) {
        currentModule.blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
        continue;
      }

      // SAFE FALLBACK: If no parser advanced `i` (e.g. unrecognized Markdown line), guarantee `i++` so infinite loops are impossible!
      if (i === prevI) {
        if (lines[i].trim()) {
          currentModule.blocks.push({ type: 'paragraph', text: lines[i].trim() });
        }
        i++;
      }
    }

    if (currentModule.blocks.length > 0 || parsedModules.length === 0) {
      parsedModules.push(currentModule);
    }

    return {
      title: mainTitle,
      modules: parsedModules,
      stats: { totalTasks, completedTasks, codeBlocks, totalModules: parsedModules.length }
    };
  }, [content, filename]);

  // Filter modules based on search or active category filter
  const filteredModules = useMemo(() => {
    return modules.filter(mod => {
      const matchesSearch = !searchQuery || 
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.blocks.some(b => JSON.stringify(b).toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = 
        filterType === 'all' || 
        (filterType === 'tasks' && mod.tasksTotal > 0) ||
        (filterType === 'code' && mod.codeCount > 0);

      return matchesSearch && matchesFilter;
    });
  }, [modules, searchQuery, filterType]);

  // Highlight inline code and bold text
  const formatTextWithBadges = (text) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeText = part.slice(1, -1);
        return (
          <span key={index} className="inline-flex items-center gap-1 font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/40 px-2 py-0.5 rounded-md text-[11px] mx-0.5 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-bold">
            <Code2 className="w-3 h-3 opacity-80 text-cyan-400" />
            <span>{codeText}</span>
          </span>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="text-white font-bold tracking-tight bg-white/5 px-1.5 py-0.5 rounded">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const percentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 100;

  const scrollToModule = (idx) => {
    const el = document.getElementById(`arch-mod-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveModuleIndex(idx);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-outfit text-white/90 relative">
      {/* 1. RESTFUL LINEAR DARK ARCHITECTURAL HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0e121e] border border-white/10 p-6 sm:p-8">
        {/* Soft Subtle CAD Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Header Top Strip */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/15 text-sky-400 font-mono text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                SYSTEM ARCHITECTURE BLUEPRINT
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                INTEGRITY VERIFIED • v1.0
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-outfit">
              {title}
            </h1>
            <p className="text-xs sm:text-sm font-mono text-white/60 leading-relaxed">
              Atomic execution specification • Organized into <strong className="text-white">{stats.totalModules} modular systems</strong> with full validation checkpoints.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <button
              onClick={copyFullSpecAsPrompt}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 border ${
                copiedSpec 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                  : 'bg-white/10 border-white/20 hover:bg-white/15 text-white'
              }`}
            >
              {copiedSpec ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>COPIED AGENT PROMPT!</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-sky-400" />
                  <span>COPY AI AGENT PROMPT</span>
                </>
              )}
            </button>

            {/* Health Meter Card */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-2xl">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Health Index</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span className="text-2xl font-black text-white font-mono">{percentage}%</span>
                </div>
              </div>

              <div className="w-px h-10 bg-white/10" />

              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Tasks</span>
                <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {stats.completedTasks}/{stats.totalTasks} DONE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. INTERACTIVE ARCHITECTURAL TOPOLOGY (Live Visual Node Flow) */}
        {modules.length > 1 && (
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>ARCHITECTURAL TOPOLOGY MAP • QUICK JUMP</span>
              </div>

              {/* Expand / Collapse All */}
              <button
                onClick={() => {
                  const allCollapsed = Object.keys(collapsedModules).length === modules.length;
                  if (allCollapsed) {
                    setCollapsedModules({});
                  } else {
                    const newCol = {};
                    modules.forEach((_, idx) => { newCol[idx] = true; });
                    setCollapsedModules(newCol);
                  }
                }}
                className="text-xs font-mono text-white/60 hover:text-white underline"
              >
                {Object.keys(collapsedModules).length === modules.length ? 'Expand All Modules' : 'Collapse All Modules'}
              </button>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-3 custom-scrollbar">
              {modules.map((mod, idx) => {
                const modPercent = mod.tasksTotal > 0 ? Math.round((mod.tasksDone / mod.tasksTotal) * 100) : 100;
                const isSelected = activeModuleIndex === idx;
                return (
                  <React.Fragment key={idx}>
                    <button
                      onClick={() => scrollToModule(idx)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all group ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500/25 to-cyan-500/10 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-105'
                          : 'bg-white/5 border-white/10 hover:border-cyan-500/40 text-white/80 hover:text-white'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono text-xs font-black flex items-center justify-center border border-cyan-500/40 group-hover:scale-105 transition-transform">
                        {mod.number}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold truncate max-w-[160px]">{mod.title}</span>
                        <span className="text-[10px] font-mono text-white/50">
                          {mod.tasksDone}/{mod.tasksTotal} Tasks ({modPercent}%)
                        </span>
                      </div>
                    </button>
                    {idx < modules.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-cyan-500/40 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE HUD FILTERS & SEARCH BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filterType === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            All Modules ({modules.length})
          </button>
          <button
            onClick={() => setFilterType('tasks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'tasks'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Tasks ({stats.totalTasks})</span>
          </button>
          <button
            onClick={() => setFilterType('code')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'code'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code ({stats.codeBlocks})</span>
          </button>
        </div>

        {/* Search Inside Spec */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter spec content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* 4. ARCHITECTURAL MODULE COLLAPSIBLE BLOCKS (High-tech Foldable CAD Modules) */}
      <div className="space-y-6">
        {filteredModules.length === 0 ? (
          <div className="text-center py-16 text-white/40 font-mono text-xs bg-white/[0.01] rounded-2xl border border-white/5">
            No architectural modules match your search filter.
          </div>
        ) : (
          filteredModules.map((mod, modIdx) => {
            const modPercent = mod.tasksTotal > 0 ? Math.round((mod.tasksDone / mod.tasksTotal) * 100) : 100;
            const isCollapsed = collapsedModules[modIdx];
            return (
              <motion.div
                id={`arch-mod-${modIdx}`}
                key={modIdx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: modIdx * 0.05 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-black/80 via-black/50 to-black/40 border border-white/10 hover:border-cyan-500/30 transition-all shadow-2xl"
              >
                {/* Left Holographic Status Bar */}
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-cyan-400 via-emerald-400 to-cyan-500" />

                {/* Collapsible Module Header Bar */}
                <button
                  onClick={() => toggleCollapse(modIdx)}
                  className="w-full px-6 py-5 bg-white/[0.02] border-b border-white/10 flex flex-wrap items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-black shadow-sm">
                      LAYER {mod.number}
                    </span>
                    <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                      {mod.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {mod.tasksTotal > 0 && (
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-white/60">
                          Verified: <strong className="text-emerald-400">{mod.tasksDone}/{mod.tasksTotal}</strong>
                        </span>
                        <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                            style={{ width: `${modPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Module Content Body */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-6 sm:p-8 space-y-5"
                    >
                      {mod.blocks.map((block, idx) => {
                        if (block.type === 'h3') {
                          return (
                            <div key={idx} className="flex items-center gap-2 pt-3 pb-1 border-b border-white/5">
                              <div className="w-2 h-2 rounded-full bg-cyan-400" />
                              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono">
                                {block.text}
                              </h3>
                            </div>
                          );
                        }

                        if (block.type === 'checklist') {
                          return (
                            <div key={idx} className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-3 my-4 shadow-inner">
                              <div className="text-xs font-mono text-white/60 uppercase tracking-widest pb-2 border-b border-white/10 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                  <span>Atomic Execution Checkpoints</span>
                                </span>
                                <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                                  {block.items.length} Tasks
                                </span>
                              </div>
                              {block.items.map((item, i) => (
                                <div
                                  key={i}
                                  className={`flex items-start gap-3.5 p-3.5 rounded-xl transition-all border ${
                                    item.checked
                                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                      : 'bg-white/[0.02] border-white/10 text-white/90 hover:border-white/20'
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {item.checked ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-white/30" />
                                    )}
                                  </div>
                                  <div className="flex-1 text-xs sm:text-sm leading-relaxed font-mono">
                                    <span className={item.checked ? 'line-through opacity-80' : ''}>
                                      {formatTextWithBadges(item.text)}
                                    </span>
                                  </div>
                                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 font-bold border ${
                                    item.checked 
                                      ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40' 
                                      : 'bg-white/5 text-white/40 border-white/10'
                                  }`}>
                                    {item.checked ? '✓ VERIFIED' : 'PENDING'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        if (block.type === 'codeblock') {
                          return (
                            <div key={idx} className="bg-[#05070c] rounded-2xl border border-white/15 overflow-hidden my-5 shadow-2xl">
                              {/* Mac-style IDE title bar */}
                              <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10 text-xs font-mono">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
                                  </div>
                                  <span className="uppercase tracking-wider text-xs font-black text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded border border-cyan-500/30">
                                    {block.language}
                                  </span>
                                </div>
                                <button
                                  onClick={() => copySnippet(block.code, idx)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all text-xs font-mono border border-white/10 shadow-sm"
                                >
                                  {copiedCodeIndex === idx ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400 font-bold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Code</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="p-5 overflow-x-auto custom-scrollbar">
                                <pre className="text-xs font-mono leading-relaxed text-slate-200">
                                  {block.code}
                                </pre>
                              </div>
                            </div>
                          );
                        }

                        if (block.type === 'quote') {
                          return (
                            <div key={idx} className="p-5 rounded-2xl bg-cyan-950/30 border-l-4 border-cyan-400 text-xs sm:text-sm font-mono text-cyan-200/90 my-4 shadow-sm">
                              {formatTextWithBadges(block.text)}
                            </div>
                          );
                        }

                        if (block.type === 'list') {
                          return (
                            <ul key={idx} className="space-y-3 pl-2 my-4">
                              {block.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed text-white/80">
                                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                  <span>{formatTextWithBadges(item)}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }

                        return (
                          <p key={idx} className="text-xs sm:text-sm leading-relaxed text-white/80 my-3">
                            {formatTextWithBadges(block.text)}
                          </p>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
