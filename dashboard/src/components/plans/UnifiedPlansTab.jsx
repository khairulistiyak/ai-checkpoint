import React, { useState } from 'react';
import { ListTodo, FileCode2 } from 'lucide-react';
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
  const filesCount = project?.planStats?.totalFiles ?? project?.planStats?.files?.length ?? 0;

  return (
    <div className="flex flex-col min-h-0 flex-1 bg-[#09090b]">
      {/* Segmented Sub-Navigation Switcher */}
      <div className="px-4 py-2 border-b border-white/[0.06] bg-[#0c0c0e]/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <button
            onClick={() => setSubTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'roadmap'
                ? 'bg-white/[0.08] text-white border border-white/[0.12] font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Execution Roadmap</span>
          </button>

          <button
            onClick={() => setSubTab('blueprints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'blueprints'
                ? 'bg-white/[0.08] text-white border border-white/[0.12] font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Blueprint Specifications</span>
            {filesCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-zinc-300">
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
