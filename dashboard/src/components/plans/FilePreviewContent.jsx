import React from 'react';
import { Loader2 } from 'lucide-react';
import ArchitecturalPlanViewer from './ArchitecturalPlanViewer';
import PlanMarkdownEditor from './PlanMarkdownEditor';

export default function FilePreviewContent({
  loading,
  viewMode,
  content,
  filename,
  handleSaveContent,
  saving,
}) {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-white/50">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <span className="text-xs font-mono text-white/60">Loading architectural specification blueprint...</span>
        </div>
      ) : viewMode === 'architect' ? (
        <div className="max-w-6xl mx-auto w-full">
          <ArchitecturalPlanViewer content={content} filename={filename} />
        </div>
      ) : viewMode === 'edit' ? (
        <div className="h-full w-full max-w-6xl mx-auto min-h-[500px]">
          <PlanMarkdownEditor
            initialContent={content}
            filename={filename}
            onSave={handleSaveContent}
            saving={saving}
          />
        </div>
      ) : (
        <div className="flex font-mono text-sm leading-relaxed max-w-6xl mx-auto bg-[#0d0d12]/95 backdrop-blur-3xl rounded-2xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden min-h-[500px]">
          <div className="select-none text-white/30 text-right font-mono text-xs bg-black/40 py-6 px-3 min-w-[3.5rem] border-r border-white/5 space-y-0.5">
            {content.split('\n').map((_, i) => (
              <div key={i} className="h-6 leading-6 opacity-70 hover:opacity-100 transition-opacity">
                {i + 1}
              </div>
            ))}
          </div>
          <pre className="text-[#e2e8f0] whitespace-pre-wrap flex-1 py-6 px-6 text-sm leading-6 overflow-x-auto selection:bg-cyber-accent/30 selection:text-white custom-scrollbar">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}
