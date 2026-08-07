import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CockpitTab from './CockpitTab';
import PlanProgressTab from './plans/PlanProgressTab';
import PlanFilesTab from './plans/PlanFilesTab';
import ProjectRunPanel from './runs/ProjectRunPanel';
import AuditRulesTab from './AuditRulesTab';
import HealthCommandCenter from './HealthCommandCenter';

export default function ProjectTabsContent({
  activeTab,
  selectedProject,
  overall,
  allPhases,
  activePhases,
  remaining,
  planStats,
  totalPlanSteps,
  handleOpenArchitect,
  refresh,
  liveActivityEntry,
  filteredPhases,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  selectedPhaseNumber,
  setSelectedPhaseNumber,
  onOpenConfig
}) {
  return (
    <AnimatePresence mode="wait">
      {activeTab === 'cockpit' && (
        <motion.div key="cockpit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          <CockpitTab selectedProject={selectedProject} overall={overall} allPhases={allPhases} activePhases={activePhases} remaining={remaining} planStats={planStats} totalPlanSteps={totalPlanSteps} handleOpenArchitect={handleOpenArchitect} refresh={refresh} liveActivityEntry={liveActivityEntry} />
        </motion.div>
      )}
      {activeTab === 'roadmap' && (
        <motion.div key="roadmap" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-3 sm:p-4 shadow-sm min-h-[450px]">
          <PlanProgressTab project={selectedProject} allPhases={allPhases} filteredPhases={filteredPhases} statusFilter={statusFilter} setStatusFilter={setStatusFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedPhaseNumber={selectedPhaseNumber} setSelectedPhaseNumber={setSelectedPhaseNumber} onRefresh={refresh} />
        </motion.div>
      )}
      {activeTab === 'files' && (
        <motion.div key="files" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-3 sm:p-4 shadow-sm min-h-[450px]">
          <PlanFilesTab project={selectedProject} />
        </motion.div>
      )}
      {activeTab === 'commands' && (
        <motion.div key="commands" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-2 sm:p-4 shadow-sm min-h-[450px] flex flex-col">
          <ProjectRunPanel project={selectedProject} />
        </motion.div>
      )}
      {activeTab === 'audit' && (
        <motion.div key="audit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <AuditRulesTab onOpenConfig={onOpenConfig} />
        </motion.div>
      )}
      {activeTab === 'health' && (
        <motion.div key="health" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-2 sm:p-4 shadow-sm min-h-[450px]">
          <HealthCommandCenter projectId={selectedProject.id} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
