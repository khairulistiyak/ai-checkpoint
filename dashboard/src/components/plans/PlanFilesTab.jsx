import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode, Calendar, Eye, Sparkles, Code2, ArrowRight, 
  Layers, Cpu, ShieldCheck, Zap, Activity, FileText, ChevronRight
} from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import FilePreviewDrawer from './FilePreviewDrawer';

export default function PlanFilesTab({ project }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const files = project?.planStats?.files || [];

  const fmtDate = (d) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return null; }
  };

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
      {/* 1. When a file IS open: sleek compact eye-comfort sidebar */}
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
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg border ${
                      isSelected ? 'bg-white/15 border-white/30 text-white' : 'bg-white/5 border-white/10 text-white/40 group-hover:text-white'
                    }`}>
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono font-medium truncate">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                      isSelected ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-white/50'
                    }`}>
                      {file.steps} {file.steps === 1 ? 'step' : 'steps'}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-white/20 opacity-0 group-hover:opacity-100'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. When NO file is open: Full 3-Column Eye-Comfort Minimal Grid */}
      {!selectedFile && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Top Repository Header (Restful dark matte) */}
          <div className="rounded-2xl bg-[#121214] border border-white/10 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-white/5 text-white/70 px-2 py-0.5 rounded border border-white/10 font-bold">
                    REPOSITORY
                  </span>
                  <span className="text-[11px] font-mono text-zinc-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    LIVE BLUEPRINTS
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5 font-outfit">
                  Architectural Plan Specifications
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono">
              <div className="flex flex-col items-end">
                <span className="text-white/40 text-[10px] uppercase">Specifications</span>
                <span className="text-white font-medium">{files.length} Blueprints</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-end">
                <span className="text-white/40 text-[10px] uppercase">Atomic Steps</span>
                <span className="text-white font-bold">{totalStepsAcrossFiles} Tasks</span>
              </div>
            </div>
          </div>

          {/* Blueprint Grid - Linear Matte Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {files.map((file, idx) => {
              return (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedFile(file.name)}
                  className="group rounded-2xl p-5 cursor-pointer flex flex-col justify-between gap-5 transition-all duration-200 bg-[#121214] border border-white/10 hover:border-white/20 hover:bg-[#18181b]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl border bg-white/5 border-white/10 text-white group-hover:bg-white/10 transition-all">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-mono font-bold text-white truncate group-hover:text-white transition-colors">
                          {file.name}
                        </span>
                        <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                          CAD Architectural Spec
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-white/80 font-medium shrink-0">
                      {file.steps} {file.steps === 1 ? 'step' : 'steps'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3.5 text-[11px] font-mono text-white/50">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      {fmtDate(file.createdAt) || 'Saved Blueprint'}
                    </span>
                    <div className="flex items-center gap-1 text-white font-medium group-hover:translate-x-1 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Blueprint</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Architectural Blueprint Drawer */}
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
