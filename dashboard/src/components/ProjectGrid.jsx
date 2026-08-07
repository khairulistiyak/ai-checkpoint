import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
import NotInitializedView from './NotInitializedView';
import FilePreviewDrawer from './plans/FilePreviewDrawer';
import ProjectTabBar from './ProjectTabBar';
import DeveloperActionDock from './DeveloperActionDock';
import QuickTerminalDrawer from './QuickTerminalDrawer';
import ProjectTabsContent from './ProjectTabsContent';

export default function ProjectGrid({
  selectedProject, loading, installing, onRemove, onOpenConfig,
  onOpenPlans, onInstall, refresh, liveActivityEntry
}) {
  const [activeTab, setActiveTab] = useState('cockpit');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhaseNumber, setSelectedPhaseNumber] = useState('all');
  const [selectedArchitectFile, setSelectedArchitectFile] = useState(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const { progress, planStats } = selectedProject || {};
  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const allPhases = progress?.phases || [];
  const remaining = Math.max(0, overall.total - overall.completed);
  const activePhases = allPhases.filter(p => p.percentage > 0 && p.percentage < 100).length;
  const totalPlanSteps = planStats?.totalSteps || overall.total || 0;
  const planFilesList = planStats?.files || [];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { runningStep, nextStep } = useMemo(() => {
    let running = null;
    let next = null;
    for (const phase of allPhases) {
      for (const step of (phase.steps || [])) {
        if (step.status === 'running' && !running) {
          running = { ...step, phaseNumber: phase.number, phaseName: phase.name };
        } else if (step.status === 'pending' && !next) {
          next = { ...step, phaseNumber: phase.number, phaseName: phase.name };
        }
        if (running && next) break;
      }
      if (running && next) break;
    }
    return { runningStep: running, nextStep: next };
  }, [allPhases]);

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
      .filter(p => selectedPhaseNumber === 'all' || String(p.number) === String(selectedPhaseNumber))
      .map(p => ({
        ...p,
        steps: (p.steps || []).filter(step => {
          const matchStatus = statusFilter === 'all' || step.status === statusFilter;
          const matchSearch = !searchQuery || step.title.toLowerCase().includes(searchQuery.toLowerCase()) || String(step.number).includes(searchQuery);
          return matchStatus && matchSearch;
        })
      }))
      .filter(p => p.steps.length > 0);
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
    <div className="flex flex-col gap-4 min-h-full w-full pb-20">
      <ProjectCard project={selectedProject} onRemove={onRemove} onOpenConfig={onOpenConfig} onOpenPlans={onOpenPlans} onOpenArchitect={handleOpenArchitect} />

      <ProjectTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overall={overall}
        planStats={planStats}
        healthScore={selectedProject?.health?.score}
      />

      <ProjectTabsContent
        activeTab={activeTab}
        selectedProject={selectedProject}
        overall={overall}
        allPhases={allPhases}
        activePhases={activePhases}
        remaining={remaining}
        planStats={planStats}
        totalPlanSteps={totalPlanSteps}
        handleOpenArchitect={handleOpenArchitect}
        refresh={refresh}
        liveActivityEntry={liveActivityEntry}
        filteredPhases={filteredPhases}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPhaseNumber={selectedPhaseNumber}
        setSelectedPhaseNumber={setSelectedPhaseNumber}
        onOpenConfig={onOpenConfig}
      />

      <DeveloperActionDock
        project={selectedProject}
        nextStep={nextStep}
        runningStep={runningStep}
        onRefresh={refresh}
        onToggleTerminal={() => setIsTerminalOpen(prev => !prev)}
        isTerminalOpen={isTerminalOpen}
      />

      <AnimatePresence>
        {isTerminalOpen && (
          <QuickTerminalDrawer
            isOpen={isTerminalOpen}
            onClose={() => setIsTerminalOpen(false)}
            projectId={selectedProject.id}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedArchitectFile && (
          <FilePreviewDrawer
            projectId={selectedProject.id}
            filename={selectedArchitectFile}
            allFiles={planFilesList}
            onSelectFile={(f) => setSelectedArchitectFile(f)}
            onClose={() => setSelectedArchitectFile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
