import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import InitializingView from './components/InitializingView';
import AppModals from './components/AppModals';
import PageSkeleton from './components/ui/PageSkeleton';

import { useProjects } from './hooks/useProjects';
import { useHashRoute } from './hooks/useHashRoute';
import { useFileWatcher, restoreProgress } from './hooks/useFileWatcher';
import { AnimatePresence } from 'framer-motion';
import { useToast } from './components/ToastProvider';
import * as api from './utils/api';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const ComponentLibrary = lazy(() =>
  import('./components/library/ComponentLibrary').then((m) => ({ default: m.ComponentLibrary }))
);

export default function App() {
  const { showToast } = useToast();
  const { projects, loading, error, addProject, removeProject, refresh } = useProjects(30000);
  const { route, projectId, tab, navigate } = useHashRoute();

  const [selectedId, setSelectedId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [configProject, setConfigProject] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [progressDeleteWarning, setProgressDeleteWarning] = useState(null);
  const [liveActivityEntry, setLiveActivityEntry] = useState(null);

  // Real-time file watcher via SSE
  useFileWatcher(selectedId && selectedId !== 'library' ? selectedId : null, {
    onRefresh: () => refresh(),
    onFileRestored: (data) => {
      showToast(`🔄 ${data.file} auto-restored`, 'info');
    },
    onFileDeletedWarning: (data) => {
      if (data.file === '.agents/PROGRESS.md' && data.canRestore) {
        setProgressDeleteWarning(data);
      } else {
        showToast(`⚠️ ${data.message || data.file + ' deleted'}`, 'warning');
      }
    },
    onPlanDeleted: (data) => {
      showToast(`🗑️ ${data.file} deleted`, 'info');
    },
    onActivityLog: (entry) => {
      setLiveActivityEntry(entry);
    },
  });

  useEffect(() => {
    if (route === 'library') setSelectedId('library');
    else if (route === 'project' || route === 'plans') setSelectedId(projectId);
    else setSelectedId(null);
  }, [route, projectId]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        navigate(route === 'library' ? '#/' : '#/library');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (route === 'plans') navigate(`#/project/${projectId}`);
        else if (route === 'library') navigate('#/');
        else if (configProject) setConfigProject(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAddModalOpen, isSettingsOpen, configProject, route, projectId, navigate]);

  const selectedProject = projects.find((p) => p.id === selectedId);

  const handleSelectSidebar = (id) => {
    if (id === 'library') navigate('#/library');
    else if (id) navigate(`#/project/${id}`);
    else navigate('#/');
    setIsMobileMenuOpen(false);
  };

  const handleAddProject = async (path) => {
    try { await addProject(path); setIsAddModalOpen(false); showToast('Added!', 'success'); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const doRemoveProject = async () => {
    try { await removeProject(selectedId); navigate('#/'); showToast('Removed', 'info'); }
    catch (err) { showToast(err.message, 'error'); } finally { setConfirmRemove(false); }
  };

  const handleInstallProject = async () => {
    setInstalling(true);
    try { await api.installProject(selectedProject.id); refresh(); showToast('Success', 'success'); }
    catch (e) { showToast(e.message, 'error'); } finally { setInstalling(false); }
  };

  if (loading && projects.length === 0) return <InitializingView />;
  const isPlansRoute = route === 'plans';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-outfit bg-[#09090b] text-white/90 relative">
      {error && (
        <div className="mx-4 md:mx-6 mt-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-sm text-red-300">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
          Server connection error. Auto-retrying...
        </div>
      )}

      {!isPlansRoute && (
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenLibrary={() => navigate('#/library')}
        />
      )}

      <div className={`flex flex-1 overflow-hidden relative ${isPlansRoute ? 'p-0 gap-0' : 'p-0 gap-0'}`}>
        {!isPlansRoute && (
          <Sidebar
            projects={projects} selectedId={selectedId} onSelect={handleSelectSidebar}
            isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
            onAddProject={() => setIsAddModalOpen(true)}
            onReorder={async (ids) => { try { await api.reorderProjects(ids); refresh(); } catch (e) { showToast('Failed to reorder', 'error'); } }}
          />
        )}

        <main className={`flex-1 overflow-y-auto md:overflow-hidden relative flex flex-col custom-scrollbar ${isPlansRoute ? 'p-0 border-none rounded-none shadow-none bg-[#09090b]' : 'bg-[#09090b] p-2.5 sm:p-3.5 md:p-4'}`}>
          <div className="w-full h-full flex flex-col min-h-max md:min-h-0 max-w-full">
            <Suspense fallback={<PageSkeleton />}>
              <AnimatePresence mode="wait">
                {route === 'library' ? (
                  <ComponentLibrary asPage={true} />
                ) : isPlansRoute ? (
                  <PlansPage
                    project={selectedProject} tab={tab}
                    onBack={() => navigate(selectedProject ? `#/project/${selectedProject.id}` : '#/')}
                    onRefresh={refresh}
                  />
                ) : route === 'project' ? (
                  <ProjectPage
                    project={selectedProject} installing={installing}
                    onRemove={() => setConfirmRemove(true)} onOpenConfig={() => setConfigProject(selectedProject.id)}
                    onInstall={handleInstallProject} refresh={refresh}
                    onOpenPlans={(t) => navigate(`#/project/${selectedProject.id}/plans/${t || 'progress'}`)}
                    liveActivityEntry={liveActivityEntry}
                  />
                ) : (
                  <HomePage projects={projects} onAddProject={() => setIsAddModalOpen(true)} />
                )}
              </AnimatePresence>
            </Suspense>
          </div>
        </main>
      </div>

      <AppModals
        configProject={configProject} setConfigProject={setConfigProject}
        isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen}
        handleAddProject={handleAddProject} selectedProject={selectedProject}
        isCommandPaletteOpen={isCommandPaletteOpen} setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        projects={projects} onSelectProject={handleSelectSidebar}
        setIsSettingsOpen={setIsSettingsOpen} isSettingsOpen={isSettingsOpen}
        confirmRemove={confirmRemove} doRemoveProject={doRemoveProject} setConfirmRemove={setConfirmRemove}
      />

      {/* PROGRESS.md deletion confirmation */}
      {progressDeleteWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-yellow-500/30 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-lg font-semibold text-yellow-300">PROGRESS.md Deleted</h3>
            </div>
            <p className="text-white/70 text-sm mb-6">
              PROGRESS.md ফাইলটি ডিলিট হয়ে গেছে! Accept করলে template থেকে নতুন করে তৈরি হবে।
              পুরোনো progress data হারিয়ে যাবে।
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setProgressDeleteWarning(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={async () => {
                  try {
                    await restoreProgress(selectedId);
                    showToast('🔄 PROGRESS.md recreated', 'success');
                    refresh();
                  } catch (e) {
                    showToast('Failed to restore PROGRESS.md', 'error');
                  }
                  setProgressDeleteWarning(null);
                }}
                className="px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-sm font-medium transition-colors border border-yellow-500/30"
              >
                Accept & Recreate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
