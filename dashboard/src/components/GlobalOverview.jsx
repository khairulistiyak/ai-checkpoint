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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mb-10">
      <div className="bg-slate-800/40 backdrop-blur border border-white/[0.05] p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
          <Folder className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-slate-400 font-medium">Total Projects</div>
          <div className="text-2xl font-bold text-white text-left">{total}</div>
        </div>
      </div>
      <div className="bg-slate-800/40 backdrop-blur border border-white/[0.05] p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-slate-400 font-medium">Installed</div>
          <div className="text-2xl font-bold text-white text-left">{installed}</div>
        </div>
      </div>
      <div className="bg-slate-800/40 backdrop-blur border border-white/[0.05] p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-slate-400 font-medium">Global Progress</div>
          <div className="flex items-end gap-2">
            <div className="text-2xl font-bold text-white">{percent}%</div>
            <div className="text-sm text-slate-500 pb-1">({doneSteps}/{totalSteps})</div>
          </div>
        </div>
      </div>
    </div>
  );
}
