import React, { useState, useMemo } from 'react';
import { PlusCircle, Search, Cpu, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import GlobalOverview from '../components/GlobalOverview';
import HomeProjectCard from '../components/home/HomeProjectCard';
import HomeCommandBanner from '../components/home/HomeCommandBanner';

export default function HomePage({ projects, onAddProject }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'verified' | 'pending'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'health'

  const filteredProjects = useMemo(() => {
    let list = (projects || []).filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.path && p.path.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;
      if (filterType === 'verified') return p.isInstalled;
      if (filterType === 'pending') return !p.isInstalled;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'health') {
        const aPercent = a.progress?.overall?.total
          ? (a.progress.overall.completed / a.progress.overall.total) * 100
          : 0;
        const bPercent = b.progress?.overall?.total
          ? (b.progress.overall.completed / b.progress.overall.total) * 100
          : 0;
        return bPercent - aPercent;
      }
      return a.name.localeCompare(b.name);
    });
  }, [projects, searchQuery, filterType, sortBy]);

  const verifiedCount = (projects || []).filter((p) => p.isInstalled).length;
  const pendingCount = (projects || []).length - verifiedCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center justify-start min-h-full w-full pb-16 space-y-8"
    >
      {/* 1. Vercel/Linear 4-Column Executive Metrics Bar */}
      {projects && projects.length > 0 && <GlobalOverview projects={projects} />}

      {/* 2. Apple Studio Command Center Header */}
      <HomeCommandBanner onAddProject={onAddProject} />

      {/* 3. Interactive Filter Pills, Search & Sort Toolbar */}
      {projects && projects.length > 0 ? (
        <div className="w-full max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white text-zinc-950 border border-white shadow-sm'
                    : 'bg-[#121214] text-white/60 hover:text-white border border-white/10'
                }`}
              >
                All Workspaces ({projects.length})
              </button>
              <button
                onClick={() => setFilterType('verified')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  filterType === 'verified'
                    ? 'bg-white text-zinc-950 border border-white shadow-sm'
                    : 'bg-[#121214] text-white/60 hover:text-white border border-white/10'
                }`}
              >
                Verified ({verifiedCount})
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  filterType === 'pending'
                    ? 'bg-white text-zinc-950 border border-white shadow-sm'
                    : 'bg-[#121214] text-white/60 hover:text-white border border-white/10'
                }`}
              >
                Pending Setup ({pendingCount})
              </button>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#121214] border border-white/10 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <button
                onClick={() => setSortBy(sortBy === 'name' ? 'health' : 'name')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121214] border border-white/10 hover:border-white/20 text-white text-xs font-mono uppercase tracking-wider shrink-0 cursor-pointer"
                title="Toggle sorting order"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-white" />
                <span>Sort: {sortBy.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => (
                <HomeProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          ) : (
            <div className="bg-[#121214] border border-white/10 rounded-3xl p-12 text-center text-white/50 font-mono text-xs">
              No workspaces matched your search filter.
            </div>
          )}
        </div>
      ) : (
        /* 4. Empty State */
        <div className="w-full max-w-5xl mx-auto bg-[#121214] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center">
            <Cpu className="w-8 h-8 text-white/50" />
          </div>
          <h2 className="text-xl font-bold text-white font-outfit tracking-tight">
            No Projects Initialized
          </h2>
          <p className="text-xs font-mono text-white/50 max-w-md leading-relaxed">
            Get started by adding a project workspace directory to generate architectural blueprints and execution checkpoints.
          </p>
          <button
            onClick={onAddProject}
            className="mt-2 px-6 py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 border border-white transition-all text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Your First Project</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
