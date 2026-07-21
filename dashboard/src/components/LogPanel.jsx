import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronUp, ChevronDown } from 'lucide-react';

export default function LogPanel({ logs }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ height: isOpen ? '16rem' : '2.5rem' }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#000000] border-t border-white/[0.08] flex flex-col overflow-hidden"
    >
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group shrink-0"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            animate={isOpen ? { rotate: 360 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Terminal className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </motion.div>
          <span className="text-xs font-mono tracking-widest text-slate-400 group-hover:text-white transition-colors uppercase">
            Terminal
          </span>
          {logs?.length > 0 && (
            <span className="bg-white/10 text-white border border-white/20 text-[10px] px-2 py-0.5 rounded-sm font-mono">
              {logs.length} events
            </span>
          )}
        </div>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-slate-500 group-hover:text-slate-300 transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
            className="flex-1 overflow-y-auto p-4 font-mono text-xs custom-scrollbar bg-[#0A0A0A]"
          >
            {!logs || logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Terminal className="w-8 h-8 mb-2 opacity-30" />
                <p>No output logs available for this project.</p>
              </div>
            ) : (
              <motion.div 
                variants={{ show: { transition: { staggerChildren: 0.02 } } }}
                initial="hidden" animate="show"
                className="space-y-1.5 pb-4"
              >
                {logs.map((log, idx) => (
                  <motion.div 
                    variants={{ hidden: { opacity: 0, x: -5 }, show: { opacity: 1, x: 0 } }}
                    key={idx} className="flex gap-4 group"
                  >
                    <div className="w-20 shrink-0 text-slate-600 select-none">
                      {log.time ? `[${log.time.split(' ')[1] || log.time}]` : '>'}
                    </div>
                    <div className="text-slate-300 group-hover:text-white transition-colors">
                      <span className={log.message.includes('Error') || log.message.includes('failed') ? 'text-red-400' :
                        log.message.includes('complete') || log.message.includes('success') ? 'text-emerald-400' : ''}>
                        {log.message}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {/* Blinking cursor */}
                <div className="flex gap-4 mt-1.5">
                  <div className="w-20 shrink-0 text-slate-600 select-none">{'>'}</div>
                  <motion.div 
                    animate={{ opacity: [1, 0, 1] }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-2 h-3.5 bg-slate-400"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
