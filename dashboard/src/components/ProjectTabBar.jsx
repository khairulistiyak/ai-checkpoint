import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  ListTodo, 
  FileCode, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Info,
  CheckCircle2,
  ChevronRight,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectTabBar({
  activeTab,
  setActiveTab,
  overall = { percentage: 0, completed: 0, total: 0 },
  planStats,
  healthScore
}) {
  const [hoveredTab, setHoveredTab] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  const tabs = [
    {
      id: 'cockpit',
      label: 'Cockpit Overview',
      shortLabel: 'Cockpit',
      subtitle: 'Mission Control & KPIs',
      icon: Activity,
      hotkey: '1',
      color: 'sky',
      accentColor: '#38bdf8',
      glowBorder: 'border-sky-500/40',
      activeText: 'text-sky-300',
      badge: `${overall.percentage}%`,
      badgeStyle: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      purpose: 'Real-time Project Mission Control',
      description: 'High-level velocity, KPI overview, active phase highlights, and live execution activity stream.',
      features: [
        'Real-time completion percentage',
        'Active phase progress trackers',
        'Milestone velocity meters',
        'Live stream of ledger events'
      ]
    },
    {
      id: 'roadmap',
      label: 'Roadmap & Steps',
      shortLabel: 'Roadmap',
      subtitle: 'Phase Checklist & Steps',
      icon: ListTodo,
      hotkey: '2',
      color: 'indigo',
      accentColor: '#818cf8',
      glowBorder: 'border-indigo-500/40',
      activeText: 'text-indigo-300',
      badge: `${overall.completed}/${overall.total}`,
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      purpose: 'Phase Checklist & Task Ledger',
      description: 'Explore the full structured roadmap, check off steps, view logs, and analyze dependencies.',
      features: [
        'Phase-by-phase step breakdown',
        'Status filtering (Done, Running, Pending)',
        'Fast search across step titles',
        'Step details & action verification'
      ]
    },
    {
      id: 'files',
      label: 'Plan Blueprints',
      shortLabel: 'Blueprints',
      subtitle: 'Specs & Architectures',
      icon: FileCode,
      hotkey: '3',
      color: 'blue',
      accentColor: '#60a5fa',
      glowBorder: 'border-blue-500/40',
      activeText: 'text-blue-300',
      badge: planStats?.files?.length || 0,
      badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      purpose: 'Architecture Specs & Phase Plans',
      description: 'Read and inspect markdown plan files, prompt specs, and step architectures.',
      features: [
        'Markdown plan viewer with syntax formatting',
        'Plan file metadata & step count',
        'Architect quick preview drawer',
        'Direct prompt generation copy'
      ]
    },
    {
      id: 'commands',
      label: 'Run & Commands',
      shortLabel: 'Run Panel',
      subtitle: 'Interactive CLI & Runner',
      icon: Terminal,
      hotkey: '4',
      color: 'amber',
      accentColor: '#fbbf24',
      glowBorder: 'border-amber-500/40',
      activeText: 'text-amber-300',
      badge: '⚡ CLI',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold',
      purpose: 'Interactive CLI & Command Runner',
      description: 'Run project scripts and ledger commands with real-time streaming terminal logs.',
      features: [
        'One-click command executor (start, complete, sync)',
        'Live output terminal feed',
        'Custom script runner',
        'Quick shortcut buttons'
      ]
    },
    {
      id: 'audit',
      label: 'Audit & Rules',
      shortLabel: 'Rules',
      subtitle: 'Conventions & Guardrails',
      icon: ShieldCheck,
      hotkey: '5',
      color: 'emerald',
      accentColor: '#34d399',
      glowBorder: 'border-emerald-500/40',
      activeText: 'text-emerald-300',
      badge: '🛡️ Enforced',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      purpose: 'Coding Conventions & Agent Rules',
      description: 'Manage .agents/RULES.md, strict architectural guidelines, and validation protocols.',
      features: [
        'Agent behavioral constraints',
        'Coding style guide preview',
        'Strict 1-step = 1-file rulebook',
        'Project configuration viewer'
      ]
    },
    {
      id: 'health',
      label: 'Health & Quality',
      shortLabel: 'Health',
      subtitle: 'Deep Quality Scanner',
      icon: ShieldAlert,
      hotkey: '6',
      color: 'rose',
      accentColor: '#f43f5e',
      glowBorder: 'border-rose-500/40',
      activeText: 'text-rose-300',
      badge: healthScore ? `${healthScore}/100` : 'Audit',
      badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      purpose: 'Deep Quality Scanner & Cleaner',
      description: 'Analyze code quality score, detect dead files & bloat, run security audits, and auto-clean.',
      features: [
        'Quality score (0-100) benchmark',
        'Dead code & unused asset detector',
        'Disk space & cache analyzer',
        'One-click auto-cleaner engine'
      ]
    }
  ];

  // Keyboard navigation (1-6)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= tabs.length) {
        const targetTab = tabs[num - 1];
        if (targetTab) {
          setActiveTab(targetTab.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, setActiveTab]);

  const handleMouseEnter = (tab) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredTab(tab);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTab(null);
    }, 150);
  };

  return (
    <div className="relative w-full z-20" ref={containerRef}>
      {/* Outer Dock Container */}
      <div className="bg-[#0e0e11]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-1.5 flex items-center justify-between gap-2 shadow-2xl shadow-black/60 overflow-visible relative">
        
        {/* Navigation Tabs List */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar min-w-max p-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isHovered = hoveredTab?.id === tab.id;

            return (
              <div
                key={tab.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(tab)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setActiveTab(tab.id)}
                  aria-label={tab.label}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer select-none group ${
                    isActive 
                      ? `${tab.activeText} font-bold z-10` 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Sliding Active Indicator Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="projectTabActiveIndicator"
                      className={`absolute inset-0 rounded-xl bg-white/[0.06] border ${tab.glowBorder} shadow-lg backdrop-blur-md -z-10`}
                      style={{
                        boxShadow: `0 0 20px -3px ${tab.accentColor}25, 0 0 0 1px ${tab.accentColor}30`
                      }}
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                    />
                  )}

                  {/* Icon with glow & active accent */}
                  <div className={`relative flex items-center justify-center transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <Icon 
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isActive ? tab.activeText : 'text-zinc-400 group-hover:text-zinc-200'
                      }`} 
                    />
                    {isActive && (
                      <span 
                        className="absolute inset-0 blur-sm opacity-50 -z-10"
                        style={{ color: tab.accentColor }}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Tab Label */}
                  <span className="tracking-tight whitespace-nowrap">
                    {tab.label}
                  </span>

                  {/* Smart Badge */}
                  {tab.badge !== undefined && (
                    <span 
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-all duration-200 border ${
                        isActive 
                          ? tab.badgeStyle 
                          : 'bg-white/[0.04] text-zinc-400 border-white/[0.06] group-hover:text-zinc-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}

                  {/* Hotkey Indicator Tag */}
                  <span className="hidden lg:inline-block text-[9px] px-1 py-0.2 rounded font-mono text-zinc-500 bg-white/[0.02] border border-white/[0.04] opacity-60 group-hover:opacity-100 transition-opacity">
                    {tab.hotkey}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Side Live Status / Helper Utilities */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] font-mono text-zinc-400 shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase">Live Ledger</span>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500 text-[10px] flex items-center gap-1">
            <span>Keys</span>
            <kbd className="px-1 py-0.2 rounded bg-white/[0.05] border border-white/10 text-[9px] text-zinc-300 font-mono">1-6</kbd>
          </span>
        </div>
      </div>

      {/* Rich Purpose Hover Card (Floating Tooltip) */}
      <AnimatePresence>
        {hoveredTab && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-2.5 p-4 rounded-2xl bg-[#121216]/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 z-50 max-w-lg pointer-events-none"
            style={{
              boxShadow: `0 20px 40px -15px rgba(0,0,0,0.8), 0 0 25px -5px ${hoveredTab.accentColor}20`
            }}
          >
            {/* Header with Icon, Title, and Hotkey */}
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${hoveredTab.accentColor}15`,
                    borderColor: `${hoveredTab.accentColor}35`,
                    color: hoveredTab.accentColor
                  }}
                >
                  <hoveredTab.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <span>{hoveredTab.label}</span>
                    <span 
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${hoveredTab.accentColor}15`,
                        borderColor: `${hoveredTab.accentColor}30`,
                        color: hoveredTab.accentColor
                      }}
                    >
                      {hoveredTab.subtitle}
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400 font-medium">
                    {hoveredTab.purpose}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white/[0.05] px-2 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-zinc-300 shrink-0">
                <span className="text-zinc-500 text-[10px]">Switch:</span>
                <kbd className="font-bold text-zinc-200">[{hoveredTab.hotkey}]</kbd>
              </div>
            </div>

            {/* Description Body */}
            <p className="text-xs text-zinc-300/90 leading-relaxed mb-3">
              {hoveredTab.description}
            </p>

            {/* Feature Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/[0.04]">
              {hoveredTab.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                  <CheckCircle2 
                    className="w-3.5 h-3.5 mt-0.5 shrink-0" 
                    style={{ color: hoveredTab.accentColor }}
                  />
                  <span className="leading-tight">{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
