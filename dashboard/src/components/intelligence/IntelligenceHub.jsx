import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Sparkles, RefreshCw, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../ToastProvider';
import { fetchProjectIntelligence } from '../../utils/api';
import ActionableIssuesList from './ActionableIssuesList';
import AdvancedHUDV1 from './AdvancedHUDV1';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

export default function IntelligenceHub({ project }) {
  const [data, setData] = useState(null), [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false), [copiedFixPrompt, setCopiedFixPrompt] = useState(false);
  const { showToast } = useToast();

  const fetchIntelligence = useCallback(async (isManual = false) => {
    if (isManual) setIsScanning(true);
    try {
      const res = await fetchProjectIntelligence(project.id);
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
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.05] pr-12 sm:pr-14">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 shrink-0 shadow-sm">
            <Activity className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-outfit">Intelligence Hub</h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-mono font-medium shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                <span>Grade {grade}</span>
              </div>
            </div>
            <p className="text-zinc-500 text-xs font-mono mt-0.5">Code Quality & Architectural Intelligence Radar</p>
          </div>
        </div>

        {/* Right Action & Metric Cluster */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyFixPrompt}
            disabled={isScanning || !report}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.08] hover:border-white/[0.16] text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-95 shadow-sm"
            title="Copy structured diagnostic prompt for AI to fix all issues"
          >
            {copiedFixPrompt ? <Check size={13} className="text-emerald-400" /> : <Sparkles size={13} className="text-zinc-400" />}
            <span>{copiedFixPrompt ? 'Prompt Copied' : 'Fix Prompt'}</span>
          </button>

          <button
            onClick={() => fetchIntelligence(true)}
            disabled={isScanning}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.08] hover:border-white/[0.16] text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-95 shadow-sm"
            title="Run continuous live diagnostic scan"
          >
            <RefreshCw size={13} className={`text-zinc-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Re-scan'}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl font-mono shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Score</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-white tracking-tight">{averageScore}</span>
              <span className="text-[10px] text-zinc-600 font-medium">/100</span>
            </div>
          </div>
        </div>
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
