import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, X } from 'lucide-react';
import PhaseView from './PhaseView';

export default function PlanModal({ project, onClose, onRefresh }) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass-card flex flex-col shadow-2xl w-[95vw] sm:w-[90vw] max-w-5xl max-h-[92vh] sm:max-h-[90vh] relative z-10 border border-slate-600/50 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 md:p-8 border-b border-slate-700/50 bg-slate-900/60 flex-shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-accent-400 shrink-0" />
              Implementation Plan
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Detailed steps and progress for {project.name}</p>
            {project.planStats?.files?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {project.planStats.files.map(f => {
                  const dateStr = f.createdAt 
                    ? new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '';
                  return (
                    <span 
                      key={f.name} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium font-mono bg-slate-800/80 border border-slate-700/50 text-slate-300 gap-1.5"
                    >
                      <span>{f.name}</span>
                      {dateStr && <span className="text-slate-500">•</span>}
                      {dateStr && <span className="text-slate-400">{dateStr}</span>}
                      <span className="text-slate-500">•</span>
                      <span className="text-accent-400/80">{f.steps} steps</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-600 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative scroll-smooth custom-scrollbar bg-slate-950/40">
          <div className="max-w-4xl mx-auto relative">
            {/* Connecting Line */}
            <div className="absolute left-[39px] top-4 bottom-10 w-0.5 bg-gradient-to-b from-primary-500/50 via-accent-500/20 to-transparent z-0 hidden md:block"></div>
            
            <div className="space-y-4">
              {project.progress?.phases?.length > 0 ? (
                project.progress.phases.map((phase, idx) => {
                  const isActive = phase.percentage > 0 && phase.percentage < 100;
                  return (
                    <PhaseView 
                      key={phase.number} 
                      phase={phase} 
                      isActive={isActive} 
                      index={idx} 
                      projectId={project.id}
                      hasPlanFiles={project.hasPlanFiles}
                      onRefresh={onRefresh}
                    />
                  );
                })
              ) : (
                <div className="text-center p-12 text-slate-500 italic bg-slate-900/50 rounded-xl border border-slate-800">
                  No implementation plan phases found in PROGRESS.md.
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
