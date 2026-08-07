import { useState, useEffect, useMemo } from 'react';
import * as api from '../../utils/api';

export function useFilePreviewDrawer({
  projectId,
  filename,
  allFiles = [],
  onSelectFile,
  onClose
}) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('architect');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const [tocSearch, setTocSearch] = useState('');

  const loadPlanContent = () => {
    if (!filename) return;
    setLoading(true);
    api.fetchPlanFileContent(projectId, filename)
      .then(res => setContent(res.content || ''))
      .catch(() => setContent('// Failed to read file content'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlanContent();
  }, [projectId, filename]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const fileNames = useMemo(() => {
    return allFiles.map(f => (typeof f === 'string' ? f : f.name));
  }, [allFiles]);

  const currentIndex = fileNames.indexOf(filename);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < fileNames.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectFile) {
      onSelectFile(fileNames[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectFile) {
      onSelectFile(fileNames[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      if (e.key === 'Escape') {
        if (onClose) onClose();
      } else if (!isInput && e.key === '[') {
        handlePrev();
      } else if (!isInput && e.key === ']') {
        handleNext();
      } else if (!isInput && (e.key === 'f' || e.key === 'F')) {
        setIsFullscreen(prev => !prev);
      } else if (!isInput && (e.key === 'o' || e.key === 'O')) {
        setShowToc(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, fileNames, onClose, hasPrev, hasNext]);

  const handleSaveContent = async (newContent) => {
    setSaving(true);
    try {
      await api.savePlanFileContent(projectId, filename, newContent);
      setContent(newContent);
    } finally {
      setSaving(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = content ? content.split('\n').length : 0;

  const tocItems = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const items = [];
    let modIndex = 0;

    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        const title = line.slice(3).trim();
        items.push({
          type: 'module',
          id: `arch-mod-${modIndex}`,
          index: modIndex,
          title
        });
        modIndex++;
      } else if (line.startsWith('### ')) {
        const title = line.slice(4).trim();
        items.push({ type: 'step', title });
      }
    });
    return items;
  }, [content]);

  const filteredToc = useMemo(() => {
    if (!tocSearch) return tocItems;
    return tocItems.filter(item => item.title.toLowerCase().includes(tocSearch.toLowerCase()));
  }, [tocItems, tocSearch]);

  const scrollToElement = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return {
    content, loading, saving, copied, viewMode, setViewMode,
    isFullscreen, setIsFullscreen, showToc, setShowToc,
    tocSearch, setTocSearch, fileNames, hasPrev, hasNext,
    handlePrev, handleNext, handleSaveContent, copyContent,
    lineCount, tocItems, filteredToc, scrollToElement
  };
}
