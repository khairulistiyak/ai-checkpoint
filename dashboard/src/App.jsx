import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectCard from './components/ProjectCard';
import PhaseView from './components/PhaseView';
import ConfigEditor from './components/ConfigEditor';
import GitVisualizer from './components/GitVisualizer';
import MetricsDashboard from './components/MetricsDashboard';
import CommandPalette from './components/CommandPalette';
import LogPanel from './components/LogPanel';
import SettingsModal from './components/SettingsModal';
import ExportButton from './components/ExportButton';
import PlanModal from './components/PlanModal';
import { useProjects } from './hooks/useProjects';
import { Loader2, PlusCircle, Trash2, Rocket, PlaySquare, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './components/ToastProvider';
import * as api from './utils/api';

function App() {
  const { showToast } = useToast();
  const { projects, loading, error, addProject, removeProject, refresh } = useProjects(5000);
  const [selectedId, setSelectedId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [configProject, setConfigProject] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [newProjectPath, setNewProjectPath] = useState('');
  const [installing, setInstalling] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Default selection
  React.useEffect(() => {
    if (projects.length > 0 && !selectedId) {
      setSelectedId(projects[0].id);
    }
  }, [projects, selectedId]);

  const selectedProject = projects.find(p => p.id === selectedId);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjectPath) return;
    try {
      await addProject(newProjectPath);
      setIsAddModalOpen(false);
      setNewProjectPath('');
      showToast('Project added successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveProject = async () => {
    if (confirm('Remove this project from the dashboard?')) {
      await removeProject(selectedId);
      setSelectedId(null);
      showToast('Project removed', 'info');
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-white relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/20 to-accent-900/20" />
        <Loader2 className="w-16 h-16 text-accent-500 animate-spin mb-6 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent animate-pulse">
          Initializing Core Systems...
        </h2>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans relative">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex flex-1 overflow-hidden px-4 md:px-6 pb-14 md:pb-12 gap-6 relative">
        <Sidebar
          projects={projects}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setIsMobileMenuOpen(false);
          }}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onAddProject={() => setIsAddModalOpen(true)}
          onReorder={async (newOrderIds) => {
            try {
              await api.reorderProjects(newOrderIds);
              refresh();
            } catch (err) {
              showToast('Failed to save project order', 'error');
            }
          }}
        />

        <main className="flex-1 overflow-y-auto md:overflow-hidden glass-panel rounded-2xl p-4 md:p-8 relative flex flex-col custom-scrollbar">
          <div className="max-w-5xl mx-auto w-full h-full flex flex-col min-h-max md:min-h-0">
            <AnimatePresence mode="wait">
              {selectedProject ? (
                <motion.div
                  key={selectedProject.id}
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                  className="h-auto md:h-full flex flex-col overflow-visible md:overflow-hidden"
                >
                  <div className="flex-shrink-0">
                    <ProjectCard
                      project={selectedProject}
                      onRemove={handleRemoveProject}
                      onOpenConfig={() => setConfigProject(selectedProject.id)}
                    />
                  </div>

                  {selectedProject.isInstalled ? (
                    <div className="mt-6 flex-1 flex flex-col overflow-visible md:overflow-hidden space-y-6 pb-2">
                      <div className="flex-shrink-0">
                        <MetricsDashboard progress={selectedProject.progress} />
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px] md:min-h-0 pb-16 md:pb-6">
                        {/* Plan Summary Card */}
                        <motion.div 
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          onClick={() => setIsPlanModalOpen(true)}
                          className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/[0.05] hover:border-purple-500/50 rounded-xl p-6 relative cursor-pointer group flex flex-col shadow-lg overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                          <motion.div 
                            className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/20 blur-[50px] rounded-full group-hover:bg-purple-500/30 transition-colors"
                          />
                          <div className="flex items-center justify-between mb-4 relative z-10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                              <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                              >
                                <FileText className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                              </motion.div>
                              Implementation Plan
                            </h2>
                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-all group-hover:translate-x-2" />
                          </div>
                          
                          <p className="text-sm text-slate-400 mb-6 flex-1 relative z-10 leading-relaxed group-hover:text-slate-300 transition-colors">
                            View the detailed step-by-step implementation plan, track current phase progress, and mark tasks as complete.
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto relative z-10 pt-4 border-t border-white/[0.05] group-hover:border-purple-500/30 transition-colors">
                            <span className="text-xs font-mono text-slate-500 group-hover:text-purple-400/70 transition-colors">
                              {selectedProject.progress?.phases?.length || 0} Phases
                            </span>
                            <motion.button 
                              whileHover={{ x: 2 }}
                              className="text-[11px] font-bold text-purple-400 group-hover:text-purple-300 uppercase tracking-wider font-mono flex items-center gap-1"
                            >
                              Open Plan <span className="text-[14px]">→</span>
                            </motion.button>
                          </div>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, type: "spring" }}
                          whileHover={{ scale: 1.01, boxShadow: "0 10px 40px -10px rgba(99, 102, 241, 0.2)" }}
                          className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/[0.05] rounded-xl p-6 relative flex flex-col group overflow-hidden"
                        >
                           <motion.div 
                             className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 blur-[50px] rounded-full group-hover:bg-indigo-500/20 transition-colors"
                           />
                           <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4 relative z-10">
                              <motion.div
                                animate={{ y: [0, -3, 0] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                              >
                                <Rocket className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                              </motion.div>
                              Git History
                           </h2>
                           <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 relative z-10">
                             <GitVisualizer projectId={selectedProject.id} onRefresh={refresh} />
                           </div>
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 p-16 text-center glass-card border-dashed border-slate-600"
                    >
                      <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <Rocket className="w-10 h-10 text-slate-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-200 mb-3 text-glow">Project Not Initialized</h2>
                      <p className="text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
                        This directory doesn't have an initialized ai-checkpoint structure.
                        You can initialize it right here to start tracking progress.
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={async () => {
                            setInstalling(true);
                            try {
                              await api.installProject(selectedProject.id);
                              refresh();
                              showToast('Project initialized successfully!', 'success');
                            } catch (e) {
                              showToast(e.message, 'error');
                            } finally {
                              setInstalling(false);
                            }
                          }}
                          disabled={installing}
                          className="btn-primary flex items-center gap-2 text-sm px-6 py-2"
                        >
                          {installing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlaySquare className="w-4 h-4" />}
                          Initialize Project Here
                        </button>
                        <button
                          onClick={handleRemoveProject}
                          className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 px-4 py-2 rounded-xl transition-colors text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[70vh] text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent-500 blur-3xl opacity-20 rounded-full"></div>
                    <div className="w-32 h-32 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-full flex items-center justify-center mb-8 relative z-10 shadow-2xl">
                      <PlusCircle className="w-12 h-12 text-slate-400" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-white mb-4 tracking-tight">No Project Selected</h2>
                  <p className="text-slate-400 max-w-md text-lg leading-relaxed mb-10">
                    Select a project from the sidebar to view its gorgeous progress tracking, or add a new one.
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Add Project
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isPlanModalOpen && selectedProject && (
          <PlanModal
            project={selectedProject}
            onClose={() => setIsPlanModalOpen(false)}
            onRefresh={refresh}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {configProject && (
          <ConfigEditor
            projectId={configProject}
            onClose={() => setConfigProject(null)}
          />
        )}
      </AnimatePresence>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border-slate-600/50"
          >
            <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Track New Project</h2>
            <form onSubmit={handleAddProject}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                  Absolute Directory Path
                </label>
                <input
                  type="text"
                  value={newProjectPath}
                  onChange={e => setNewProjectPath(e.target.value)}
                  placeholder="/Volumes/SSD/0.1/ai-checkpoint"
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 shadow-inner text-white transition-all"
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {selectedProject && selectedProject.isInstalled && (
        <LogPanel logs={selectedProject.progress?.timeline} />
      )}

      <AnimatePresence>
        {isCommandPaletteOpen && (
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            projects={projects}
            onSelectProject={(id) => {
              setSelectedId(id);
              setIsCommandPaletteOpen(false);
            }}
            onOpenSettings={() => {
              setIsCommandPaletteOpen(false);
              setIsSettingsOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
