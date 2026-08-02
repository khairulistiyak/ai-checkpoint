import React, { useState } from 'react';
import { Search, Layers, Activity, Rocket } from 'lucide-react';
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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] relative overflow-hidden">
      <div className="p-4 md:px-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-black/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search steps or phases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/20 w-56 font-mono transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
            {['all', 'pending', 'in_progress', 'done'].map((status) => {
              const labels = { all: 'All', pending: 'Pending', in_progress: 'Active', done: 'Done' };
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    active ? 'bg-white/10 text-white border border-white/25 font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {labels[status]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-white/50">Phase:</span>
          <select
            value={selectedPhaseNumber}
            onChange={(e) => setSelectedPhaseNumber(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/20"
          >
            <option value="all" className="bg-[#121214]">All Phases</option>
            {allPhases.map((phase) => (
              <option key={phase.number} value={phase.number} className="bg-[#121214]">
                Phase {phase.number}: {phase.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {filteredPhases.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <Activity className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Matching Steps Found</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto font-mono">
              Try adjusting your search query or status filters to view execution steps.
            </p>
          </div>
        ) : (
          filteredPhases.map((phase) => (
            <PhaseView
              key={phase.number}
              phase={phase}
              projectId={project?.id}
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
