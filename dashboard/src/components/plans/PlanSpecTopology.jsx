import React from 'react';
import { Terminal, CheckCircle, Code2, Search, ChevronsUpDown, Layers } from 'lucide-react';

export default function PlanSpecTopology({
  modules,
  collapsedModules,
  setCollapsedModules,
  filterType,
  setFilterType,
  stats,
  searchQuery,
  setSearchQuery,
}) {
  const allCollapsed = Object.keys(collapsedModules).length === modules.length;
  const toggleAll = () => {
    if (allCollapsed) {
      setCollapsedModules({});
    } else {
      const newCol = {};
      modules.forEach((_, idx) => { newCol[idx] = true; });
      setCollapsedModules(newCol);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-[#0c0c0f] border border-white/[0.08] shadow-sm">
      {/* Filter Tabs - Clean Monochromatic */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border cursor-pointer ${
            filterType === 'all'
              ? 'bg-white/10 text-white border-white/20 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-300" />
            <span>All ({modules.length})</span>
          </span>
        </button>

        {stats.totalSteps > 0 && (
          <button
            onClick={() => setFilterType('steps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
              filterType === 'steps'
                ? 'bg-white/10 text-white border-white/20 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-300" />
            <span>Steps ({stats.totalSteps})</span>
          </button>
        )}

        {stats.totalTasks > 0 && (
          <button
            onClick={() => setFilterType('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
              filterType === 'tasks'
                ? 'bg-white/10 text-white border-white/20 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-zinc-300" />
            <span>Tasks ({stats.totalTasks})</span>
          </button>
        )}

        {stats.codeBlocks > 0 && (
          <button
            onClick={() => setFilterType('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
              filterType === 'code'
                ? 'bg-white/10 text-white border-white/20 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-zinc-300" />
            <span>Code ({stats.codeBlocks})</span>
          </button>
        )}
      </div>

      {/* Search and Quick Expand Toggle */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-56">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 rounded-lg bg-black/50 border border-white/[0.08] text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>

        {modules.length > 1 && (
          <button
            onClick={toggleAll}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs font-mono flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            title={allCollapsed ? 'Expand All Modules' : 'Collapse All Modules'}
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{allCollapsed ? 'Expand' : 'Collapse'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

