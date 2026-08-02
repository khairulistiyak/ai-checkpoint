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
import PlansCenter from './components/PlansCenter';
import ConfirmModal from './components/ConfirmModal';
import { ComponentLibrary } from './components/library/ComponentLibrary';

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
  const [installing, setInstalling] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  React.useEffect(() => {
    if (window.location.hash === '#library') setSelectedId('library');
    const onHash = () => setSelectedId(window.location.hash === '#library' ? 'library' : null);
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') { e.preventDefault(); setSelectedId(p => p === 'library' ? null : 'library'); }
      else if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandPaletteOpen(true); }
      else if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (typeof selectedId === 'string' && selectedId.startsWith('plans-')) setSelectedId(selectedId.split('-')[1] || null);
        else if (selectedId === 'library') setSelectedId(null);
        else if (configProject) setConfigProject(null);
      }
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('keydown', onKey); };
  }, [isAddModalOpen, isSettingsOpen, configProject, selectedId]);


  const selectedProject = projects.find(p => p.id === selectedId);

  const handleAddProject = async (path) => {
    try { await addProject(path); setIsAddModalOpen(false); showToast('Added!', 'success'); }
    catch (err) { showToast(err.message, 'error'); }
  };
  const doRemoveProject = async () => {
    try { await removeProject(selectedId); setSelectedId(null); showToast('Removed', 'info'); }
    catch (err) { showToast(err.message, 'error'); } finally { setConfirmRemove(false); }
  };
  const handleInstallProject = async () => {
    setInstalling(true);
    try { await api.installProject(selectedProject.id); refresh(); showToast('Success', 'success'); }
    catch (e) { showToast(e.message, 'error'); } finally { setInstalling(false); }
  };

  if (loading && projects.length === 0) return <InitializingView />;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-outfit bg-[#0a0d14] text-white/90 relative">
      {error && (
        <div className="mx-4 md:mx-6 mt-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-sm text-red-300">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
          Server connection error. Auto-retrying...
        </div>
      )}
      {!(typeof selectedId === 'string' && selectedId.startsWith('plans-')) && (
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenLibrary={() => setSelectedId('library')}
        />
      )}
      <div className={`flex flex-1 overflow-hidden relative ${typeof selectedId === 'string' && selectedId.startsWith('plans-') ? 'p-0 gap-0' : 'px-4 md:px-6 pb-14 md:pb-12 gap-6'}`}>
        {!(typeof selectedId === 'string' && selectedId.startsWith('plans-')) && (
          <Sidebar
            projects={projects} selectedId={selectedId}
            onSelect={(id) => { setSelectedId(id); setIsMobileMenuOpen(false); }}
            isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
            onAddProject={() => setIsAddModalOpen(true)}
            onReorder={async (ids) => { try { await api.reorderProjects(ids); refresh(); } catch (e) { showToast('Failed to reorder', 'error'); } }}
          />
        )}
        <main className={`flex-1 overflow-y-auto md:overflow-hidden relative flex flex-col custom-scrollbar ${typeof selectedId === 'string' && selectedId.startsWith('plans-') ? 'p-0 border-none rounded-none shadow-none bg-[#0a0d14]' : 'bg-[#0e121e] border border-white/10 rounded-2xl p-4 md:p-8'}`}>
          <div className={`w-full h-full flex flex-col min-h-max md:min-h-0 ${typeof selectedId === 'string' && selectedId.startsWith('plans-') ? 'w-full max-w-none' : 'max-w-5xl mx-auto'}`}>
            <AnimatePresence mode="wait">
              {typeof selectedId === 'string' && selectedId.startsWith('plans-') ? (
                <motion.div
                  key="plans" initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring' }} className="h-full w-full"
                >
                  <PlansCenter
                    project={projects.find(p => selectedId.includes(p.id))}
                    initialTab={selectedId.split('-').pop()}
                    onBack={() => { const proj = projects.find(p => selectedId.includes(p.id)); setSelectedId(proj ? proj.id : null); }}
                    onRefresh={refresh}
                    onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                  />
                </motion.div>
              ) : selectedId === 'library' ? (
                <motion.div
                  key="library" initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring' }} className="h-full w-full"
                >
                  <ComponentLibrary asPage={true} />
                </motion.div>
              ) : selectedProject ? (
                <motion.div
                  key={selectedProject.id} initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring' }} className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar md:pr-2 pb-6"
                >
                  <ProjectGrid
                    selectedProject={selectedProject} installing={installing}
                    onRemove={() => setConfirmRemove(true)} onOpenConfig={() => setConfigProject(selectedProject.id)}
                    onInstall={handleInstallProject} refresh={refresh}
                    onOpenPlans={(tab) => setSelectedId('plans-' + selectedProject.id + '-' + (tab || 'progress'))}
                  />

                </motion.div>
              ) : (
                <EmptySelectionView onAddProject={() => setIsAddModalOpen(true)} projects={projects} />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
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
