import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Cpu, ChevronRight } from 'lucide-react';
import FilePreviewDrawer from './FilePreviewDrawer';
import PlanFileCard from '../plan/PlanFileCard';
import PlanFilesHeader from './PlanFilesHeader';

export default function PlanFilesTab({ project }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const files = project?.planStats?.files || [];

  if (files.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10">
            <Layers className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-base font-bold text-white mb-1 font-outfit">No Architectural Blueprints Detected</h3>
        <p className="text-xs text-white/50 max-w-sm">Place atomic task specifications in your <code className="text-white bg-white/5 px-1.5 py-0.5 rounded font-mono border border-white/10">plan/</code> directory.</p>
      </motion.div>
    );
  }

  const totalStepsAcrossFiles = files.reduce((acc, f) => acc + (f.steps || 0), 0);

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
      {selectedFile && (
        <div className="hidden lg:flex w-72 xl:w-80 shrink-0 border-r border-white/10 bg-[#09090b] flex-col overflow-hidden z-20">
          <div className="px-4 py-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-white" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Blueprints
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium bg-white/5 border border-white/10 text-white/70 px-2 py-0.5 rounded-full">
              {files.length} Files
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
            {files.map((file) => {
              const isSelected = selectedFile === file.name;
              return (
                <div
                  key={file.name}
                  onClick={() => setSelectedFile(file.name)}
                  className={`p-3 rounded-xl cursor-pointer flex items-center justify-between gap-3 border transition-all duration-150 group ${
                    isSelected
                      ? 'bg-cyber-accent/10 border-cyber-accent/30 text-cyber-accent shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.15)]'
                      : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg border transition-all ${
                      isSelected ? 'bg-cyber-accent/20 border-cyber-accent/40 text-cyber-accent' : 'bg-white/5 border-white/10 text-white/40 group-hover:text-white'
                    }`}>
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono font-medium truncate">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium transition-all ${
                      isSelected ? 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/30' : 'bg-white/5 text-white/50 border border-transparent'
                    }`}>
                      {file.steps} {file.steps === 1 ? 'step' : 'steps'}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-cyber-accent translate-x-0.5' : 'text-white/20 opacity-0 group-hover:opacity-100'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!selectedFile && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <PlanFilesHeader
            filesCount={files.length}
            totalStepsAcrossFiles={totalStepsAcrossFiles}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {files.map((file, idx) => (
              <PlanFileCard
                key={file.name}
                file={file}
                index={idx}
                setSelectedFile={setSelectedFile}
              />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedFile && (
          <FilePreviewDrawer
            projectId={project.id}
            filename={selectedFile}
            allFiles={files}
            onSelectFile={(f) => setSelectedFile(f)}
            onClose={() => setSelectedFile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
