import React from 'react';
import { Activity, Folder, CheckCircle2 } from 'lucide-react';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto mb-8">
      <div className="bg-[#0c101a] border border-white/10 hover:border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all">
        <div className="p-3 bg-white/5 border border-white/10 text-sky-400 rounded-xl">
          <Folder className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-white/50 font-mono uppercase tracking-wider">Total Projects</div>
          <div className="text-2xl font-bold text-white font-outfit mt-0.5">{total}</div>
        </div>
      </div>

      <div className="bg-[#0c101a] border border-white/10 hover:border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-white/50 font-mono uppercase tracking-wider">Installed</div>
          <div className="text-2xl font-bold text-white font-outfit mt-0.5">{installed}</div>
        </div>
      </div>

      <div className="bg-[#0c101a] border border-white/10 hover:border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all">
        <div className="p-3 bg-sky-500/10 border border-sky-400/20 text-sky-400 rounded-xl">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-white/50 font-mono uppercase tracking-wider">Global Progress</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-white font-outfit">{percent}%</span>
            <span className="text-xs text-white/40 font-mono">({doneSteps}/{totalSteps})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
