import React from 'react';
import { ArrowLeft, Activity, ChevronRight, ShieldCheck, RefreshCw, FolderOpen } from 'lucide-react';

export default function PlansSidebar({
  project, activeTab, setActiveTab, onBack, onRefresh, isRefreshing,
  percentage, completedSteps, totalSteps, filesCount
}) {
  const tabs = [
    { id: 'progress', label: 'Progress Tracker', subtitle: 'Phases & steps ledger', icon: Activity, badge: `${percentage}%` },
    { id: 'files', label: 'Architectural Plans', subtitle: 'Spec & plan docs', icon: FolderOpen, badge: `${filesCount}` },
  ];

  return (
    <aside className="w-80 border-r border-white/10 flex flex-col bg-[#09090b] shrink-0 select-none">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all shrink-0"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase bg-white/[0.04] text-zinc-400 px-1.5 py-0.5 rounded border border-white/10 font-bold">STUDIO v2.0</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <h1 className="text-base font-bold text-white font-outfit truncate mt-0.5" title={project?.name}>
              {project?.name || 'Project Plans'}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">EXECUTION MODULES</div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between gap-3 border transition-all duration-200 group ${
                isSelected ? 'bg-white/[0.08] border-white/20 text-white shadow-lg' : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl border shrink-0 ${isSelected ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.03] border-white/10 text-zinc-400 group-hover:text-white'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-semibold font-outfit truncate ${isSelected ? 'text-white font-bold' : 'text-zinc-300 group-hover:text-white'}`}>{tab.label}</span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate">{tab.subtitle}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isSelected ? 'bg-white/10 text-white border border-white/20' : 'bg-white/[0.03] text-zinc-500 border border-white/10'}`}>{tab.badge}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-zinc-500 opacity-0 group-hover:opacity-100'}`} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10 bg-[#09090b] space-y-3">
        <div className="p-3.5 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Plan Progress</span>
            <span className="text-white font-bold">{percentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-0.5">
            <span>{completedSteps}/{totalSteps} tasks</span>
            <span className="flex items-center gap-1 text-zinc-300 font-semibold"><ShieldCheck className="w-3 h-3 text-white" /> Ready</span>
          </div>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all font-bold disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
            <span>{isRefreshing ? 'Syncing Ledger...' : 'Sync Checkpoint State'}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
