import React, { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { useToast } from './ToastProvider';

export default function ExportButton({ project }) {
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();

  const handleExport = () => {
    try {
      setDownloading(true);
      const data = JSON.stringify(project, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `checkpoint-export-${project.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Project data exported successfully!', 'success');
    } catch (e) {
      showToast('Failed to export data', 'error');
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={downloading}
      className="p-2 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-slate-900 group relative"
      title="Export Project Data"
    >
      {downloading ? (
        <Check className="w-5 h-5 text-emerald-400" />
      ) : (
        <Download className="w-5 h-5 group-hover:text-accent-400 transition-colors" />
      )}
    </button>
  );
}
