import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectCard from './components/ProjectCard';
import PhaseView from './components/PhaseView';
import ConfigEditor from './components/ConfigEditor';
import GitVisualizer from './components/GitVisualizer';
import MetricsDashboard from './components/MetricsDashboard';
import { useProjects } from './hooks/useProjects';
import { Loader2, PlusCircle, Trash2, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from './utils/api';

function App() {
  const { projects, loading, error, addProject, removeProject, refresh } = useProjects(5000);
  const [selectedId, setSelectedId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [configProject, setConfigProject] = useState(null);
  const [newProjectPath, setNewProjectPath] = useState('');

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
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveProject = async () => {
    if (confirm('Remove this project from the dashboard?')) {
      await removeProject(selectedId);
      setSelectedId(null);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/20 to-fuchsia-900/20" />
        <Loader2 className="w-16 h-16 text-fuchsia-500 animate-spin mb-6 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-pulse">
          Initializing Core Systems...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <Header onOpenSettings={() => {}} />
      
      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-6">
        <Sidebar 
          projects={projects} 
          selectedId={selectedId} 
          onSelect={setSelectedId} 
          onAddProject={() => setIsAddModalOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto glass-panel rounded-2xl p-8 relative scroll-smooth">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {selectedProject ? (
                <motion.div 
                  key={selectedProject.id}
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                >
                  <ProjectCard 
                    project={selectedProject} 
                    onRemove={handleRemoveProject} 
                    onOpenConfig={() => setConfigProject(selectedProject.id)}
                  />
                  
                  {selectedProject.isInstalled ? (
                    <div className="mt-12 space-y-4">
                      
                      <MetricsDashboard progress={selectedProject.progress} />
                      
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                          <Rocket className="w-6 h-6 text-fuchsia-400" />
                          Implementation Plan
                        </h2>
                      </div>
                      
                      <div className="space-y-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[39px] top-4 bottom-10 w-0.5 bg-gradient-to-b from-violet-500/50 via-fuchsia-500/20 to-transparent z-0 hidden md:block"></div>
                        
                        {selectedProject.progress?.phases?.map((phase, idx) => {
                          const isActive = phase.percentage > 0 && phase.percentage < 100;
                          return (
                            <PhaseView 
                              key={phase.number} 
                              phase={phase} 
                              isActive={isActive} 
                              index={idx} 
                              projectId={selectedProject.id}
                              onRefresh={refresh}
                            />
                          );
                        })}
                      </div>
                      
                      {selectedProject.progress?.timeline?.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="mt-16"
                        >
                          <h2 className="text-xl font-bold text-white mb-6 pl-2">Activity Log</h2>
                          <div className="glass-card p-6">
                            <div className="space-y-5">
                              {selectedProject.progress.timeline.map((log, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                  {log.time && (
                                    <div className="text-xs text-fuchsia-400/80 font-mono w-32 shrink-0 pt-0.5 group-hover:text-fuchsia-400 transition-colors">
                                      {log.time}
                                    </div>
                                  )}
                                  <div className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                    {log.message}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <GitVisualizer projectId={selectedProject.id} onRefresh={refresh} />
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
                      <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                        This directory doesn't have an initialized ai-checkpoint structure. 
                        Run the CLI tool in this directory to start tracking progress.
                      </p>
                      <button 
                        onClick={handleRemoveProject}
                        className="mt-8 mx-auto flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 px-4 py-2 rounded-xl transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" /> Remove from Dashboard
                      </button>
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
                    <div className="absolute inset-0 bg-fuchsia-500 blur-3xl opacity-20 rounded-full"></div>
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
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 shadow-inner text-white transition-all"
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
    </div>
  );
}

export default App;
