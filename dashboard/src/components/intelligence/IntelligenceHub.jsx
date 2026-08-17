import React, { useEffect, useState, useMemo } from 'react';
import { ShieldAlert, Zap, Search, Activity, Accessibility, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../ToastProvider';
import TrendLineChart from './TrendLineChart';
import SmartInsights from './SmartInsights';
import IssueFilterTabs from './IssueFilterTabs';
import CleanMinimalistBars from './CleanMinimalistBars';
import AdvancedHUDV1 from './AdvancedHUDV1';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function IntelligenceHub({ project }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetch(`/api/projects/${project.id}/intelligence`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setData(res);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [project.id]);

  const handleCopyPrompt = (issue, index) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(issue.prompt);
      setCopiedId(index);
      showToast("Prompt copied! Paste it in the IDE.", "success");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const scoreItems = useMemo(() => {
    if (!data) return [];
    const { scores } = data.report;
    return [
      { id: 'responsive', label: 'Responsive', score: scores.responsive, icon: <Search className="w-4 h-4 text-blue-400" />, color: 'text-blue-400', bg: 'bg-blue-400', borderColor: 'border-blue-500/50' },
      { id: 'dynamic', label: 'Dynamic', score: scores.dynamic, icon: <Activity className="w-4 h-4 text-purple-400" />, color: 'text-purple-400', bg: 'bg-purple-400', borderColor: 'border-purple-500/50' },
      { id: 'performance', label: 'Performance', score: scores.performance, icon: <Zap className="w-4 h-4 text-amber-400" />, color: 'text-amber-400', bg: 'bg-amber-400', borderColor: 'border-amber-500/50' },
      { id: 'a11y', label: 'A11y', score: scores.a11y, icon: <Accessibility className="w-4 h-4 text-emerald-400" />, color: 'text-emerald-400', bg: 'bg-emerald-400', borderColor: 'border-emerald-500/50' },
      { id: 'security', label: 'Security', score: scores.security, icon: <ShieldAlert className="w-4 h-4 text-rose-400" />, color: 'text-rose-400', bg: 'bg-rose-400', borderColor: 'border-rose-500/50' },
    ];
  }, [data]);

  const filterCategories = useMemo(() => {
    if (!data) return [];
    const issues = data.report.issues;
    const base = [{ id: 'all', label: 'All Issues', count: issues.length, color: 'bg-white/10', borderColor: 'border-white/20' }];
    const cats = scoreItems.map(si => ({
      id: si.id,
      label: si.label,
      count: issues.filter(i => i.type === si.id).length,
      color: si.bg,
      borderColor: si.borderColor
    }));
    return [...base, ...cats.filter(c => c.count > 0)]; // Only show categories with issues
  }, [data, scoreItems]);

  const filteredIssues = useMemo(() => {
    if (!data) return [];
    if (activeTab === 'all') return data.report.issues;
    return data.report.issues.filter(i => i.type === activeTab);
  }, [data, activeTab]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 animate-pulse font-medium">Scanning project intelligence...</p>
      </div>
    );
  }

  if (!data || !data.report) {
    return <div className="p-8 text-center text-zinc-400">No intelligence data available.</div>;
  }

  const { report, history } = data;
  const { scores, grade, averageScore } = report;

  return (
    <motion.div 
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Intelligence Hub
            <span className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-sm font-mono shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              Grade {grade}
            </span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1">World Top 1 Standard Analysis</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 font-mono">
            {averageScore}<span className="text-xl text-zinc-600">/100</span>
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">Overall Score</div>
        </div>
      </motion.div>

      {/* Top Full Width: Advanced HUD */}
      <motion.div variants={itemVariants} className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 group hover:border-white/10 transition-colors flex flex-col mb-6 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.05),transparent_50%)]" />

        <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-4 text-center relative z-10 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" /> Global Systems Diagnostics
        </h3>
        <div className="w-full h-[320px] flex items-center justify-center relative z-10">
          <AdvancedHUDV1 scores={scores} isFullWidth={true} />
        </div>
      </motion.div>

      {/* Second Row: Visualizer & Trend/Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Visualizer 1 */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <motion.div variants={itemVariants} className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 group hover:border-white/10 transition-colors h-full flex flex-col">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 text-center">Core Balance</h3>
            <div className="flex-1 w-full min-h-[220px] flex items-center justify-center">
              <CleanMinimalistBars scores={scores} />
            </div>
          </motion.div>
        </div>



        {/* Right Col: Trend, Insights & Metrics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Chart */}
            <motion.div variants={itemVariants} className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 group hover:border-white/10 transition-colors">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 text-center">Intelligence Trend</h3>
              <div className="w-full h-[140px]">
                <TrendLineChart history={history} />
              </div>
            </motion.div>
            
            {/* Smart Insights */}
            <motion.div variants={itemVariants} className="flex-1">
              <SmartInsights grade={grade} scores={scores} issues={report.issues} />
            </motion.div>
          </div>

          {/* Metrics Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {scoreItems.map(item => (
              <div key={item.label} className="bg-white/[0.02] backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group transition-colors shadow-lg">
                <div className={`absolute bottom-0 left-0 h-1 ${item.bg} transition-all duration-1000 ease-out`} style={{ width: `${item.score}%` }} />
                <div className={`absolute inset-0 bg-gradient-to-t from-${item.color.split('-')[1]}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-inner">
                  {item.icon}
                </div>
                <div className={`text-2xl font-black font-mono ${item.color} relative z-10 drop-shadow-md`}>{item.score}</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1 font-bold relative z-10">{item.label}</div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Issues Section */}
      <motion.div variants={itemVariants} className="pt-4 border-t border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Actionable Issues
          </h3>
          <IssueFilterTabs 
            categories={filterCategories} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        </div>

        {filteredIssues.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-8 rounded-3xl text-center flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent" />
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 relative z-10">
              <Check className="w-8 h-8 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>
            <p className="text-xl font-bold relative z-10 text-white">Flawless execution!</p>
            <p className="text-emerald-400/80 mt-2 font-medium relative z-10">No issues found in this category. You are meeting the highest standards.</p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            {filteredIssues.map((issue, index) => {
              const Icon = scoreItems.find(s => s.id === issue.type)?.icon || <Zap className="w-4 h-4" />;
              const color = scoreItems.find(s => s.id === issue.type)?.color || 'text-zinc-400';
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={`${issue.type}-${index}`} 
                  className="bg-white/[0.02] backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group shadow-lg"
                >
                  <div className="flex gap-4 items-start min-w-0">
                    <div className="mt-1 shrink-0 w-10 h-10 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      {Icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-zinc-200 mb-1.5 leading-relaxed font-medium">{issue.message}</div>
                      <div className="text-[11px] font-mono text-zinc-500 truncate flex items-center gap-2">
                        <span className={`uppercase tracking-widest ${color} font-bold`}>{issue.type}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span className="truncate">{issue.file.split('/').slice(-3).join('/')}</span>
                        {issue.line && <span className="text-zinc-600">:{issue.line}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyPrompt(issue, index)}
                    className="shrink-0 flex items-center justify-center gap-2 bg-white/5 hover:bg-indigo-500/20 text-zinc-300 hover:text-indigo-300 border border-white/10 hover:border-indigo-500/30 px-5 py-2.5 rounded-xl text-sm font-bold transition-all group/btn w-full sm:w-auto shadow-sm"
                  >
                    {copiedId === index ? (
                      <><Check className="w-4 h-4 text-emerald-400" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4 group-hover/btn:scale-110 transition-transform text-indigo-400" /> Auto-Fix Prompt</>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
