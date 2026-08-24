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
    <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-[#0c0c0f] border border-white/10 shadow-sm">
      {/* Filter Tabs - Only show non-zero items */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border cursor-pointer ${
            filterType === 'all'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold shadow-sm'
              : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>All ({modules.length})</span>
          </span>
        </button>

        {stats.totalSteps > 0 && (
          <button
            onClick={() => setFilterType('steps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
              filterType === 'steps'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Steps ({stats.totalSteps})</span>
          </button>
        )}

        {stats.totalTasks > 0 && (
          <button
            onClick={() => setFilterType('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
              filterType === 'tasks'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Tasks ({stats.totalTasks})</span>
          </button>
        )}

        {stats.codeBlocks > 0 && (
          <button
            onClick={() => setFilterType('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
              filterType === 'code'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Code ({stats.codeBlocks})</span>
          </button>
        )}
      </div>

      {/* Search and Quick Expand Toggle */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-56">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/40"
          />
        </div>

        {modules.length > 1 && (
          <button
            onClick={toggleAll}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-mono flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
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

