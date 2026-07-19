import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronUp, ChevronDown, X, Play } from 'lucide-react';

export default function LogPanel({ logs }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'h-[50vh] md:h-64' : 'h-10'}`}>
      <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-700/80 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col">
        {/* Header Bar */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 px-4 flex items-center justify-between bg-slate-900/50 hover:bg-slate-800 transition-colors cursor-pointer group shrink-0"
        >
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-accent-400" />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-300 group-hover:text-white transition-colors uppercase">
              Terminal Output
            </span>
            {logs?.length > 0 && (
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
                {logs.length} events
              </span>
            )}
          </div>
          <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto p-4 font-mono text-sm"
            >
              {!logs || logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Terminal className="w-8 h-8 mb-2 opacity-50" />
                  <p>No output logs available for this project.</p>
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  {logs.map((log, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="w-24 shrink-0 text-slate-500 text-xs mt-0.5 select-none">
                        {log.time ? `[${log.time.split(' ')[1] || log.time}]` : '>'}
                      </div>
                      <div className="text-slate-300 group-hover:text-white transition-colors">
                        <span className={log.message.includes('Error') || log.message.includes('failed') ? 'text-red-400' : 
                                         log.message.includes('complete') || log.message.includes('success') ? 'text-emerald-400' : ''}>
                          {log.message}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Blinking cursor */}
                  <div className="flex gap-4 animate-pulse mt-2">
                    <div className="w-24 shrink-0 text-slate-500 text-xs select-none">{'>'}</div>
                    <div className="w-2 h-4 bg-accent-500/50"></div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
