import React, { useState, useMemo } from 'react';
import { 
  Layers, CheckCircle2, Circle, Code2, Copy, Check, 
  FileCode2, Sparkles, ChevronRight, ChevronDown, BookOpen, ShieldCheck, 
  Terminal, Cpu, ArrowRight, Activity, Zap, CheckCircle, 
  Search, Play, Bot, FileText, CornerDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArchitecturalPlanViewer({ content, filename }) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'tasks' | 'code' | 'steps'
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedModules, setCollapsedModules] = useState({});
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [copiedStepBadge, setCopiedStepBadge] = useState(null); // stepId + type
  const [selectedPromptStep, setSelectedPromptStep] = useState(null);
  const [copiedFilePath, setCopiedFilePath] = useState(null);

  const toggleCollapse = (idx) => {
    setCollapsedModules(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copySnippet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const copyStepCommand = (cmd, stepKey, type) => {
    navigator.clipboard.writeText(cmd);
    setCopiedStepBadge(`${stepKey}-${type}`);
    setTimeout(() => setCopiedStepBadge(null), 2000);
  };

  const copyFullSpecAsPrompt = () => {
    const prompt = `You are implementing the plan from: ${filename}\n\nStrict Rules:\n1. 1 step = 1 file — finish one before starting the next\n2. Run './l start X.Y' before starting\n3. Run './l c X.Y \"note\"' after verifying\n4. Never skip steps\n\nBlueprint Specification:\n${content}`;
    navigator.clipboard.writeText(prompt);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2500);
  };

  // Target Files Extractor
  const targetFiles = useMemo(() => {
    if (!content) return [];
    const matches = content.match(/(?:(?:src|plan|\.agents|dashboard|server|components|utils|lib)\/[a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)|(?:`([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]{2,4})`)/g);
    if (!matches) return [];
    const clean = matches.map(m => m.replace(/[`]/g, '').trim()).filter(m => {
      return /\.(jsx?|tsx?|json|css|md|html|yaml|yml|sh|py|sql)$/i.test(m) && !m.startsWith('http');
    });
    return Array.from(new Set(clean)).slice(0, 16);
  }, [content]);

  // Parse markdown content into structured architectural blocks grouped by Module (h2)
  const { title, modules, stats } = useMemo(() => {
    if (!content) return { title: filename, modules: [], stats: { totalTasks: 0, completedTasks: 0, codeBlocks: 0, totalSteps: 0 } };
    const lines = content.split('\n');
    let mainTitle = filename;
    let currentModule = {
      number: '00',
      title: 'Overview & Core Architecture',
      blocks: [],
      tasksTotal: 0,
      tasksDone: 0,
      codeCount: 0,
      stepsCount: 0
    };
    const parsedModules = [];
    let modCount = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let codeBlocks = 0;
    let totalSteps = 0;

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
          codeCount: 0,
          stepsCount: 0
        };
        i++;
        continue;
      }

      // Step Heading: ### Step 35.1 — Add XYZ
      const stepMatch = line.match(/^###\s+(Step\s+([0-9]+(?:\.[0-9]+)?)[^:\n—\-]*)[—\-:]?\s*(.*)/i);
      if (stepMatch) {
        const stepRaw = stepMatch[1].trim();
        const stepNum = stepMatch[2].trim();
        const stepTitle = (stepMatch[3] || stepRaw).trim();
        totalSteps++;
        currentModule.stepsCount++;
        
        // Collect following content under this step until next heading
        const stepBody = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('#')) {
          stepBody.push(lines[i]);
          i++;
        }

        currentModule.blocks.push({
          type: 'step',
          stepNum,
          stepTitle,
          rawHeading: line.replace(/^###+\s*/, '').trim(),
          body: stepBody.join('\n').trim()
        });
        continue;
      }

      // Other H3, H4, H5 headings
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

      // Paragraph
      const paraLines = [];
      while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].trim().startsWith('```') && !/^\s*[-*]\s/.test(lines[i]) && !lines[i].trim().startsWith('>')) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length > 0) {
        currentModule.blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
        continue;
      }

      // Safe fallback
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
      stats: { totalTasks, completedTasks, codeBlocks, totalModules: parsedModules.length, totalSteps }
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
        (filterType === 'steps' && mod.stepsCount > 0) ||
        (filterType === 'code' && mod.codeCount > 0);

      return matchesSearch && matchesFilter;
    });
  }, [modules, searchQuery, filterType]);

  // Highlight inline code and bold text with monochrome Apple styling
  const formatTextWithBadges = (text) => {
    if (!text) return null;
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeText = part.slice(1, -1);
        return (
          <span key={index} className="inline-flex items-center gap-1 font-mono text-cyber-accent bg-cyber-accent/[0.08] px-1.5 py-0.2 rounded text-[11px] mx-0.5 font-bold">
            <span>{codeText}</span>
          </span>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="text-cyber-accent font-bold tracking-tight bg-cyber-accent/[0.08] px-1.5 py-0.2 rounded">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const formatCodeWithTheme = (code) => {
    if (!code) return '';
    let html = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    // Comments
    html = html.replace(/(\/\/.*$|#.*$)/gm, '<span class="text-[#5c6370] italic">$1</span>');
    // Strings
    html = html.replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`|&apos;.*?&apos;|".*?"|'.*?')/g, '<span class="text-[#98c379]">$1</span>');
    // Keywords
    html = html.replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|class|new|this|async|await|try|catch|switch|case|default|break)\b/g, '<span class="text-[#c678dd] font-bold">$1</span>');
    // Booleans & Null
    html = html.replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#d19a66]">$1</span>');
    // Numbers
    html = html.replace(/\b(\d+)\b/g, '<span class="text-[#d19a66]">$1</span>');
    // Functions calls
    html = html.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()/g, '<span class="text-[#61afef]">$1</span>');
    
    return html;
  };

  const percentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 100;

  const scrollToModule = (idx) => {
    const el = document.getElementById(`arch-mod-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveModuleIndex(idx);
    }
  };

  const generateStepPrompt = (step) => {
    return `Implement Step ${step.stepNum}: ${step.stepTitle}\n\nBlueprint Reference: ${filename}\n\nStep Instructions & Context:\n${step.body || step.rawHeading}\n\nRules to follow:\n- 1 step = 1 file — finish one before starting the next\n- Run './l start ${step.stepNum}' to begin\n- Perform the implementation and verify\n- Run './l c ${step.stepNum} \"Done\"' once verified`;
  };

  return (
    <div className="space-y-6 pb-16 font-outfit text-white/90 relative">
      {/* 1. RESTFUL LINEAR DARK ARCHITECTURAL HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0e0e11] border border-white/15 p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-white" />
                SYSTEM ARCHITECTURE BLUEPRINT
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/15 text-white/70 font-mono text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {stats.totalSteps > 0 ? `${stats.totalSteps} Execution Steps` : 'Verified Plan'}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs font-mono text-white/60 leading-relaxed">
              Atomic execution specification • <strong className="text-white">{stats.totalModules} modules</strong> • <strong className="text-white">{stats.totalTasks} checkpoints</strong>
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
            {stats.totalTasks > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Tasks Completed</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {stats.completedTasks} / {stats.totalTasks} ({percentage}%)
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-xs font-mono font-black text-white">{percentage}%</span>
                </div>
              </div>
            )}

            <button
              onClick={copyFullSpecAsPrompt}
              className="px-3.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 border border-white font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              title="Copy entire blueprint as an AI instruction prompt"
            >
              {copiedSpec ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>Prompt Copied!</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" />
                  <span>Copy AI Full Plan Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. TARGET FILES & DEPENDENCIES RADAR */}
        {targetFiles.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2 text-[11px] font-mono uppercase tracking-wider text-white/60 font-semibold">
              <FileCode2 className="w-3.5 h-3.5 text-white/50" />
              <span>Target Files & References Radar ({targetFiles.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {targetFiles.map((filePath, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigator.clipboard.writeText(filePath);
                    setCopiedFilePath(filePath);
                    setTimeout(() => setCopiedFilePath(null), 1500);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-white/80 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer group shadow-sm"
                  title="Click to copy file path"
                >
                  <span className="text-white/40 group-hover:text-white/60">📄</span>
                  <span className="truncate max-w-[200px]">{filePath}</span>
                  {copiedFilePath === filePath ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE TOPOLOGY MAP */}
      {modules.length > 1 && (
        <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="text-xs font-mono uppercase tracking-widest text-white/80 font-bold flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-white" />
              <span>ARCHITECTURAL TOPOLOGY MAP</span>
            </div>

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
              className="text-xs font-mono text-white/60 hover:text-white underline cursor-pointer"
            >
              {Object.keys(collapsedModules).length === modules.length ? 'Expand All Modules' : 'Collapse All Modules'}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {modules.map((mod, idx) => {
              const modPercent = mod.tasksTotal > 0 ? Math.round((mod.tasksDone / mod.tasksTotal) * 100) : 100;
              const isSelected = activeModuleIndex === idx;
              return (
                <React.Fragment key={idx}>
                  <button
                    onClick={() => scrollToModule(idx)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left shrink-0 transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-cyber-accent/10 border-cyber-accent/40 text-cyber-accent shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.15)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20 text-white/80 hover:text-white'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg font-mono text-[11px] font-bold flex items-center justify-center border transition-colors ${isSelected ? 'bg-cyber-accent/20 text-cyber-accent border-cyber-accent/40' : 'bg-white/10 text-white border-white/20'}`}>
                      {mod.number}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold truncate max-w-[140px]">{mod.title}</span>
                      <span className="text-[10px] font-mono text-white/40">
                        {mod.tasksDone}/{mod.tasksTotal} ({modPercent}%)
                      </span>
                    </div>
                  </button>
                  {idx < modules.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. HUD FILTERS & SPEC SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
              filterType === 'all'
                ? 'bg-cyber-accent/10 text-cyber-accent border-cyber-accent/30 shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.1)]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            All Modules ({modules.length})
          </button>
          {stats.totalSteps > 0 && (
            <button
              onClick={() => setFilterType('steps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                filterType === 'steps'
                  ? 'bg-cyber-accent/10 text-cyber-accent border-cyber-accent/30 shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.1)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Steps ({stats.totalSteps})</span>
            </button>
          )}
          <button
            onClick={() => setFilterType('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              filterType === 'tasks'
                ? 'bg-cyber-accent/10 text-cyber-accent border-cyber-accent/30 shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.1)]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Tasks ({stats.totalTasks})</span>
          </button>
          <button
            onClick={() => setFilterType('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              filterType === 'code'
                ? 'bg-cyber-accent/10 text-cyber-accent border-cyber-accent/30 shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.1)]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code ({stats.codeBlocks})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search spec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-white/40"
          />
        </div>
      </div>

      {/* 5. ARCHITECTURAL MODULES ACCORDION */}
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
    </div>
  );
}
