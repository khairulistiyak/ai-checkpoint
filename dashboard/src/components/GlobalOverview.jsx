import React from 'react';
import { Activity, Folder, CheckCircle } from 'lucide-react';

export default function GlobalOverview({ projects }) {
  const total = projects.length;
  const installed = projects.filter(p => p.isInstalled).length;
  let totalSteps = 0;
  let doneSteps = 0;

  projects.forEach(p => {
    if (p.isInstalled && p.progress && p.progress.overall) {
      totalSteps += p.progress.overall.total || 0;
      doneSteps += p.progress.overall.completed || 0;
    }
  });

  const percent = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-5xl mx-auto mb-6 sm:mb-10">
      <div className="bg-cyber-dark/50 backdrop-blur border border-cyber-card-border p-4 sm:p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-cyber-accent/20 border border-cyber-accent/30 text-cyber-text-primary rounded-xl">
          <Folder className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-cyber-text-secondary font-medium">Total Projects</div>
          <div className="text-2xl font-bold text-cyber-text-primary text-left">{total}</div>
        </div>
      </div>
      <div className="bg-cyber-dark/50 backdrop-blur border border-cyber-card-border p-4 sm:p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-cyber-accent/20 border border-cyber-accent/30 text-cyber-text-primary rounded-xl">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-cyber-text-secondary font-medium">Installed</div>
          <div className="text-2xl font-bold text-cyber-text-primary text-left">{installed}</div>
        </div>
      </div>
      <div className="bg-cyber-dark/50 backdrop-blur border border-cyber-card-border p-4 sm:p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-cyber-accent/20 border border-cyber-accent/30 text-cyber-text-primary rounded-xl">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-cyber-text-secondary font-medium">Global Progress</div>
          <div className="flex items-end gap-2">
            <div className="text-2xl font-bold text-cyber-text-primary">{percent}%</div>
            <div className="text-sm text-cyber-text-muted pb-1">({doneSteps}/{totalSteps})</div>
          </div>
        </div>
      </div>
    </div>
  );
}
