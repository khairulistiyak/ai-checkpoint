import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Rocket, Activity, CheckCircle2, Loader2, Circle, AlertTriangle, FolderOpen, Sparkles, Search } from 'lucide-react';
import PhaseView from './PhaseView';
import { GlassButton } from './ui/GlassButton';
import { InputField } from './ui/InputField';
import MetricsStrip from './plans/MetricsStrip';
import PlanFilesTab from './plans/PlanFilesTab';
import PlanGeneratorTab from './plans/PlanGeneratorTab';

export default function PlansCenter({ project, onBack, onRefresh, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'progress');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPhases = useMemo(() => {
    if (!project?.progress?.phases) return [];
    return project.progress.phases
      .map(phase => ({
        ...phase,
        steps: phase.steps.filter(step => {
          const matchStatus = statusFilter === 'all' || step.status === statusFilter;
          const matchSearch = !searchQuery || step.title.toLowerCase().includes(searchQuery.toLowerCase()) || step.number.includes(searchQuery);
          return matchStatus && matchSearch;
        })
      }))
      .filter(phase => statusFilter === 'all' ? true : phase.steps.length > 0);
  }, [project?.progress?.phases, statusFilter, searchQuery]);

  const totalSteps = project?.progress?.overall?.total || 0;
  const shownSteps = filteredPhases.reduce((sum, p) => sum + p.steps.length, 0);

  if (!project) return null;

  const tabs = [
    { id: 'progress', label: 'Step Progress', icon: Activity },
    { id: 'files', label: 'Plan Files', icon: FolderOpen },
    { id: 'generate', label: 'Plan Generator', icon: Sparkles },
  ];

  const filters = [
    { id: 'all', label: 'All', icon: null },
    { id: 'done', label: 'Done', icon: CheckCircle2 },
    { id: 'running', label: 'Active', icon: Loader2 },
    { id: 'pending', label: 'Pending', icon: Circle },
    { id: 'blocked', label: 'Blocked', icon: AlertTriangle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, type: 'spring' }}
      className="h-full w-full flex flex-col overflow-hidden bg-cyber-dark/80 backdrop-blur-xl"
    >
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-cyber-card-border/40 bg-cyber-card/40 flex items-center justify-between shrink-0 relative">
        <div className="flex items-center gap-3">
          <GlassButton variant="secondary" size="sm" onClick={onBack} className="flex items-center gap-1.5 font-mono">
            <ArrowLeft className="w-3.5 h-3.5" /> <span>Back</span>
          </GlassButton>
          <div className="h-4 w-[1px] bg-cyber-card-border/50 mx-1 hidden sm:block" />
          <h1 className="text-base font-bold text-cyber-text-primary flex items-center gap-2 font-outfit">
            <Rocket className="w-4 h-4 text-cyber-accent" />
            Plans Center
          </h1>
        </div>
        <span className="flex items-center gap-2 px-3 py-1 bg-cyber-accent/10 border border-cyber-accent/30 rounded-lg text-xs font-mono text-cyber-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent animate-pulse" />
          {project.name}
        </span>
      </div>

      {/* Metrics HUD */}
      <MetricsStrip project={project} />

      {/* Navigation Toolbar */}
      <div className="px-6 py-2.5 border-b border-cyber-card-border/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-black/40">
        <div className="flex items-center gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <GlassButton
                key={tab.id}
                active={isSelected}
                onClick={() => setActiveTab(tab.id)}
                size="sm"
                variant={isSelected ? 'primary' : 'secondary'}
                className="flex items-center gap-1.5 font-mono"
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyber-accent' : ''}`} />
                {tab.label}
              </GlassButton>
            );
          })}
        </div>

        {activeTab === 'progress' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-44">
              <InputField placeholder="Search steps..." icon={Search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-1">
              {filters.map(f => {
                const FIcon = f.icon;
                return (
                  <GlassButton key={f.id} active={statusFilter === f.id} onClick={() => setStatusFilter(f.id)} size="xs" className="flex items-center gap-1 font-mono">
                    {FIcon && <FIcon className="w-3 h-3" />} {f.label}
                  </GlassButton>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Workspace */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait">
          {activeTab === 'progress' && (
            <motion.div key="tab-progress" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {(statusFilter !== 'all' || searchQuery) && (
                <div className="flex items-center justify-between mb-4 px-1">
                  <p className="text-xs font-mono text-cyber-text-secondary">Filtering: <strong className="text-cyber-accent">{shownSteps}</strong> of {totalSteps} steps</p>
                  <GlassButton size="xs" variant="ghost" onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}>Reset Filters</GlassButton>
                </div>
              )}
              <div className="max-w-4xl mx-auto space-y-4">
                {filteredPhases.length > 0 ? (
                  filteredPhases.map((phase, idx) => (
                    <PhaseView key={phase.number} phase={phase} isActive={phase.percentage > 0 && phase.percentage < 100} index={idx} projectId={project.id} hasPlanFiles={project.hasPlanFiles} onRefresh={onRefresh} />
                  ))
                ) : (
                  <div className="text-center py-16 text-cyber-text-muted italic bg-cyber-card/30 rounded-2xl border border-cyber-card-border/40">
                    {statusFilter !== 'all' || searchQuery ? 'No steps match your criteria.' : 'No plan phases configured.'}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div key="tab-files" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex-1 overflow-hidden flex flex-col">
              <PlanFilesTab project={project} onSwitchToGenerate={() => setActiveTab('generate')} />
            </motion.div>
          )}

          {activeTab === 'generate' && (
            <motion.div key="tab-generate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex-1 overflow-hidden flex flex-col">
              <PlanGeneratorTab project={project} onRefresh={onRefresh} onSwitchToFiles={() => setActiveTab('files')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
