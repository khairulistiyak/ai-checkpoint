import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Eye, ArrowRight, Cpu } from 'lucide-react';

export default function PlanFileCard({ file, index, setSelectedFile }) {
  const fmtDate = (d) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return null; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      onClick={() => setSelectedFile(file.name)}
      className="group rounded-2xl p-5 cursor-pointer flex flex-col justify-between gap-5 transition-all duration-300 bg-[#121215]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyber-accent/30 hover:bg-cyber-accent/5 hover:shadow-[0_8px_30px_rgba(var(--cyber-accent-rgb),0.15)] relative overflow-hidden"
    >
      {/* Subtle Glow Background */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl pointer-events-none group-hover:bg-cyber-accent/10 transition-colors" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2.5 rounded-xl border bg-white/5 border-white/10 text-white group-hover:bg-cyber-accent/10 group-hover:text-cyber-accent group-hover:border-cyber-accent/30 transition-all">
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

      <div className="flex items-center justify-between border-t border-white/10 pt-3.5 text-[11px] font-mono text-white/50 relative z-10">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-white/40" />
          {fmtDate(file.createdAt) || 'Saved Blueprint'}
        </span>
        <div className="flex items-center gap-1 text-white/80 group-hover:text-cyber-accent font-medium group-hover:translate-x-1 transition-all">
          <Eye className="w-3.5 h-3.5" />
          <span>View Blueprint</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}
