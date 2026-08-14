import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, BookOpen } from 'lucide-react';
import { fetchProjectRunConfig } from '../../utils/api';
import RunCommandCard from './RunCommandCard';

const CATEGORIES = [
  { id: 'all', label: 'All Commands' },
  { id: 'dev', label: 'Dev Server' },
  { id: 'test', label: 'Testing' },
  { id: 'build', label: 'Build' },
  { id: 'lint', label: 'Lint & Verify' },
  { id: 'checkpoint', label: 'Ledger' }
];

export default function ProjectRunPanel({ project, onOpenConfig }) {
  const [runConfig, setRunConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

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

  const allCmds = [...(runConfig?.commands || []), ...(runConfig?.customCommands || [])];
  const filtered = allCmds.filter(c => {
    const matchCat = category === 'all' || c.category === category;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.cmd.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] overflow-y-auto p-3 sm:p-5 gap-4">
      {/* Golden Rules & Conventions Strip */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-300">
          <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold text-white">Workflow Rules:</span>
          <span className="text-zinc-400">1 step = 1 file (&le;150 lines) &bull; Zero token waste &bull; Strict incremental execution</span>
        </div>
        {onOpenConfig && (
          <button
            onClick={onOpenConfig}
            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-200 transition-all cursor-pointer shrink-0"
          >
            Edit Config
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                category === cat.id ? 'bg-white/15 text-white border border-white/30 font-bold' : 'text-zinc-400 hover:text-white bg-white/[0.03] border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search CLI commands..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/20"
            />
          </div>
          <button
            onClick={loadConfig}
            title="Refresh commands"
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Command Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading project run environment...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500 border border-white/5 rounded-2xl bg-white/[0.02]">
          No commands found for category: {category}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map(c => (
            <RunCommandCard key={c.id} cmd={c} projectPath={project?.path} />
          ))}
        </div>
      )}
    </div>
  );
}
