import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, Search, Folder, RefreshCw } from 'lucide-react';
import { fetchProjectRunConfig } from '../../utils/api';
import RunCommandCard from './RunCommandCard';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'dev', label: 'Dev Server' },
  { id: 'test', label: 'Testing' },
  { id: 'build', label: 'Build' },
  { id: 'lint', label: 'Lint & Verify' },
  { id: 'checkpoint', label: 'Ledger' }
];

export default function ProjectRunPanel({ project }) {
  const [runConfig, setRunConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [copiedRoot, setCopiedRoot] = useState(null);

  const loadConfig = async () => {
    if (!project?.id) return;
    try {
      setLoading(true);
      const data = await fetchProjectRunConfig(project.id);
      setRunConfig(data);
    } catch (e) {
      console.error('Failed to load run config:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConfig(); }, [project?.id]);

  const copyPath = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedRoot(type);
    setTimeout(() => setCopiedRoot(null), 2000);
  };

  const allCmds = [...(runConfig?.commands || []), ...(runConfig?.customCommands || [])];
  const filtered = allCmds.filter(c => {
    const matchCat = category === 'all' || c.category === category;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.cmd.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] overflow-y-auto p-4 md:p-6 gap-6">
      <div className="bg-[#121214] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Folder className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-white/50 font-mono">PROJECT EXECUTION ROOT</div>
            <div className="text-xs md:text-sm font-mono text-white/90 truncate font-semibold">{project?.path}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => copyPath(project?.path || '', 'path')}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white/80 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copiedRoot === 'path' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Path</span>
          </button>
          <button
            onClick={() => copyPath(`cd "${project?.path || ''}"`, 'cd')}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copiedRoot === 'cd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
            <span>Copy `cd`</span>
          </button>
          <button
            onClick={loadConfig}
            title="Refresh commands"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                category === cat.id ? 'bg-white/15 text-white border border-white/30 font-bold' : 'text-white/50 hover:text-white/80 bg-white/5 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search run commands..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-white/25"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-white/40">Loading project run environment...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-white/40 border border-white/5 rounded-xl bg-white/[0.02]">
          No commands found for category: {category}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <RunCommandCard key={c.id} cmd={c} projectPath={project?.path} />
          ))}
        </div>
      )}
    </div>
  );
}
