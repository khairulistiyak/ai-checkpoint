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
    const prompt = `You are implementing the plan from: ${filename}\n\nStrict Rules:\n1. 1 step = 1 file — finish one before starting the next\n2. Run './l start X.Y' before starting\n3. Run './l c X.Y \"note\"' after verifying\n4. Never skip steps\n\nBlueprint Specification:\n${content}`;
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
    return `Implement Step ${step.stepNum}: ${step.stepTitle}\n\nBlueprint Reference: ${filename}\n\nStep Instructions & Context:\n${step.body || step.rawHeading}\n\nRules to follow:\n- 1 step = 1 file — finish one before starting the next\n- Run './l start ${step.stepNum}' to begin\n- Perform the implementation and verify\n- Run './l c ${step.stepNum} \"Done\"' once verified`;
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
