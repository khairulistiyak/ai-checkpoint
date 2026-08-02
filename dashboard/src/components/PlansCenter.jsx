import React, { useState, useMemo } from 'react';
import { Activity } from 'lucide-react';
import PlanFilesTab from './plans/PlanFilesTab';
import PlansSidebar from './plans/PlansSidebar';
import PlanProgressTab from './plans/PlanProgressTab';

export default function PlansCenter({
  project,
  onBack,
  onRefresh,
  initialTab,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'progress');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhaseNumber, setSelectedPhaseNumber] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const allPhases = project?.progress?.phases || [];
  const totalSteps = project?.progress?.overall?.total || 0;
  const completedSteps = project?.progress?.overall?.completed || 0;
  const percentage = project?.progress?.overall?.percentage || 0;
  const filesCount = project?.planStats?.files?.length || 0;

  const filteredPhases = useMemo(() => {
    if (!allPhases.length) return [];
    return allPhases
      .filter((phase) => selectedPhaseNumber === 'all' || String(phase.number) === String(selectedPhaseNumber))
      .map((phase) => ({
        ...phase,
        steps: phase.steps.filter((step) => {
          const matchStatus = statusFilter === 'all' || step.status === statusFilter;
          const matchSearch =
            !searchQuery ||
            step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(step.number).includes(searchQuery);
          return matchStatus && matchSearch;
        }),
      }))
      .filter((phase) => phase.steps.length > 0);
  }, [allPhases, selectedPhaseNumber, statusFilter, searchQuery]);

  if (!project) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#09090b] text-zinc-500 font-mono text-xs">
        No project selected.
      </div>
    );
  }

  return (
    <div className="h-full w-full flex overflow-hidden bg-[#09090b] text-zinc-100">
      <PlansSidebar
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={onBack}
        onRefresh={handleRefreshClick}
        isRefreshing={isRefreshing}
        percentage={percentage}
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        filesCount={filesCount}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        {activeTab === 'progress' && (
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
        )}

        {activeTab === 'files' && (
          <PlanFilesTab project={project} />
        )}
      </main>
    </div>
  );
}
