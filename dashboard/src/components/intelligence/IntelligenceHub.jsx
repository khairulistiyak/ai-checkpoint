import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Sparkles, RefreshCw, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../ToastProvider';
import ActionableIssuesList from './ActionableIssuesList';
import AdvancedHUDV1 from './AdvancedHUDV1';
import SmartInsights from './SmartInsights';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function IntelligenceHub({ project }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [copiedFixPrompt, setCopiedFixPrompt] = useState(false);
  const { showToast } = useToast();

  const fetchIntelligence = useCallback(async (isManual = false) => {
    if (isManual) setIsScanning(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/intelligence`).then(r => r.json());
      if (res?.success) {
        setData(res);
        if (isManual) showToast("Intelligence re-scan complete!", "success");
      }
    } catch {
      if (isManual) showToast("Failed to re-scan intelligence", "error");
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  }, [project.id, showToast]);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  const handleCopyFixPrompt = () => {
    if (!data?.report) return;
    const { issues = [], grade, averageScore, scores } = data.report;
    const promptHeader = `# AI Intelligence Fix Request\nProject: ${project.name}\nScore: ${averageScore}/100 (Grade ${grade})\n\n### Scores Breakdown:\n- Responsive: ${scores?.responsive || 0}%\n- Dynamic: ${scores?.dynamic || 0}%\n- Performance: ${scores?.performance || 0}%\n- A11y: ${scores?.a11y || 0}%\n- Security: ${scores?.security || 0}%\n\n### Issues to Fix (${issues.length} detected):\n`;
    const issuesList = issues.map((iss, i) => `${i + 1}. [${(iss.type || 'info').toUpperCase()}] ${iss.file || 'General'}${iss.line ? `:${iss.line}` : ''}\n   Issue: ${iss.message}\n   Fix: ${iss.prompt || iss.message}`).join('\n\n');
    const fullText = `${promptHeader}\n${issuesList}\n\nPlease fix all issues step-by-step to reach Grade A+ (100/100).`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopiedFixPrompt(true);
      showToast("Fix Prompt copied to clipboard!", "success");
      setTimeout(() => setCopiedFixPrompt(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 animate-pulse font-medium">Scanning project intelligence...</p>
      </div>
    );
  }

  if (!data || !data.report) {
    return <div className="p-8 text-center text-zinc-400">No intelligence data available.</div>;
  }

  const { report } = data;
  const { scores, grade, averageScore, issues = [] } = report;

  return (
    <motion.div className="p-6 space-y-6" variants={containerVariants} initial="hidden" animate="show">
      {/* Modern Clean Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.05] pr-12">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0 shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-outfit">Intelligence Hub</h2>
              <span className="bg-white/[0.04] text-zinc-300 border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                <span>🥇 Grade {grade}</span>
              </span>
            </div>
            <p className="text-zinc-400 text-xs font-mono mt-0.5">Code Quality & Architectural Intelligence Radar</p>
          </div>
        </div>

        {/* Right Action & Metric Cluster */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCopyFixPrompt}
            disabled={isScanning || !report}
            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm"
            title="Copy structured diagnostic prompt for AI to fix all issues"
          >
            {copiedFixPrompt ? <Check size={14} className="text-purple-300" /> : <Sparkles size={14} className="text-purple-400" />}
            <span>{copiedFixPrompt ? 'Copied!' : 'Fix Prompt'}</span>
          </button>

          <button
            onClick={() => fetchIntelligence(true)}
            disabled={isScanning}
            className="bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm"
            title="Run continuous live diagnostic scan"
          >
            <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Scanning...' : 'Re-scan'}</span>
          </button>

          <div className="flex items-center gap-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl px-3.5 py-1.5 transition-all">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Score</span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-white tracking-tight">{averageScore}</span>
                <span className="text-[11px] text-zinc-500 font-semibold">/100</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Smart Insights Banner */}
      <motion.div variants={itemVariants}>
        <SmartInsights grade={grade} scores={scores || {}} issues={issues} />
      </motion.div>

      {/* Top Full Width: Advanced HUD */}
      <motion.div variants={itemVariants} className="w-full flex flex-col mb-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none" />

        <h3 className="text-[0.625rem] font-bold text-zinc-400 uppercase tracking-widest mb-0 mt-2 text-center relative z-10 flex items-center justify-center gap-2 opacity-80">
          <Activity className="w-3 h-3 text-zinc-400" /> Core Balance
        </h3>
        <div className="w-full h-[clamp(15rem,25vw,20rem)] flex items-center justify-center relative z-10">
          <AdvancedHUDV1 scores={scores} isFullWidth={true} />
        </div>
      </motion.div>

      {/* Issues Section */}
      <ActionableIssuesList issues={data.report.issues} projectId={project.id} />
    </motion.div>
  );
}
