import React, { useState, useEffect, useRef } from 'react';
import {
  Save, RotateCcw, Check, Loader2, FileCode, AlertCircle,
  Sparkles, Terminal, Code2, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlanMarkdownToolbar from '../plan/PlanMarkdownToolbar';

export default function PlanMarkdownEditor({
  initialContent,
  filename,
  onSave,
  saving = false
}) {
  const [content, setContent] = useState(initialContent || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dirty, setDirty] = useState(false);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    setContent(initialContent || '');
    setDirty(false);
  }, [initialContent]);

  const handleChange = (e) => {
    setContent(e.target.value);
    setDirty(e.target.value !== initialContent);
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSave = async () => {
    if (!onSave || saving) return;
    try {
      await onSave(content);
      setDirty(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    if (window.confirm('Discard all unsaved changes to this plan?')) {
      setContent(initialContent || '');
      setDirty(false);
    }
  };

  // Keyboard shortcut Ctrl/Cmd + S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, saving, onSave]);

  const insertSnippet = (template) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = before + template + after;
    setContent(newContent);
    setDirty(newContent !== initialContent);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + template.length;
    }, 0);
  };

  const lines = (content || '').split('\n');
  const lineCount = lines.length;

  return (
    <div className="flex flex-col h-full w-full bg-[#0d0d12]/95 backdrop-blur-3xl rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative">
      {/* Editor Sub-Header Toolbar */}
      <PlanMarkdownToolbar
        filename={filename}
        dirty={dirty}
        lineCount={lineCount}
        insertSnippet={insertSnippet}
        handleReset={handleReset}
        handleSave={handleSave}
        saving={saving}
        savedSuccess={savedSuccess}
      />

      {/* Editor Body with Monospace Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="select-none py-5 px-3 text-right text-white/30 bg-black/40 border-r border-white/5 overflow-hidden font-mono min-w-[3.5rem]"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="h-6 leading-6 text-xs opacity-70 hover:opacity-100 transition-opacity">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Live Textarea Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onScroll={handleScroll}
          spellCheck={false}
          className="flex-1 h-full w-full py-5 px-5 bg-transparent text-[#e2e8f0] font-mono text-sm leading-6 resize-none outline-none custom-scrollbar selection:bg-cyber-accent/30 selection:text-white"
          placeholder="Enter architectural plan specification markdown here..."
        />
      </div>
    </div>
  );
}
