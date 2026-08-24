import React, { useState, useMemo } from 'react';
import { Search, Activity, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PhaseView from '../PhaseView';
import FilePreviewDrawer from './FilePreviewDrawer';
import ActiveStepBanner from './ActiveStepBanner';
import { isStepDone, isStepActive } from '../../utils/date-formatter';

export default function PlanProgressTab({
  project,
  allPhases = [],
  filteredPhases = [],
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
        if (isStepDone(s)) done++;
        else if (isStepActive(s)) active++;
        else pending++;
      }
    }
    return { total, done, active, pending };
  }, [allPhases]);

  const sortedPhases = useMemo(() => (
    [...allPhases].sort((a, b) => (parseInt(b.number, 10) || 0) - (parseInt(a.number, 10) || 0))
  ), [allPhases]);

  const activeStep = useMemo(() => {
    for (const p of allPhases) {
      for (const s of (p.steps || [])) {
        if (isStepActive(s)) return { ...s, phaseNumber: p.number, phaseName: p.name || p.title };
      }
    }
    return null;
  }, [allPhases]);

  const filters = [
    { id: 'all', label: 'All', count: counts.total },
    { id: 'done', label: 'Done', count: counts.done, color: 'text-emerald-400' },
    { id: 'in_progress', label: 'Active', count: counts.active, color: 'text-amber-400' },
    { id: 'pending', label: 'Pending', count: counts.pending, color: 'text-zinc-400' }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] relative overflow-hidden">
      {/* Toolbar */}
      <div className="p-3 sm:px-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2.5 bg-[#0e0e11]/80 backdrop-blur-md shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search steps & files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/20 w-44 sm:w-56 font-mono transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1">
            {filters.map(item => (
              <button
                key={item.id}
                onClick={() => setStatusFilter(item.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  statusFilter === item.id
                    ? 'bg-white/[0.10] text-white border border-white/[0.15] font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-[10px] font-mono px-1 rounded bg-black/40 ${item.color || 'text-zinc-400'}`}>
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
            className="bg-[#121214] border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-white/20 cursor-pointer"
          >
            <option value="all">All Phases ({allPhases.length})</option>
            {sortedPhases.map((phase) => (
              <option key={phase.number} value={phase.number}>
                Phase {phase.number}: {phase.name || phase.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ActiveStepBanner activeStep={activeStep} />

      {/* Phase List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-4 space-y-2.5 pb-16">
        {filteredPhases.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-2xl bg-white/[0.01]">
            <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white mb-1 font-outfit">No Matching Steps Found</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto font-mono">Adjust your status filter or search keyword to view execution steps.</p>
          </div>
        ) : (
          filteredPhases.map((phase, idx) => (
            <PhaseView
              key={phase.number || idx}
              phase={phase}
              index={idx}
              projectId={project?.id}
              projectPath={project?.path}
              hasPlanFiles={project?.hasPlanFiles}
              planFiles={project?.planStats?.files || []}
              onOpenArchitect={(fn) => setSelectedPlanFile(fn)}
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
