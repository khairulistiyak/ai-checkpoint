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
        <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="text-xs font-mono uppercase tracking-widest text-white/80 font-bold flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
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

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 custom-scrollbar">
            {modules.map((mod, idx) => {
              const modPercent = mod.tasksTotal > 0 ? Math.round((mod.tasksDone / mod.tasksTotal) * 100) : 100;
              const isSelected = activeModuleIndex === idx;
              return (
                <React.Fragment key={idx}>
                  <button
                    onClick={() => scrollToModule(idx)}
                    className={`flex flex-col gap-1.5 px-3 py-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20 text-white/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md font-mono text-[10px] font-bold flex items-center justify-center border ${isSelected ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/10 text-white border-white/20'}`}>
                        {mod.number}
                      </span>
                      <span className="text-xs font-bold truncate max-w-[8.5rem]">{mod.title}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${modPercent}%` }} />
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
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
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
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
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
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
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
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
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
