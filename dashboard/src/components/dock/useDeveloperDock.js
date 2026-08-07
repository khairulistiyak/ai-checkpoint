import { useState } from 'react';
import * as api from '../../utils/api';

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

  const activeTargetStep = runningStep || nextStep;
  const isAllComplete = !activeTargetStep;
  const isRunning = !runningStep;
  const stepNumber = activeTargetStep?.number || '';
  const rawTitle = activeTargetStep?.title || '';

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
    const prompt = `Execute Step ${stepNumber} — ${cleanTitle}\n\nProject Root: ${project.path || project.id}\nTarget File: ${filePath || 'Check plan file'}\nStatus: ${isRunning ? 'In Progress' : 'Pending'}\n\nGuidelines & Conventions:\n1. 1 step = 1 file — finish one before starting the next\n2. Start step: ./l start ${stepNumber}\n3. Implement necessary modifications for ${cleanTitle}\n4. Complete step: ./l c ${stepNumber} "Completed: ${cleanTitle}"\n5. Verify changes with tests or build before finalizing.`;
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
    handleQuickHealth
  };
}
