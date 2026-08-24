import React, { useState } from 'react';
import { ListTodo, FileCode } from 'lucide-react';
import PlanProgressTab from './PlanProgressTab';
import PlanFilesTab from './PlanFilesTab';

export default function UnifiedPlansTab({
  project,
  allPhases,
  filteredPhases,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  selectedPhaseNumber,
  setSelectedPhaseNumber,
  onRefresh,
  initialSubTab = 'roadmap'
}) {
  const [subTab, setSubTab] = useState(initialSubTab);
  const filesCount = project?.planStats?.files?.length || 0;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Segmented Sub-Navigation Switcher */}
      <div className="px-4 py-2.5 border-b border-white/10 bg-black/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-xl">
          <button
            onClick={() => setSubTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'roadmap'
                ? 'bg-white/15 text-white border border-white/20 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Execution Roadmap</span>
          </button>

          <button
            onClick={() => setSubTab('blueprints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'blueprints'
                ? 'bg-white/15 text-white border border-white/20 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Blueprint Specifications</span>
            {filesCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300">
                {filesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Tab View */}
      <div className="flex-1 flex flex-col min-h-0">
        {subTab === 'roadmap' ? (
          <PlanProgressTab
            project={project}
            allPhases={allPhases}
            filteredPhases={filteredPhases}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedPhaseNumber={selectedPhaseNumber}
            setSelectedPhaseNumber={setSelectedPhaseNumber}
            onRefresh={onRefresh}
          />
        ) : (
          <PlanFilesTab project={project} />
        )}
      </div>
    </div>
  );
}
