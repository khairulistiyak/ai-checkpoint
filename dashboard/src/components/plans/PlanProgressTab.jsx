import React, { useState, useMemo } from 'react';
import { Search, Activity } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PhaseView from '../PhaseView';
import FilePreviewDrawer from './FilePreviewDrawer';

export default function PlanProgressTab({
  project,
  allPhases,
  filteredPhases,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  selectedPhaseNumber,
  setSelectedPhaseNumber,
  onRefresh
}) {
  const [selectedPlanFile, setSelectedPlanFile] = useState(null);

  const counts = useMemo(() => {
    let total = 0, done = 0, active = 0, pending = 0;
    for (const p of allPhases) {
      for (const s of (p.steps || [])) {
        total++;
        if (s.status === 'completed' || s.status === 'done') done++;
        else if (s.status === 'running' || s.status === 'in_progress') active++;
        else pending++;
      }
    }
    return { total, done, active, pending };
  }, [allPhases]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] relative overflow-hidden">
      <div className="p-3.5 sm:px-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/20 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search steps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 w-44 sm:w-52 font-mono transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1">
            {[
              { id: 'all', label: 'All', count: counts.total },
              { id: 'done', label: 'Done', count: counts.done, color: 'text-emerald-400' },
              { id: 'in_progress', label: 'Active', count: counts.active, color: 'text-amber-400' },
              { id: 'pending', label: 'Pending', count: counts.pending, color: 'text-zinc-400' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setStatusFilter(item.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  statusFilter === item.id
                    ? 'bg-white/15 text-white border border-white/25 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-[10px] font-mono px-1 rounded bg-black/30 ${item.color || 'text-zinc-400'}`}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">Phase:</span>
          <select
            value={selectedPhaseNumber}
            onChange={(e) => setSelectedPhaseNumber(e.target.value)}
            className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-white/20 cursor-pointer"
          >
            <option value="all" className="bg-[#121214]">All Phases ({allPhases.length})</option>
            {allPhases.map((phase) => (
              <option key={phase.number} value={phase.number} className="bg-[#121214]">
                Phase {phase.number}: {phase.name || phase.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4">
        {filteredPhases.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white mb-1 font-outfit">No Matching Steps</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto font-mono">
              Adjust your status filter or search term to view execution steps.
            </p>
          </div>
        ) : (
          filteredPhases.map((phase) => (
            <PhaseView
              key={phase.number}
              phase={phase}
              projectId={project?.id}
              projectPath={project?.path}
              planFiles={project?.planStats?.files || []}
              onOpenArchitect={(filename) => setSelectedPlanFile(filename)}
              onRefresh={onRefresh}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedPlanFile && (
          <FilePreviewDrawer
            projectId={project?.id}
            filename={selectedPlanFile}
            allFiles={project?.planStats?.files || []}
            onSelectFile={(f) => setSelectedPlanFile(f)}
            onClose={() => setSelectedPlanFile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
