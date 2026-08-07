import React, { useState, useMemo } from 'react';
import ProjectCard from './ProjectCard';
import NotInitializedView from './NotInitializedView';
import CockpitTab from './CockpitTab';
import PlanProgressTab from './plans/PlanProgressTab';
import PlanFilesTab from './plans/PlanFilesTab';
import ProjectRunPanel from './runs/ProjectRunPanel';
import AuditRulesTab from './AuditRulesTab';
import HealthCommandCenter from './HealthCommandCenter';
import FilePreviewDrawer from './plans/FilePreviewDrawer';
import ProjectTabBar from './ProjectTabBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectGrid({
  selectedProject,
  loading,
  installing,
  onRemove,
  onOpenConfig,
  onOpenPlans,
  onInstall,
  refresh,
  liveActivityEntry
}) {
  const [activeTab, setActiveTab] = useState('cockpit');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhaseNumber, setSelectedPhaseNumber] = useState('all');
  const [selectedArchitectFile, setSelectedArchitectFile] = useState(null);

  const { progress, planStats } = selectedProject || {};
  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const allPhases = progress?.phases || [];
  const remaining = Math.max(0, overall.total - overall.completed);
  const activePhases = allPhases.filter(p => p.percentage > 0 && p.percentage < 100).length;
  const totalPlanSteps = planStats?.totalSteps || overall.total || 0;
  const planFilesList = planStats?.files || [];

  const handleOpenArchitect = (filename) => {
    if (filename) setSelectedArchitectFile(filename);
    else if (planFilesList.length > 0) {
      const first = typeof planFilesList[0] === 'string' ? planFilesList[0] : planFilesList[0].name;
      setSelectedArchitectFile(first);
    }
  };

  const filteredPhases = useMemo(() => {
    if (!allPhases.length) return [];
    return allPhases
      .filter(phase => selectedPhaseNumber === 'all' || String(phase.number) === String(selectedPhaseNumber))
      .map(phase => ({
        ...phase,
        steps: (phase.steps || []).filter(step => {
          const matchStatus = statusFilter === 'all' || step.status === statusFilter;
          const matchSearch = !searchQuery || step.title.toLowerCase().includes(searchQuery.toLowerCase()) || String(step.number).includes(searchQuery);
          return matchStatus && matchSearch;
        })
      }))
      .filter(phase => phase.steps.length > 0);
  }, [allPhases, selectedPhaseNumber, statusFilter, searchQuery]);

  if (loading || !selectedProject) {
    return (
      <div className="flex flex-col gap-4 min-h-full animate-pulse p-4">
        <div className="h-36 bg-white/5 rounded-3xl border border-white/10" />
        <div className="h-14 bg-white/5 rounded-2xl border border-white/10" />
      </div>
    );
  }

  if (!selectedProject.isInstalled) {
    return <NotInitializedView installing={installing} onInstall={onInstall} onRemove={onRemove} />;
  }

  return (
    <div className="flex flex-col gap-4 min-h-full w-full">
      <ProjectCard project={selectedProject} onRemove={onRemove} onOpenConfig={onOpenConfig} onOpenPlans={onOpenPlans} onOpenArchitect={handleOpenArchitect} />

      <ProjectTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overall={overall}
        planStats={planStats}
        healthScore={selectedProject?.health?.score}
      />

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

      <AnimatePresence>
        {selectedArchitectFile && (
          <FilePreviewDrawer projectId={selectedProject.id} filename={selectedArchitectFile} allFiles={planFilesList} onSelectFile={(f) => setSelectedArchitectFile(f)} onClose={() => setSelectedArchitectFile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
