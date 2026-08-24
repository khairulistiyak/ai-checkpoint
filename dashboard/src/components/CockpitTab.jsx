import React, { useState, useMemo } from 'react';
import { Rocket } from 'lucide-react';
import CockpitHealthOverview from './cockpit/CockpitHealthOverview';
import CockpitKpiCards from './cockpit/CockpitKpiCards';
import IntelligenceModal from './intelligence/IntelligenceModal';
import ActiveStepBanner from './plans/ActiveStepBanner';

export default function CockpitTab({
  selectedProject, overall, allPhases, activePhases, remaining, planStats, totalPlanSteps, handleOpenArchitect, refresh, onSelectTab
}) {
  const [isIntelligenceModalOpen, setIsIntelligenceModalOpen] = useState(false);
  const unsyncedSteps = selectedProject?.unsyncedSteps || 0;
  const hasNoSteps = totalPlanSteps === 0 && allPhases.length === 0;

  const activeStep = useMemo(() => {
    for (const p of allPhases) {
      for (const s of (p.steps || [])) {
        if (s.status === 'running' || s.status === 'in_progress') {
          return { ...s, phaseNumber: p.number, phaseName: p.name || p.title };
        }
      }
    }
    return null;
  }, [allPhases]);

  return (
    <div className="flex flex-col gap-3">
      <ActiveStepBanner activeStep={activeStep} />

      {hasNoSteps && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-outfit">Create your first plan file</h3>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Add a markdown plan file (e.g. <code className="text-sky-300">plan/phase-1.md</code>) to get started with execution tracking.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab ? onSelectTab('files') : handleOpenArchitect()}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-outfit transition-all shrink-0 cursor-pointer"
          >
            Open Plan Blueprints →
          </button>
        </div>
      )}

      <CockpitKpiCards
        overall={overall}
        remaining={remaining}
        allPhases={allPhases}
        activePhases={activePhases}
        planStats={planStats}
        totalPlanSteps={totalPlanSteps}
        onOpenArchitect={() => onSelectTab ? onSelectTab('files') : handleOpenArchitect()}
      />

      {unsyncedSteps > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-amber-400 text-sm">⚠</span>
          <div>
            <span className="text-xs font-bold text-amber-300 font-outfit">
              {unsyncedSteps} plan step{unsyncedSteps > 1 ? 's' : ''} not synced to Roadmap & Steps
            </span>
            <p className="text-[11px] text-amber-400/70 font-mono mt-0.5">
              Run <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300">./l sync</code> or save plan to update execution ledger
            </p>
          </div>
        </div>
      )}

      <CockpitHealthOverview projectId={selectedProject.id} onOpenIntelligence={() => setIsIntelligenceModalOpen(true)} />

      <IntelligenceModal 
        isOpen={isIntelligenceModalOpen} 
        onClose={() => setIsIntelligenceModalOpen(false)} 
        project={selectedProject} 
      />
    </div>
  );
}
