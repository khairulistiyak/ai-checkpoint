import React from 'react';
import { Activity, ArrowRight, Terminal, CheckCircle, Code2, Search } from 'lucide-react';

export default function PlanSpecTopology({
  modules,
  collapsedModules,
  setCollapsedModules,
  activeModuleIndex,
  scrollToModule,
  filterType,
  setFilterType,
  stats,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <>
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
    </>
  );
}
