import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SwissGridMatrix({ scores }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    { label: 'RSP', value: scores.responsive },
    { label: 'DYN', value: scores.dynamic },
    { label: 'PRF', value: scores.performance },
    { label: 'ALY', value: scores.a11y },
    { label: 'SEC', value: scores.security },
    { label: 'AVG', value: Math.round((scores.responsive + scores.dynamic + scores.performance + scores.a11y + scores.security) / 5) }
  ];

  return (
    <div className="w-full h-full p-2 font-mono flex items-center justify-center">
      <div className="grid grid-cols-3 gap-px bg-white/10 p-px w-full max-w-[12.5rem] aspect-[3/2]">
        {metrics.map((m, i) => (
          <div key={i} className="bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Value */}
            <div className={`text-xl font-bold tracking-tighter ${i === 5 ? 'text-white' : 'text-zinc-300'}`}>
              {m.value}
            </div>
            {/* Label */}
            <div className={`text-[8px] tracking-widest mt-1 ${i === 5 ? 'text-zinc-300 font-bold' : 'text-zinc-600'}`}>
              {m.label}
            </div>
            
            {/* Progress Bar (Bottom) - Except for Average */}
            {i !== 5 && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/5">
                <motion.div
                  className="h-full bg-zinc-400"
                  initial={{ width: 0 }}
                  animate={{ width: isLoaded ? `${m.value}%` : 0 }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            )}
            
            {/* Subtle highlight on hover */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
