import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, Calendar, Eye, Sparkles, Code2, ArrowRight } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import FilePreviewDrawer from './FilePreviewDrawer';

export default function PlanFilesTab({ project, onSwitchToGenerate }) {
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
          <div className="absolute inset-0 bg-cyber-accent/20 rounded-2xl blur-xl" />
          <div className="w-16 h-16 rounded-2xl bg-cyber-card border border-cyber-accent/40 flex items-center justify-center relative z-10 shadow-2xl">
            <FileCode className="w-8 h-8 text-cyber-accent" />
          </div>
        </div>
        <h3 className="text-base font-bold text-cyber-text-primary mb-1 font-outfit">No Plan Artifacts Detected</h3>
        <p className="text-xs text-cyber-text-secondary max-w-sm mb-6">Create atomic task specs in your <code className="text-cyber-accent bg-cyber-accent/10 px-1.5 py-0.5 rounded font-mono">plan/</code> directory or generate one instantly.</p>
        <GlassButton variant="primary" size="md" onClick={onSwitchToGenerate} className="flex items-center gap-2 font-semibold">
          <Sparkles className="w-4 h-4 text-cyber-accent" /> Generate New Plan
        </GlassButton>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
      <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${selectedFile ? 'hidden lg:block' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {files.map((file, idx) => {
            const isSelected = selectedFile === file.name;
            return (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedFile(file.name)}
                className={`glass-card p-5 cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden transition-all duration-300 ${
                  isSelected ? 'border-cyber-accent bg-cyber-accent/10 shadow-[0_0_25px_rgba(var(--cyber-accent-rgb),0.15)]' : 'hover:border-cyber-accent/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl border ${isSelected ? 'bg-cyber-accent/20 border-cyber-accent text-cyber-accent' : 'bg-white/5 border-white/10 text-cyber-text-secondary'}`}>
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-mono font-bold text-cyber-text-primary truncate">{file.name}</span>
                      <span className="text-[10px] font-mono text-cyber-text-muted">Markdown Specification</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-cyber-card/80 border border-cyber-card-border px-2 py-0.5 rounded-full text-cyber-accent font-semibold shrink-0">
                    {file.steps} {file.steps === 1 ? 'step' : 'steps'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-cyber-card-border/30 pt-3 text-[10px] font-mono text-cyber-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyber-text-muted" />
                    {fmtDate(file.createdAt) || 'Saved File'}
                  </span>
                  <div className="flex items-center gap-1 text-cyber-accent font-semibold group-hover:translate-x-1 transition-transform">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Spec</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedFile && (
          <FilePreviewDrawer projectId={project.id} filename={selectedFile} onClose={() => setSelectedFile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
