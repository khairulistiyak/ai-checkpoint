import React from 'react';
import { ArrowLeft, Rocket, Activity, CheckCircle2, ChevronRight, ShieldCheck, RefreshCw, FolderOpen, Sparkles } from 'lucide-react';

export default function PlansSidebar({
  project,
  activeTab,
  setActiveTab,
  onBack,
  onRefresh,
  isRefreshing,
  percentage,
  completedSteps,
  totalSteps,
  filesCount
}) {
  const tabs = [
    {
      id: 'progress',
      label: 'Progress Tracker',
      subtitle: 'Phases & steps ledger',
      icon: Activity,
      badge: `${percentage}%`
    },
    {
      id: 'files',
      label: 'Architectural Plans',
      subtitle: 'Spec & plan docs',
      icon: FolderOpen,
      badge: `${filesCount}`
    },
    {
      id: 'generate',
      label: 'Plan Builder',
      subtitle: 'Create spec AI tier',
      icon: Sparkles,
      badge: 'PRO'
    }
  ];

  return (
    <aside className="w-80 border-r border-white/10 flex flex-col bg-[#0a0e17] shrink-0 select-none">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase bg-white/5 text-white/70 px-1.5 py-0.5 rounded border border-white/10">
                STUDIO v2.0
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <h1 className="text-base font-bold text-white font-outfit truncate mt-0.5" title={project?.name}>
              {project?.name || 'Project Plans'}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        <div className="px-2 py-1 text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">
          EXECUTION MODULES
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left p-3.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 border transition-all duration-200 group relative ${
                isSelected
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {isSelected && <div className="absolute left-0 top-2 bottom-2 w-1 bg-sky-400 rounded-r-full" />}

              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg border shrink-0 transition-all ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                    : 'bg-white/5 border-white/10 text-white/50 group-hover:text-white'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-semibold font-outfit truncate ${isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                    {tab.label}
                  </span>
                  <span className="text-[11px] font-mono text-white/40 truncate">
                    {tab.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                  isSelected ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30' : 'bg-white/5 text-white/50'
                }`}>
                  {tab.badge}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-sky-400 translate-x-0.5' : 'text-white/20 opacity-0 group-hover:opacity-100'}`} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20 space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/50">Plan Progress</span>
            <span className="text-white font-bold">{percentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-0.5">
            <span>{completedSteps}/{totalSteps} tasks</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Ready
            </span>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>{isRefreshing ? 'Syncing Ledger...' : 'Sync Checkpoint State'}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
