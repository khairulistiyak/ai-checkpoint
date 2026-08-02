import React from 'react';

export default function PageSkeleton() {
  return (
    <div className="w-full min-h-[400px] flex flex-col gap-5 p-6 bg-[#0a0d14] rounded-2xl border border-white/10 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 bg-white/10 rounded-lg" />
        <div className="h-8 w-28 bg-white/5 rounded-xl border border-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 bg-[#0c101a] border border-white/10 rounded-xl" />
        <div className="h-28 bg-[#0c101a] border border-white/10 rounded-xl" />
        <div className="h-28 bg-[#0c101a] border border-white/10 rounded-xl" />
      </div>

      <div className="flex-1 min-h-[220px] bg-[#0c101a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-4 w-1/3 bg-white/10 rounded" />
          <div className="h-4 w-2/3 bg-white/5 rounded" />
          <div className="h-4 w-1/2 bg-white/5 rounded" />
        </div>
        <div className="h-10 w-32 bg-white/10 rounded-xl self-end" />
      </div>
    </div>
  );
}
