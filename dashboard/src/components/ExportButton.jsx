import React, { useState, useEffect, useRef } from 'react';
import { Download, Check } from 'lucide-react';
import { useToast } from './ToastProvider';

export default function ExportButton({ project }) {
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleExport = () => {
    try {
      setDownloading(true);
      const exportData = {
        name: project.name,
        path: project.path,
        progress: project.progress?.overall || null,
        phases: project.progress?.phases?.map(p => ({
          number: p.number, name: p.name, percentage: p.percentage,
          steps: p.steps.map(s => ({ number: s.number, title: s.title, status: s.status }))
        })) || [],
        exportedAt: new Date().toISOString()
      };
      const data = JSON.stringify(exportData, null, 2);
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
      timeoutRef.current = setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={downloading}
      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
      title="Export Project Data"
    >
      {downloading ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
