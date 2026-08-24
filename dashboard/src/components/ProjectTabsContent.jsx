import React from 'react';
import CockpitTab from './CockpitTab';
import UnifiedPlansTab from './plans/UnifiedPlansTab';
import ProjectRunPanel from './runs/ProjectRunPanel';

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
  onOpenConfig,
  setActiveTab
}) {
  const isPlansTab = activeTab === 'plans' || activeTab === 'roadmap' || activeTab === 'files';

  return (
    <div className="relative min-h-[28rem]">
      {/* 1. Cockpit Overview Tab */}
      <div className={activeTab === 'cockpit' ? 'block animate-fadeIn' : 'hidden'}>
        <CockpitTab
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
          onSelectTab={setActiveTab}
        />
      </div>

      {/* 2. Unified Plans & Blueprints Tab */}
      <div className={isPlansTab ? 'block bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-3 sm:p-4 shadow-sm min-h-[28rem] animate-fadeIn' : 'hidden'}>
        <UnifiedPlansTab
          project={selectedProject}
          allPhases={allPhases}
          filteredPhases={filteredPhases}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedPhaseNumber={selectedPhaseNumber}
          setSelectedPhaseNumber={setSelectedPhaseNumber}
          onRefresh={refresh}
          initialSubTab={activeTab === 'files' ? 'blueprints' : 'roadmap'}
        />
      </div>

      {/* 3. Workflows & CLI Run Panel Tab */}
      <div className={activeTab === 'commands' ? 'block bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-2 sm:p-4 shadow-sm min-h-[28rem] flex flex-col animate-fadeIn' : 'hidden'}>
        <ProjectRunPanel project={selectedProject} onOpenConfig={onOpenConfig} />
      </div>
    </div>
  );
}
