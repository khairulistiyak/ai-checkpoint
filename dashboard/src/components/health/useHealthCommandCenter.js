import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchProjectHealth, triggerProjectAutofix } from '../../utils/api';
import { buildDiagnosticReportPrompt } from '../../utils/prompt-builder';
import { getCachedHealth, setCachedHealth } from '../../utils/scan-cache';

export function useHealthCommandCenter({ projectId, showToast }) {
  const [health, setHealth] = useState(() => getCachedHealth(projectId));
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHealth = useCallback(async (isManual = false) => {
    if (!projectId) return;
    if (isManual || !getCachedHealth(projectId)) setLoading(true);
    setError(null);
    try {
      const data = await fetchProjectHealth(projectId);
      setHealth(data);
      setCachedHealth(projectId, data);
    } catch (err) {
      setError(err.message || 'Failed to fetch project health');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!getCachedHealth(projectId)) {
      fetchHealth();
    }
  }, [projectId, fetchHealth]);

  const handleAutoFix = async () => {
    if (!projectId || fixing) return;
    setFixing(true);
    try {
      const res = await triggerProjectAutofix(projectId);
      showToast(res.message || 'Auto-fix completed successfully!', 'success');
      await fetchHealth();
    } catch (err) {
      showToast(`Auto-fix failed: ${err.message}`, 'error');
    } finally {
      setFixing(false);
    }
  };

  const handleCopyDiagnosticReport = () => {
    if (!health) return;
    const report = buildDiagnosticReportPrompt({
      projectId,
      score: health.score,
      healthScore: health.healthScore,
      qualityScore: health.qualityScore,
      passed: health.passed,
      filesScanned: health.filesScanned,
      issues: health.issues || [],
      breakdown: health.breakdown || {}
    });
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    showToast('AI Diagnostic Report copied to clipboard!', 'success');
    setTimeout(() => setCopiedReport(false), 2200);
  };

  const handleOpenInIde = async (filePath, line = 1) => {
    if (!filePath) return;
    try {
      showToast(`Opening ${filePath.split('/').pop()} in IDE...`, 'info');
      const res = await fetch('/api/open-in-ide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, line, projectId })
      }).then(r => r.json()).catch(() => null);

      if (!res?.opened && res?.url) {
        window.location.href = res.url;
      }
    } catch {
      window.location.href = `vscode://file/${filePath}${line ? `:${line}` : ''}`;
    }
  };

  const score = health?.score ?? 100;
  const healthScore = health?.healthScore ?? score;
  const qualityScore = health?.qualityScore ?? score;
  const scoreColor = !health ? '#888' : score >= 90 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';

  const breakdown = health?.breakdown || {
    syntaxErrors: 0, brokenImports: 0, rule0Violations: 0, criticalSecurity: 0,
    warningSecurity: 0, hygieneIssues: 0, complexityIssues: 0, structureIssues: 0,
    dependencyIssues: 0, configIssues: 0
  };

  const issues = health?.issues || [];
  const checks = health?.checks || [];

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const cat = issue.category || issue.type;
      const matchCategory =
        activeCategory === 'all' ? true :
        activeCategory === 'security' ? (cat === 'security' || issue.severity === 'critical') :
        activeCategory === 'rule0' ? (cat === 'rule0' || issue.type === 'rule0') :
        activeCategory === 'syntax' ? (cat === 'syntax' || cat === 'imports' || issue.type === 'broken-import') :
        activeCategory === 'hygiene' ? (cat === 'hygiene' || issue.type === 'debug-log' || issue.type === 'todo-comment') :
        activeCategory === 'complexity' ? (cat === 'complexity') :
        activeCategory === 'structure' ? (cat === 'structure' || issue.type === 'junk-file') : true;

      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (issue.file && issue.file.toLowerCase().includes(q)) ||
        (issue.error && issue.error.toLowerCase().includes(q)) ||
        (issue.type && issue.type.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [issues, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => ({
    all: issues.length,
    security: issues.filter(i => i.category === 'security' || i.severity === 'critical').length,
    rule0: issues.filter(i => i.category === 'rule0' || i.type === 'rule0').length,
    syntax: issues.filter(i => i.category === 'syntax' || i.category === 'imports' || i.type === 'broken-import').length,
    hygiene: issues.filter(i => i.category === 'hygiene' || i.type === 'debug-log' || i.type === 'todo-comment').length,
    complexity: issues.filter(i => i.category === 'complexity').length,
    structure: issues.filter(i => i.category === 'structure' || i.type === 'junk-file').length,
  }), [issues]);

  return {
    health, loading, fixing, copiedReport, error, activeCategory, setActiveCategory,
    searchQuery, setSearchQuery, fetchHealth, handleAutoFix, handleCopyDiagnosticReport,
    handleOpenInIde, score, healthScore, qualityScore, scoreColor, breakdown,
    issues, checks, filteredIssues, categoryCounts
  };
}
