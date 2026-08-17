import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useToast } from '../ToastProvider';
import HealthScoreGauge from '../health/HealthScoreGauge';
import { useHealthCommandCenter } from '../health/useHealthCommandCenter';
import AdvancedHUDV1 from '../intelligence/AdvancedHUDV1';
import CockpitHealthModal from './CockpitHealthModal';

export default function CockpitHealthOverview({ projectId, onOpenIntelligence }) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [isIntelligenceScanning, setIsIntelligenceScanning] = useState(false);

  const healthCenter = useHealthCommandCenter({ projectId, showToast });
  const { health, score, healthScore, qualityScore, scoreColor, breakdown, loading: isHealthScanning, fetchHealth } = healthCenter;

  const fetchIntelligence = useCallback(async (isManual = false) => {
    if (isManual) setIsIntelligenceScanning(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/intelligence`).then(r => r.json());
      if (res?.success) {
        setIntelligenceData(res.report);
        if (isManual) showToast("Intelligence radar re-scanned!", "success");
      }
    } catch {
      if (isManual) showToast("Failed to re-scan intelligence", "error");
    } finally {
      setIsIntelligenceScanning(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  const scores = intelligenceData?.scores || {
    performance: healthScore || 92,
    dynamic: qualityScore || 85,
    responsive: score || 88,
    a11y: 98,
    security: 100 - (breakdown?.criticalSecurity || 0) * 10
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Card 1: Health Fortress with Dedicated Re-scan */}
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
            onRescan={(e) => {
              e?.stopPropagation();
              fetchHealth();
            }}
            isScanning={isHealthScanning}
          />
        </div>

        {/* Card 2: Intelligence Hub with Dedicated Re-scan */}
        {onOpenIntelligence && (
          <div 
            onClick={onOpenIntelligence}
            className="group cursor-pointer hover:scale-[1.01] transition-transform active:scale-[0.99] h-full bg-gradient-to-b from-[#16161a] to-[#0e0e11] border border-white/[0.08] rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden min-h-[220px]"
            title="Click to open Full Intelligence Hub"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.03),transparent_60%)] pointer-events-none" />
            
            {/* Dedicated Re-scan button for Intelligence Hub */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchIntelligence(true);
              }}
              disabled={isIntelligenceScanning}
              className="absolute top-4 right-4 z-20 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 text-[11px] font-mono shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
              title="Re-scan Intelligence Hub"
            >
              <RefreshCw size={12} className={isIntelligenceScanning ? 'animate-spin text-cyan-400' : ''} />
              <span className="hidden sm:inline">Re-scan</span>
            </button>

            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
              <AdvancedHUDV1 
                isFullWidth={false} 
                scores={scores}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 w-full justify-center">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-bold text-white font-outfit">
                Intelligence Hub
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      <CockpitHealthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        {...healthCenter}
      />
    </>
  );
}
