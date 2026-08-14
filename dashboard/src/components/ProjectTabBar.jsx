import React, { useEffect } from 'react';
import {
  Activity,
  ListTodo,
  FileCode,
  Terminal,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProjectTabItem from './project/ProjectTabItem';

export default function ProjectTabBar({
  activeTab,
  setActiveTab,
  overall = { percentage: 0, completed: 0, total: 0 },
  planStats,
  healthScore
}) {
  const tabs = [
    {
      id: 'cockpit',
      label: 'Cockpit Overview',
      icon: Activity,
      hotkey: '1',
      accentColor: '#38bdf8',
      glowBorder: 'border-sky-500/40',
      activeText: 'text-sky-300',
      badge: `${overall.percentage}%`,
      badgeStyle: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    },
    {
      id: 'roadmap',
      label: 'Roadmap & Steps',
      icon: ListTodo,
      hotkey: '2',
      accentColor: '#818cf8',
      glowBorder: 'border-indigo-500/40',
      activeText: 'text-indigo-300',
      badge: `${overall.completed}/${overall.total}`,
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'files',
      label: 'Plan Blueprints',
      icon: FileCode,
      hotkey: '3',
      accentColor: '#60a5fa',
      glowBorder: 'border-blue-500/40',
      activeText: 'text-blue-300',
      badge: planStats?.files?.length || 0,
      badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      id: 'commands',
      label: 'Run & Commands',
      icon: Terminal,
      hotkey: '4',
      accentColor: '#fbbf24',
      glowBorder: 'border-amber-500/40',
      activeText: 'text-amber-300',
      badge: '⚡ CLI',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold'
    },
    {
      id: 'audit',
      label: 'Audit & Rules',
      icon: ShieldCheck,
      hotkey: '5',
      accentColor: '#34d399',
      glowBorder: 'border-emerald-500/40',
      activeText: 'text-emerald-300',
      badge: '🛡️ Enforced',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'health',
      label: 'Health & Quality',
      icon: ShieldAlert,
      hotkey: '6',
      accentColor: '#f43f5e',
      glowBorder: 'border-rose-500/40',
      activeText: 'text-rose-300',
      badge: healthScore ? `${healthScore}/100` : 'Audit',
      badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
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

  return (
    <div className="relative w-full z-20">
      {/* Clean Minimal Dock Container */}
      <div className="bg-[#0e0e11]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex items-center justify-between gap-2 shadow-xl relative overflow-hidden">
        {/* Navigation Tabs List Container */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar p-0.5 min-w-0 relative w-full scroll-smooth [-webkit-overflow-scrolling:touch]">
          <div className="flex items-center gap-1 sm:gap-1.5 w-full min-w-max pr-6 sm:pr-0 pb-1 sm:pb-0">
            {tabs.map((tab) => (
              <ProjectTabItem
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>
        {/* Touch-friendly scroll fade indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0e0e11] to-transparent pointer-events-none sm:hidden z-10" />
      </div>
    </div>
  );
}
