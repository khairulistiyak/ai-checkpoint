import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import FilePreviewHeader from '../plan/FilePreviewHeader';
import FilePreviewSidebar from '../plan/FilePreviewSidebar';
import FilePreviewContent from './FilePreviewContent';
import { useFilePreviewDrawer } from './useFilePreviewDrawer';

export default function FilePreviewDrawer({
  projectId,
  filename,
  allFiles = [],
  onSelectFile,
  onClose
}) {
  const {
    content, loading, saving, copied, viewMode, setViewMode,
    isFullscreen, setIsFullscreen, showToc, setShowToc,
    tocSearch, setTocSearch, fileNames, hasPrev, hasNext,
    handlePrev, handleNext, handleSaveContent, copyContent,
    lineCount, tocItems, filteredToc, scrollToElement
  } = useFilePreviewDrawer({
    projectId,
    filename,
    allFiles,
    onSelectFile,
    onClose
  });

  const modalNode = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl backdrop-saturate-150 overflow-hidden select-none sm:select-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className={`w-full flex flex-col bg-[#08080b]/98 border border-white/20 shadow-[0_0_90px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 h-screen w-screen rounded-none border-0 z-[100000]'
            : 'h-[95vh] max-w-[1680px] rounded-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <FilePreviewHeader
          fileNames={fileNames}
          filename={filename}
          handlePrev={handlePrev}
          hasPrev={hasPrev}
          handleNext={handleNext}
          hasNext={hasNext}
          onSelectFile={onSelectFile}
          lineCount={lineCount}
          showToc={showToc}
          setShowToc={setShowToc}
          viewMode={viewMode}
          setViewMode={setViewMode}
          copyContent={copyContent}
          copied={copied}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          onClose={onClose}
        />

        <div className="flex-1 flex overflow-hidden bg-[#060608] relative">
          <FilePreviewSidebar
            showToc={showToc}
            viewMode={viewMode}
            tocItems={tocItems}
            filteredToc={filteredToc}
            tocSearch={tocSearch}
            setTocSearch={setTocSearch}
            scrollToElement={scrollToElement}
          />

          <FilePreviewContent
            loading={loading}
            viewMode={viewMode}
            content={content}
            filename={filename}
            handleSaveContent={handleSaveContent}
            saving={saving}
          />
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalNode, document.body);
}
