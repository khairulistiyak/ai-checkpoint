import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import { useToast } from '../ToastProvider';
import HealthScoreGauge from '../health/HealthScoreGauge';
import { useHealthCommandCenter } from '../health/useHealthCommandCenter';
import AdvancedHUDV1 from '../intelligence/AdvancedHUDV1';
import CockpitHealthModal from './CockpitHealthModal';
import CockpitProgressCard from './CockpitProgressCard';
import { getCachedIntelligence, setCachedIntelligence } from '../../utils/scan-cache';

export default function CockpitHealthOverview({
  projectId,
  overall,
  remaining,
  allPhases,
  activePhases,
  planStats,
  totalPlanSteps,
  onOpenArchitect,
  onOpenIntelligence
}) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [intelligenceData, setIntelligenceData] = useState(() => getCachedIntelligence(projectId));
  const [isIntelligenceScanning, setIsIntelligenceScanning] = useState(false);

  const healthCenter = useHealthCommandCenter({ projectId, showToast });
  const { health, score, healthScore, qualityScore, scoreColor, breakdown, loading: isHealthScanning, fetchHealth } = healthCenter;

  const fetchIntelligence = useCallback(async (isManual = false) => {
    if (isManual || !getCachedIntelligence(projectId)) setIsIntelligenceScanning(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/intelligence`).then(r => r.json());
      if (res?.success) {
        setIntelligenceData(res.report);
        setCachedIntelligence(projectId, res.report);
        if (isManual) showToast("Intelligence radar re-scanned!", "success");
      }
    } catch {
      if (isManual) showToast("Failed to re-scan intelligence", "error");
    } finally {
      setIsIntelligenceScanning(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    if (!getCachedIntelligence(projectId)) {
      fetchIntelligence();
    }
  }, [projectId, fetchIntelligence]);

  const scores = intelligenceData?.scores || {
    performance: healthScore || 92,
    dynamic: qualityScore || 85,
    responsive: score || 88,
    a11y: 98,
    security: 100 - (breakdown?.criticalSecurity || 0) * 10
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
        {/* Card 1: Roadmap & Progress KPI */}
        <CockpitProgressCard
          overall={overall}
          remaining={remaining}
          allPhases={allPhases}
          activePhases={activePhases}
          planStats={planStats}
          totalPlanSteps={totalPlanSteps}
          onOpenArchitect={onOpenArchitect}
        />

        {/* Card 2: Health Fortress with Re-scan */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="group cursor-pointer hover:scale-[1.01] transition-transform active:scale-[0.99] h-full relative"
          title="Click to view detailed Health breakdown"
        >
          <HealthScoreGauge
            score={score}
            scoreColor={scoreColor}
            healthScore={healthScore}
            qualityScore={qualityScore}
            filesScanned={health?.filesScanned || 0}
            passed={health?.passed || false}
            onRescan={() => fetchHealth(true)}
            isScanning={isHealthScanning}
          />
        </div>

        {/* Card 3: Intelligence Hub Radar */}
        {onOpenIntelligence && (
          <div 
            onClick={onOpenIntelligence}
            className="group cursor-pointer hover:scale-[1.01] transition-transform active:scale-[0.99] h-full bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[14rem]"
            title="Click to open Full Intelligence Hub"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10 w-full">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
                  <Radio className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <span className="text-xs font-mono font-medium text-zinc-400">AI Intelligence</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchIntelligence(true);
                }}
                disabled={isIntelligenceScanning}
                className="px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-mono shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
                title="Re-scan Intelligence Hub"
              >
                <RefreshCw size={11} className={isIntelligenceScanning ? 'animate-spin text-cyan-400' : ''} />
                <span>Re-scan</span>
              </button>
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center my-1">
              <AdvancedHUDV1 isFullWidth={false} scores={scores} />
            </div>
            
            <div className="flex items-center gap-1.5 pt-2.5 border-t border-white/[0.04] w-full justify-center text-xs font-mono text-zinc-400 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-zinc-300 font-outfit text-xs font-medium">Intelligence Radar</span>
            </div>
          </div>
        )}
      </div>

      <CockpitHealthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        {...healthCenter}
      />
    </>
  );
}
