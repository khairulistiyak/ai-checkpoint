import { useState, useEffect, useRef } from 'react';
import { Zap, Activity, ShieldCheck, Sparkles, Layers, CheckCircle2 } from 'lucide-react';
import * as api from '../../utils/api';

export function useTerminalDrawer({ isOpen, onClose, projectId, showToast }) {
  const [logs, setLogs] = useState([
    {
      id: 1,
      type: 'system',
      text: '⚡ AI Checkpoint Interactive Terminal initialized. Type commands below or click Fast Actions.',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [runningCmd, setRunningCmd] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [copiedLogId, setCopiedLogId] = useState(null);
  const [wrapLines, setWrapLines] = useState(true);

  const logsEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const executeCustomCommand = async (commandString) => {
    const cmd = commandString.trim();
    if (!cmd || runningCmd) return;

    setRunningCmd(cmd);
    setHistory(prev => [...prev.filter(h => h !== cmd), cmd]);
    setHistoryIdx(-1);

    const inputEntryId = Date.now();
    const timeStr = new Date().toLocaleTimeString();

    setLogs(prev => [...prev, { id: inputEntryId, type: 'input', text: cmd, time: timeStr }]);
    setInputVal('');

    try {
      const res = await api.executeCommand(projectId, '', '', '', cmd);
      const outputText = typeof res === 'string'
        ? res
        : res?.output || res?.message || (res ? JSON.stringify(res, null, 2) : 'Command completed.');

      setLogs(prev => [
        ...prev,
        { id: inputEntryId + 1, type: 'output', text: outputText, time: new Date().toLocaleTimeString(), cmd }
      ]);
      showToast(`Completed: ${cmd}`, 'success');
    } catch (err) {
      setLogs(prev => [
        ...prev,
        { id: inputEntryId + 1, type: 'error', text: err.message || 'Execution error', time: new Date().toLocaleTimeString(), cmd }
      ]);
      showToast(`Failed: ${err.message}`, 'error');
    } finally {
      setRunningCmd(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const quickActionGroups = [
    { label: 'Sync Plans', cmd: './l sync', icon: Zap, color: 'text-amber-400', action: () => executeCustomCommand('./l sync') },
    { label: 'Verify Status', cmd: './l status', icon: Activity, color: 'text-sky-400', action: () => executeCustomCommand('./l status') },
    { label: 'Quality Check', cmd: './l quality', icon: ShieldCheck, color: 'text-emerald-400', action: () => executeCustomCommand('./l quality') },
    { label: 'Health Scan', cmd: './l health', icon: Sparkles, color: 'text-purple-400', action: () => executeCustomCommand('./l health') },
    { label: 'Lint Plans', cmd: './l lint-plan', icon: Layers, color: 'text-pink-400', action: () => executeCustomCommand('./l lint-plan') },
    { label: 'Cleanup Verify', cmd: 'bash tests/cleanup-verify.sh', icon: CheckCircle2, color: 'text-teal-400', action: () => executeCustomCommand('bash tests/cleanup-verify.sh') },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      executeCustomCommand(inputVal);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    }
  };

  const handleCopySingle = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    showToast('Copied output to clipboard', 'info');
    setTimeout(() => setCopiedLogId(null), 1800);
  };

  const handleCopyAll = () => {
    const full = logs.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(full);
    showToast('All terminal logs copied!', 'success');
  };

  const handleClear = () => {
    setLogs([{ id: Date.now(), type: 'system', text: 'Terminal buffer cleared.', time: new Date().toLocaleTimeString() }]);
    showToast('Buffer cleared', 'info');
  };

  return {
    logs, runningCmd, isMaximized, setIsMaximized, inputVal, setInputVal,
    copiedLogId, wrapLines, setWrapLines, logsEndRef, inputRef,
    quickActionGroups, handleSubmit, handleKeyDown, handleCopySingle,
    handleCopyAll, handleClear
  };
}
