import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function PrecisionLinearScale({ scores }) {
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
    { label: 'SEC', value: scores.security }
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center gap-3 p-4 font-mono">
      {metrics.map((m, i) => (
        <div key={i} className="flex items-center gap-4 group">
          {/* Label */}
          <div className="w-8 text-[10px] text-zinc-500 font-bold tracking-widest">{m.label}</div>
          
          {/* Scale Line */}
          <div className="flex-1 relative h-[1px] bg-white/5">
            {/* Markers */}
            <div className="absolute inset-0 flex justify-between">
              {[0, 25, 50, 75, 100].map((tick) => (
                <div key={tick} className="w-px h-1.5 bg-white/10 -mt-0.5" />
              ))}
            </div>
            {/* Progress */}
            <motion.div
              className="absolute left-0 top-0 h-full bg-zinc-200"
              initial={{ width: 0 }}
              animate={{ width: isLoaded ? `${m.value}%` : 0 }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} // smooth ease out
            />
          </div>
          
          {/* Score */}
          <div className="w-6 text-[10px] text-zinc-300 font-bold text-right">
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}
