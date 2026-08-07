import React from 'react';
import PlanPhaseList from '../plan/PlanPhaseList';
import PlanSpecHeader from './PlanSpecHeader';
import PlanSpecTopology from './PlanSpecTopology';
import { useArchitecturalPlan } from './useArchitecturalPlan';
import { formatTextWithBadges, formatCodeWithTheme } from './plan-formatters';

export default function ArchitecturalPlanViewer({ content, filename }) {
  const {
    title, modules, stats, percentage, targetFiles, filteredModules,
    copiedCodeIndex, activeModuleIndex, filterType, setFilterType,
    searchQuery, setSearchQuery, collapsedModules, setCollapsedModules,
    copiedSpec, copiedStepBadge, copiedFilePath, setCopiedFilePath,
    toggleCollapse, copySnippet, copyStepCommand, copyFullSpecAsPrompt,
    scrollToModule, generateStepPrompt
  } = useArchitecturalPlan({ content, filename });

  return (
    <div className="space-y-6 pb-16 font-outfit text-white/90 relative">
      <PlanSpecHeader
        title={title}
        stats={stats}
        percentage={percentage}
        copyFullSpecAsPrompt={copyFullSpecAsPrompt}
        copiedSpec={copiedSpec}
        targetFiles={targetFiles}
        copiedFilePath={copiedFilePath}
        setCopiedFilePath={setCopiedFilePath}
      />

      <PlanSpecTopology
        modules={modules}
        collapsedModules={collapsedModules}
        setCollapsedModules={setCollapsedModules}
        activeModuleIndex={activeModuleIndex}
        scrollToModule={scrollToModule}
        filterType={filterType}
        setFilterType={setFilterType}
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <PlanPhaseList
        filteredModules={filteredModules}
        collapsedModules={collapsedModules}
        toggleCollapse={toggleCollapse}
        copiedStepBadge={copiedStepBadge}
        copyStepCommand={copyStepCommand}
        generateStepPrompt={generateStepPrompt}
        copiedCodeIndex={copiedCodeIndex}
        copySnippet={copySnippet}
        formatTextWithBadges={formatTextWithBadges}
        formatCodeWithTheme={formatCodeWithTheme}
      />
    </div>
  );
}
