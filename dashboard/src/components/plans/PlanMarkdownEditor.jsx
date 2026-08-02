import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, RotateCcw, Check, Loader2, FileCode, AlertCircle, 
  Sparkles, Terminal, Code2, Plus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex flex-col h-full w-full bg-[#070709] rounded-xl border border-white/15 overflow-hidden shadow-2xl">
      {/* Editor Sub-Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0e0e12] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/70">
            <FileCode className="w-3.5 h-3.5 text-white/50" />
            <span className="font-bold text-white">{filename}</span>
            {dirty && (
              <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved Changes
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-white/40 hidden sm:inline">
            • {lineCount} lines
          </span>
        </div>

        {/* Quick Insert Snippets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => insertSnippet('\n### Step X.Y — Step Title\n- Target: `path/to/file`\n- Acceptance: Criteria here\n')}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
            title="Insert standard Step block"
          >
            <Plus className="w-3 h-3" />
            <span>+ Step</span>
          </button>
          <button
            onClick={() => insertSnippet('\n- [ ] **Task**: Description\n')}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
            title="Insert task checkbox"
          >
            <Plus className="w-3 h-3" />
            <span>+ Task</span>
          </button>
          <button
            onClick={() => insertSnippet('\n```js\n// Code snippet\n```\n')}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
            title="Insert code block"
          >
            <Code2 className="w-3 h-3" />
            <span>+ Code</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Reset */}
          {dirty && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Discard changes"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              savedSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : dirty
                ? 'bg-white text-black hover:bg-zinc-200 border border-white'
                : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
            }`}
            title="Save Blueprint Changes (Cmd+S)"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Saving...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Blueprint</span>
                <kbd className="hidden md:inline text-[9px] opacity-60 ml-0.5 px-1 py-0.2 bg-black/10 rounded">⌘S</kbd>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body with Monospace Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="select-none py-4 px-3 text-right text-white/20 bg-[#0a0a0d] border-r border-white/10 overflow-hidden font-mono min-w-[3.2rem]"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="h-5 leading-5 text-[11px]">
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
          className="flex-1 h-full w-full py-4 px-4 bg-transparent text-zinc-200 font-mono text-xs leading-5 resize-none outline-none custom-scrollbar selection:bg-white/20 selection:text-white"
          placeholder="Enter architectural plan specification markdown here..."
        />
      </div>
    </div>
  );
}
