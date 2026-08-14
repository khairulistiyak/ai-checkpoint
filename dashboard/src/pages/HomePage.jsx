import React, { useState, useMemo } from 'react';
import { Search, Cpu, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import GlobalOverview from '../components/GlobalOverview';
import HomeProjectCard from '../components/home/HomeProjectCard';
import HomeCommandBanner from '../components/home/HomeCommandBanner';

export default function HomePage({ projects = [], onAddProject }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const match = p.name.toLowerCase().includes(q) || (p.path && p.path.toLowerCase().includes(q));
      if (!match) return false;
      const pct = p.progress?.overall?.percentage ?? 0;
      if (filterType === 'complete') return p.isInstalled && pct === 100;
      if (filterType === 'in_progress') return p.isInstalled && pct < 100;
      if (filterType === 'pending') return !p.isInstalled;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'health') {
        const aP = a.progress?.overall?.percentage || 0;
        const bP = b.progress?.overall?.percentage || 0;
        return bP - aP;
      }
      return a.name.localeCompare(b.name);
    });
  }, [projects, searchQuery, filterType, sortBy]);

  const counts = useMemo(() => ({
    all: projects.length,
    complete: projects.filter(p => p.isInstalled && p.progress?.overall?.percentage === 100).length,
    in_progress: projects.filter(p => p.isInstalled && (p.progress?.overall?.percentage ?? 0) < 100).length,
    pending: projects.filter(p => !p.isInstalled).length
  }), [projects]);

  const filterButtons = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'complete', label: `Complete (${counts.complete})` },
    { key: 'in_progress', label: `In Progress (${counts.in_progress})` },
    { key: 'pending', label: `Not Setup (${counts.pending})` }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="flex flex-col items-center justify-start min-h-full w-full pb-16 space-y-6 md:space-y-8">
      {projects.length > 0 && <GlobalOverview projects={projects} />}
      <HomeCommandBanner onAddProject={onAddProject} />

      {projects.length > 0 ? (
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {filterButtons.map(btn => (
                <button
                  key={btn.key}
                  onClick={() => setFilterType(btn.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    filterType === btn.key ? 'bg-white/15 text-white border border-white/25 shadow-sm' : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.07]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] border border-white/[0.08] focus:border-white/20 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all"
                />
              </div>

              <button
                onClick={() => setSortBy((prev) => (prev === 'name' ? 'health' : 'name'))}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 hover:text-white text-xs font-mono transition-all cursor-pointer shrink-0"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort: {sortBy === 'name' ? 'Name' : 'Health'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <HomeProjectCard key={project.id} project={project} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="w-full bg-[#121214] border border-white/10 rounded-3xl p-12 text-center text-zinc-500 font-mono text-xs italic">
              No matching workspaces found for the selected filter or query.
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto bg-[#121214] border border-white/10 rounded-3xl p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto">
            <Cpu className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold text-white font-outfit">No Active Projects</h2>
          <p className="text-zinc-400 text-xs font-mono max-w-md mx-auto">
            Your studio currently has no tracked repositories. Add an existing workspace path to begin tracking execution checkpoints.
          </p>
          <button
            onClick={onAddProject}
            className="px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold font-mono text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
          >
            + Add Workspace
          </button>
        </div>
      )}
    </motion.div>
  );
}
