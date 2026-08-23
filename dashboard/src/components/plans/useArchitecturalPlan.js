import { useState, useMemo } from 'react';
import { parsePlanContent } from './parse-plan-content';

export function useArchitecturalPlan({ content, filename }) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedModules, setCollapsedModules] = useState({});
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [copiedStepBadge, setCopiedStepBadge] = useState(null);
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
    const prompt = [
      `# [AI AGENT TASK: IMPLEMENT ARCHITECTURAL PLAN]`,
      `You are implementing the blueprint from: \`${filename}\``,
      ``,
      `## 🛡️ Strict Non-Breaking Rules (MANDATORY):`,
      `1. CONTRACT PRESERVATION: Do NOT modify existing function exports, props, or signatures.`,
      `2. 1 STEP = 1 FILE: Complete each step sequentially without skipping.`,
      `3. EXECUTION CYCLE: Run \`./l start X.Y\`, modify file, verify with \`./l v && npm test\`, then run \`./l c X.Y "note"\`.`,
      `4. RULE 0 COMPLIANCE: Every created or modified file must remain strictly <= 150 lines.`,
      ``,
      `## Blueprint Specification:`,
      content
    ].join('\n');
    navigator.clipboard.writeText(prompt);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2500);
  };

  const targetFiles = useMemo(() => {
    if (!content) return [];
    const matches = content.match(/(?:(?:src|plan|\.agents|dashboard|server|components|utils|lib)\/[a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)|(?:`([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]{2,4})`)/g);
    if (!matches) return [];
    const clean = matches.map(m => m.replace(/[`]/g, '').trim()).filter(m => {
      return /\.(jsx?|tsx?|json|css|md|html|yaml|yml|sh|py|sql)$/i.test(m) && !m.startsWith('http');
    });
    return Array.from(new Set(clean)).slice(0, 16);
  }, [content]);

  const { title, modules, stats } = useMemo(() => parsePlanContent(content, filename), [content, filename]);

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

  const percentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 100;

  const scrollToModule = (idx) => {
    const el = document.getElementById(`arch-mod-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveModuleIndex(idx);
    }
  };

  const generateStepPrompt = (step) => {
    return [
      `# [AI AGENT TASK: STEP ${step.stepNum}]`,
      `Implement Step ${step.stepNum} — ${step.stepTitle}`,
      ``,
      `Blueprint Reference: \`${filename}\``,
      ``,
      `## Step Instructions & Context:`,
      step.body || step.rawHeading,
      ``,
      `## 🛡️ Strict Non-Breaking Rules:`,
      `- 1 step = 1 file: Touch only declared files`,
      `- Start: \`./l start ${step.stepNum}\``,
      `- Verify: \`./l v && npm test\``,
      `- Complete: \`./l c ${step.stepNum} "Completed ${step.stepTitle}"\``,
      `- File must strictly remain <= 150 lines.`
    ].join('\n');
  };

  return {
    title, modules, stats, percentage, targetFiles, filteredModules,
    copiedCodeIndex, activeModuleIndex, filterType, setFilterType,
    searchQuery, setSearchQuery, collapsedModules, setCollapsedModules,
    copiedSpec, copiedStepBadge, copiedFilePath, setCopiedFilePath,
    toggleCollapse, copySnippet, copyStepCommand, copyFullSpecAsPrompt,
    scrollToModule, generateStepPrompt
  };
}
