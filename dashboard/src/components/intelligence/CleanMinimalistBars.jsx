import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CleanMinimalistBars({ scores }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    { id: 'Responsive', val: scores.responsive, color: '#3b82f6' },
    { id: 'Dynamic', val: scores.dynamic, color: '#8b5cf6' },
    { id: 'Performance', val: scores.performance, color: '#eab308' },
    { id: 'Accessibility', val: scores.a11y, color: '#10b981' },
    { id: 'Security', val: scores.security, color: '#f43f5e' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center p-8 bg-[#09090b] rounded-xl border border-white/[0.05]">
      <div className="flex flex-col gap-5 w-full max-w-[300px] mx-auto">
        {metrics.map((m, i) => {
          const isHovered = hoveredIndex === i;
          const isFaded = hoveredIndex !== null && hoveredIndex !== i;
          
          return (
            <div 
              key={i} 
              className={`flex flex-col gap-2 transition-opacity duration-300 ${isFaded ? 'opacity-30' : 'opacity-100'}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex justify-between items-end font-sans">
                <span className="text-zinc-300 text-xs font-medium tracking-wide">{m.id}</span>
                <span className="text-white text-sm font-bold">{m.val}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.color }}
                  initial={{ width: '0%' }}
                  animate={isLoaded ? { width: `${m.val}%` } : { width: '0%' }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
