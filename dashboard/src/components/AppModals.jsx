import React from 'react';
import { AnimatePresence } from 'framer-motion';
import AddProjectModal from './AddProjectModal';
import ConfigEditor from './ConfigEditor';
import CommandPalette from './CommandPalette';
import LogPanel from './LogPanel';
import SettingsModal from './SettingsModal';
import ConfirmModal from './ConfirmModal';

export default function AppModals({
  configProject,
  setConfigProject,
  isAddModalOpen,
  setIsAddModalOpen,
  handleAddProject,
  selectedProject,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  projects,
  onSelectProject,
  setIsSettingsOpen,
  isSettingsOpen,
  confirmRemove,
  doRemoveProject,
  setConfirmRemove
}) {
  return (
    <>
      <AnimatePresence>
        {configProject && <ConfigEditor projectId={configProject} onClose={() => setConfigProject(null)} />}
      </AnimatePresence>

      <AddProjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProject} />
      {selectedProject && selectedProject.isInstalled && <LogPanel logs={selectedProject.progress?.timeline} />}

      <AnimatePresence>
        {isCommandPaletteOpen && (
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            projects={projects}
            onSelectProject={(id) => { onSelectProject(id); setIsCommandPaletteOpen(false); }}
            onOpenSettings={() => { setIsCommandPaletteOpen(false); setIsSettingsOpen(true); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmRemove}
        title="Remove Project"
        message="Remove this project from the dashboard? The files on disk will not be deleted."
        confirmText="Remove"
        cancelText="Keep"
        danger={true}
        onConfirm={doRemoveProject}
        onCancel={() => setConfirmRemove(false)}
      />
    </>
  );
}
