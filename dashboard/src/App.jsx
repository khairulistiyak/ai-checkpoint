import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectGrid from './components/ProjectGrid';
import EmptySelectionView from './components/EmptySelectionView';
import InitializingView from './components/InitializingView';
import AddProjectModal from './components/AddProjectModal';
import ConfigEditor from './components/ConfigEditor';
import CommandPalette from './components/CommandPalette';
import LogPanel from './components/LogPanel';
import SettingsModal from './components/SettingsModal';
import PlanModal from './components/PlanModal';
import ConfirmModal from './components/ConfirmModal';
import { useProjects } from './hooks/useProjects';
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
  const [installing, setInstalling] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandPaletteOpen(true); }
      if (e.key === 'Escape') {
        setIsAddModalOpen(false); setIsSettingsOpen(false);
        setIsPlanModalOpen(false); setConfigProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (projects.length > 0 && !selectedId) setSelectedId(projects[0].id);
  }, [projects, selectedId]);

  const selectedProject = projects.find(p => p.id === selectedId);

  const handleAddProject = async (path) => {
    try {
      await addProject(path); setIsAddModalOpen(false);
      showToast('Project added successfully!', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const doRemoveProject = async () => {
    await removeProject(selectedId); setSelectedId(null);
    setConfirmRemove(false); showToast('Project removed', 'info');
  };

  const handleInstallProject = async () => {
    setInstalling(true);
    try {
      await api.installProject(selectedProject.id); refresh();
      showToast('Project initialized successfully!', 'success');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setInstalling(false); }
  };

  if (loading && projects.length === 0) return <InitializingView />;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans relative">
      {error && (
        <div className="mx-4 md:mx-6 mt-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-sm text-red-300">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
          Server connection error. Auto-retrying...
        </div>
      )}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <div className="flex flex-1 overflow-hidden px-4 md:px-6 pb-14 md:pb-12 gap-6 relative">
        <Sidebar
          projects={projects} selectedId={selectedId}
          onSelect={(id) => { setSelectedId(id); setIsMobileMenuOpen(false); }}
          isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
          onAddProject={() => setIsAddModalOpen(true)}
          onReorder={async (ids) => { try { await api.reorderProjects(ids); refresh(); } catch (e) { showToast('Failed to reorder', 'error'); } }}
        />
        <main className="flex-1 overflow-y-auto md:overflow-hidden glass-panel rounded-2xl p-4 md:p-8 relative flex flex-col custom-scrollbar">
          <div className="max-w-5xl mx-auto w-full h-full flex flex-col min-h-max md:min-h-0">
            <AnimatePresence mode="wait">
              {selectedProject ? (
                <motion.div
                  key={selectedProject.id} initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring' }} className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar md:pr-2 pb-6"
                >
                  <ProjectGrid
                    selectedProject={selectedProject} installing={installing}
                    onRemove={() => setConfirmRemove(true)} onOpenConfig={() => setConfigProject(selectedProject.id)}
                    onOpenPlan={() => setIsPlanModalOpen(true)} onInstall={handleInstallProject} refresh={refresh}
                  />
                </motion.div>
              ) : (
                <EmptySelectionView onAddProject={() => setIsAddModalOpen(true)} />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
      <AnimatePresence>{isPlanModalOpen && selectedProject && <PlanModal project={selectedProject} onClose={() => setIsPlanModalOpen(false)} onRefresh={refresh} />}</AnimatePresence>
      <AnimatePresence>{configProject && <ConfigEditor projectId={configProject} onClose={() => setConfigProject(null)} />}</AnimatePresence>
      <AddProjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProject} />
      {selectedProject && selectedProject.isInstalled && <LogPanel logs={selectedProject.progress?.timeline} />}
      <AnimatePresence>{isCommandPaletteOpen && <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} projects={projects} onSelectProject={(id) => { setSelectedId(id); setIsCommandPaletteOpen(false); }} onOpenSettings={() => { setIsCommandPaletteOpen(false); setIsSettingsOpen(true); }} />}</AnimatePresence>
      <AnimatePresence>{isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}</AnimatePresence>
      <ConfirmModal isOpen={confirmRemove} title="Remove Project" message="Remove this project from the dashboard? The files on disk will not be deleted." confirmText="Remove" cancelText="Keep" danger={true} onConfirm={doRemoveProject} onCancel={() => setConfirmRemove(false)} />
    </div>
  );
}

export default App;
