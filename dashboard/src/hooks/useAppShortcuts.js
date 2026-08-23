import { useEffect } from 'react';

/**
 * useAppShortcuts — Global Keyboard Shortcuts Hook
 * Handles Command Palette (Cmd+K) and Escape key modal dismissals.
 */
export function useAppShortcuts({
  isAddModalOpen,
  setIsAddModalOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  configProject,
  setConfigProject,
  setIsCommandPaletteOpen,
  route,
  projectId,
  navigate
}) {
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (route === 'plans') navigate(`#/project/${projectId}`);
        else if (configProject) setConfigProject(null);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    isAddModalOpen,
    setIsAddModalOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    configProject,
    setConfigProject,
    setIsCommandPaletteOpen,
    route,
    projectId,
    navigate
  ]);
}
