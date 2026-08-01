import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, X } from 'lucide-react';
import PhaseView from './PhaseView';

export default function PlanModal({ project, onClose, onRefresh }) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8">
      <div className="absolute inset-0 bg-cyber-dark/80 backdrop-blur-md" onClick={onClose}></div>
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass-card flex flex-col shadow-2xl w-[95vw] sm:w-[90vw] max-w-5xl max-h-[92vh] sm:max-h-[90vh] relative z-10 border border-cyber-card-border rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 md:p-8 border-b border-cyber-card-border bg-cyber-card/60 flex-shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-cyber-accent shrink-0" />
              Implementation Plan
            </h2>
            <p className="text-cyber-text-secondary text-xs sm:text-sm mt-1">Detailed steps and progress for {project.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-cyber-card-border/50 hover:bg-cyber-card-border rounded-full text-cyber-text-secondary hover:text-cyber-text-primary transition-colors border border-cyber-card-border shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative scroll-smooth custom-scrollbar bg-cyber-dark/40">
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute left-[39px] top-4 bottom-10 w-0.5 bg-gradient-to-b from-cyber-accent/50 via-cyber-accent/20 to-transparent z-0 hidden md:block"></div>
            
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
                <div className="text-center p-12 text-cyber-text-muted italic bg-cyber-card/50 rounded-xl border border-cyber-card-border">
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
