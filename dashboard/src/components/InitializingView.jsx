import React from 'react';
import { Loader2 } from 'lucide-react';

export default function InitializingView() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#020617] flex flex-col items-center justify-center text-white relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/30 to-accent-900/30" />
      <Loader2 className="w-16 h-16 text-accent-500 animate-spin mb-6 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
      <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent animate-pulse">
        Initializing Core Systems...
      </h2>
    </div>
  );
}
