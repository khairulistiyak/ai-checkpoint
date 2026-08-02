import React, { useState, useMemo } from 'react';
import ProjectCard from './ProjectCard';
import GitVisualizer from './GitVisualizer';
import ActivityLog from './ActivityLog';
import NotInitializedView from './NotInitializedView';
import PlanProgressTab from './plans/PlanProgressTab';
import PlanFilesTab from './plans/PlanFilesTab';
import FilePreviewDrawer from './plans/FilePreviewDrawer';
import {
  Rocket,
  Sparkles,
  Target,
  Activity,
  Zap,
  Layers,
  FileText,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  Clock,
  Play,
  CheckCircle2,
  ListTodo,
  FileCode,
  Shield,
  Search,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastProvider';

export default function ProjectGrid({
  selectedProject,
  loading,
  installing,
  onRemove,
  onOpenConfig,
  onOpenPlans,
  onInstall,
  refresh,
  liveActivityEntry,
}) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('cockpit'); // 'cockpit' | 'roadmap' | 'generator' | 'files' | 'audit'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhaseNumber, setSelectedPhaseNumber] = useState('all');
  const [copiedCmd, setCopiedCmd] = useState(null);
  const [selectedArchitectFile, setSelectedArchitectFile] = useState(null);

  const { progress, planStats } = selectedProject || {};
  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const allPhases = progress?.phases || [];
  const remaining = Math.max(0, overall.total - overall.completed);
  const activePhases = allPhases.filter((p) => p.percentage > 0 && p.percentage < 100).length;
  const totalPlanSteps = planStats?.totalSteps || overall.total || 0;
  const planFilesList = planStats?.files || [];

  const handleOpenArchitect = (filename) => {
    if (filename) {
      setSelectedArchitectFile(filename);
    } else if (planFilesList.length > 0) {
      const first = typeof planFilesList[0] === 'string' ? planFilesList[0] : planFilesList[0].name;
      setSelectedArchitectFile(first);
    }
  };

  // Filtered phases for the Roadmap tab
  const filteredPhases = useMemo(() => {
    if (!allPhases.length) return [];
    return allPhases
      .filter((phase) => selectedPhaseNumber === 'all' || String(phase.number) === String(selectedPhaseNumber))
      .map((phase) => ({
        ...phase,
        steps: (phase.steps || []).filter((step) => {
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

  const handleCopyCli = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCmd(text);
      showToast(`Copied ${label || text}`, 'info');
      setTimeout(() => setCopiedCmd(null), 2000);
    }
  };

  if (loading || !selectedProject) {
    return (
      <div className="flex flex-col gap-4 min-h-full animate-pulse p-4">
        <div className="h-36 bg-white/5 rounded-3xl border border-white/10" />
        <div className="h-14 bg-white/5 rounded-2xl border border-white/10" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          <div className="h-96 bg-white/5 rounded-3xl border border-white/10" />
          <div className="h-96 bg-white/5 rounded-3xl border border-white/10" />
        </div>
      </div>
    );
  }

  if (!selectedProject.isInstalled) {
    return <NotInitializedView installing={installing} onInstall={onInstall} onRemove={onRemove} />;
  }

  const tabItems = [
    { id: 'cockpit', label: 'Cockpit Overview', icon: Activity, badge: `${overall.percentage}%` },
    { id: 'roadmap', label: 'Roadmap & Steps', icon: ListTodo, badge: `${overall.completed}/${overall.total}` },
    { id: 'files', label: 'Plan Blueprints', icon: FileCode, badge: planStats?.files?.length || 0 },
    { id: 'audit', label: 'Audit & Rules', icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col gap-4 min-h-full w-full">
      {/* 1. Full-Width Executive Studio Workspace Header */}
      <ProjectCard
        project={selectedProject}
        onRemove={onRemove}
        onOpenConfig={onOpenConfig}
        onOpenPlans={onOpenPlans}
        onOpenArchitect={handleOpenArchitect}
      />

      {/* 2. Apple Studio Segmented Workspace Navigation Bar */}
      <div className="bg-[#121215]/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 flex items-center justify-between gap-1.5 overflow-x-auto custom-scrollbar shadow-sm shrink-0">
        <div className="flex items-center gap-1 min-w-max">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                  isActive
                    ? 'text-white bg-white/10 border border-white/20 shadow-sm font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-white/50'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Dynamic Workspace Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'cockpit' && (
          <motion.div
            key="cockpit"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2.5"
          >
            {/* B. Studio 4-Metrics HUD */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* 1. Completion Rate */}
              <div className="bg-[#121215]/90 border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-1.5 shadow-sm hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-white/50 text-xs font-mono">
                  <span>Completion</span>
                  <Target className="w-3.5 h-3.5 text-white/40" />
                </div>
                <div className="text-xl font-bold font-outfit text-white tracking-tight">
                  {overall.percentage}%
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${overall.percentage}%` }}
                  />
                </div>
              </div>

              {/* 2. Steps Executed */}
              <div className="bg-[#121215]/90 border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-1.5 shadow-sm hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-white/50 text-xs font-mono">
                  <span>Steps Done</span>
                  <Activity className="w-3.5 h-3.5 text-white/40" />
                </div>
                <div className="text-xl font-bold font-outfit text-white tracking-tight">
                  {overall.completed} <span className="text-xs font-mono text-white/40 font-normal">/ {overall.total}</span>
                </div>
                <div className="text-[11px] font-mono text-white/40 truncate">
                  {remaining} steps remaining
                </div>
              </div>

              {/* 3. Phase Momentum */}
              <div className="bg-[#121215]/90 border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-1.5 shadow-sm hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-white/50 text-xs font-mono">
                  <span>Phases</span>
                  <Layers className="w-3.5 h-3.5 text-white/40" />
                </div>
                <div className="text-xl font-bold font-outfit text-white tracking-tight">
                  {allPhases.length} <span className="text-xs font-mono text-white/40 font-normal">Total</span>
                </div>
                <div className="text-[11px] font-mono text-white/40 truncate">
                  {activePhases} active • {allPhases.filter((p) => p.percentage === 100).length} completed
                </div>
              </div>

              {/* 4. Plan Specifications */}
              <div
                onClick={() => handleOpenArchitect()}
                className="bg-[#121215]/90 border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-1.5 shadow-sm hover:border-white/30 hover:bg-white/[0.04] transition-all cursor-pointer group"
                title="Click to Open Architectural Blueprint Modal"
              >
                <div className="flex items-center justify-between text-white/50 group-hover:text-white/80 text-xs font-mono transition-colors">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span>Blueprints</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white font-mono">CAD</span>
                  </span>
                  <FileText className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                </div>
                <div className="text-xl font-bold font-outfit text-white tracking-tight">
                  {planStats?.files?.length || 0} <span className="text-xs font-mono text-white/40 font-normal">Files</span>
                </div>
                <div className="text-[11px] font-mono text-white/40 group-hover:text-white/60 truncate transition-colors">
                  {totalPlanSteps} planned steps • Open View →
                </div>
              </div>
            </div>

            {/* C. Dual-Console Studio (Side-by-Side on Desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 items-stretch">
              {/* Left Console: Git Snapshots & Checkpoints */}
              <div className="bg-[#121215]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-white/10 shrink-0">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2 font-outfit">
                    <Rocket className="w-3.5 h-3.5 text-white" />
                    <span>Git Snapshots & Checkpoints</span>
                  </h2>
                  <span className="text-[10px] font-mono text-white/40">
                    Live Rollback Tree
                  </span>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <GitVisualizer projectId={selectedProject.id} onRefresh={refresh} />
                </div>
              </div>

              {/* Right Console: Activity Log Stream & Clear History */}
              <div className="flex flex-col min-h-[400px]">
                <ActivityLog
                  projectId={selectedProject.id}
                  liveEntry={liveActivityEntry}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Roadmap & Step Execution */}
        {activeTab === 'roadmap' && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-[#121215]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-sm min-h-[450px]"
          >
            <PlanProgressTab
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
            />
          </motion.div>
        )}

        {/* Tab 3: Plan Files & Drafts Explorer */}
        {activeTab === 'files' && (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-[#121215]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-sm min-h-[450px]"
          >
            <PlanFilesTab
              project={selectedProject}
            />
          </motion.div>
        )}

        {/* Tab 5: Audit & Rules Inspector */}
        {activeTab === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-[#121215]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-outfit">
                    AI Agent Workflow Conventions & Audit
                  </h3>
                  <p className="text-[11px] text-white/50 font-mono">
                    Zero-token logging, single-step execution, and checkpoint validation rules.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenConfig}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-mono transition-all cursor-pointer"
              >
                Edit Config
              </button>
            </div>

            {/* CLI Commands Reference Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-white/40 font-bold">
                Recommended CLI Workflows
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Start a Step',
                    cmd: './l start X.Y',
                    desc: 'Creates the target file and marks step as running in PROGRESS.md',
                  },
                  {
                    title: 'Complete a Step',
                    cmd: './l c X.Y "implemented feature"',
                    desc: 'Validates code, runs git diff check, and marks step complete',
                  },
                  {
                    title: 'Save Recovery Snapshot',
                    cmd: './l cp save "Checkpoint description"',
                    desc: 'Instantly saves atomic checkpoint snapshot into git ledger',
                  },
                  {
                    title: 'Audit System Health',
                    cmd: './l doctor',
                    desc: 'Runs self-diagnostics on .agents/, PROGRESS.md, and plan/ files',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-white font-outfit mb-1">{item.title}</div>
                      <div className="text-[11px] text-white/50 font-mono">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => handleCopyCli(item.cmd, item.title)}
                      className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/25 text-white text-xs font-mono flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="truncate">{item.cmd}</span>
                      {copiedCmd === item.cmd ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Strict Workflow Principles */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs font-mono text-white/70">
              <div className="text-white font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-white/60" />
                <span>Golden Rules for Autonomous Execution:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-white/50 pl-2">
                <li><strong className="text-white/80">1 step = 1 file:</strong> Finish one step completely before starting the next.</li>
                <li><strong className="text-white/80">Zero token waste:</strong> Background activity logger writes directly to local filesystem.</li>
                <li><strong className="text-white/80">Never skip steps:</strong> Execute incrementally in strictly ordered sequence.</li>
                <li><strong className="text-white/80">Auto-recovery:</strong> Use GitVisualizer or <code className="text-white">./l rollback</code> to restore previous states.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Full-Page Architect Blueprint Modal */}
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
