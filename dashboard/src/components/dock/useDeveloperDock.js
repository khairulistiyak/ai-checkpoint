import { useState, useEffect, useMemo } from 'react';
import * as api from '../../utils/api';
import { buildStepExecutionPrompt } from '../../utils/prompt-builder';

export function useDeveloperDock({
  project,
  nextStep,
  runningStep,
  onRefresh,
  showToast
}) {
  const [executing, setExecuting] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const activeTargetStep = runningStep || nextStep;
  const isAllComplete = !activeTargetStep;
  const isRunning = Boolean(runningStep);
  const stepNumber = activeTargetStep?.number || '';
  const rawTitle = activeTargetStep?.title || '';

  useEffect(() => {
    if (!isRunning) {
      setElapsedSeconds(0);
      return;
    }
    const timer = setInterval(() => setElapsedSeconds((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning, stepNumber]);

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, [elapsedSeconds]);

  const fileMatch = rawTitle.match(/[`(]([^`)]+\.[a-zA-Z0-9]+)[`)]/);
  const filePath = activeTargetStep?.file || (fileMatch ? fileMatch[1] : '');

  let cleanTitle = rawTitle;
  if (fileMatch) cleanTitle = cleanTitle.replace(fileMatch[0], '');
  cleanTitle = cleanTitle.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '').replace(/`\s*`/g, '').trim();

  const handleExecute = async () => {
    if (!activeTargetStep) return;
    try {
      setExecuting(true);
      const cmd = isRunning ? 'complete' : 'start';
      const note = isRunning ? `Completed step ${stepNumber}` : '';
      await api.executeCommand(project.id, cmd, stepNumber, note);
      if (onRefresh) await onRefresh();
      showToast(`Step ${stepNumber} ${isRunning ? 'completed' : 'started'}!`, 'success');
    } catch (err) {
      showToast(`Execution failed: ${err.message}`, 'error');
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyAiPrompt = () => {
    if (!activeTargetStep) return;
    const prompt = buildStepExecutionPrompt({
      stepNumber,
      title: cleanTitle,
      filePath,
      projectPath: project.path || project.id,
      status: isRunning ? 'running' : 'pending',
      doneCheck: './l v && npm test'
    });
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    showToast(`AI Prompt for Step ${stepNumber} copied!`, 'success');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyCliCommand = () => {
    if (!activeTargetStep) return;
    const cmd = isRunning ? `./l c ${stepNumber} "Completed ${cleanTitle}"` : `./l start ${stepNumber}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    showToast(`Copied: ${cmd}`, 'success');
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleOpenIde = () => {
    if (!filePath) {
      showToast('No target file declared for this step', 'warning');
      return;
    }
    const fullPath = project.path ? `${project.path}/${filePath}` : filePath;
    window.location.href = `vscode://file/${fullPath}`;
    showToast(`Opening ${filePath} in IDE...`, 'info');
  };

  const handleQuickHealth = async () => {
    try {
      setExecuting(true);
      await api.executeCommand(project.id, 'health');
      if (onRefresh) await onRefresh();
      showToast('Health scan completed successfully', 'success');
    } catch (err) {
      showToast(`Health check failed: ${err.message}`, 'error');
    } finally {
      setExecuting(false);
    }
  };

  return {
    executing,
    copiedPrompt,
    copiedCli,
    isMinimized,
    setIsMinimized,
    activeTargetStep,
    isAllComplete,
    isRunning,
    stepNumber,
    cleanTitle,
    filePath,
    handleExecute,
    handleCopyAiPrompt,
    handleCopyCliCommand,
    handleOpenIde,
    handleQuickHealth,
    elapsedSeconds,
    formattedTimer
  };
}
