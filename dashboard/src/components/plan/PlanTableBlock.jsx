import React from 'react';

export default function PlanTableBlock({ block, idx, formatTextWithBadges }) {
  if (!block || !block.headers || block.headers.length === 0) return null;

  return (
    <div key={idx} className="my-4 rounded-xl border border-white/15 overflow-hidden bg-[#090a0f]/90 shadow-lg">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-white/[0.05] border-b border-white/15">
              {block.headers.map((header, hIdx) => (
                <th
                  key={hIdx}
                  className="px-4 py-2.5 text-white font-bold text-[11px] uppercase tracking-wider whitespace-nowrap"
                >
                  {formatTextWithBadges ? formatTextWithBadges(header) : header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {block.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="even:bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-4 py-2.5 text-zinc-300 leading-relaxed whitespace-pre-wrap"
                  >
                    {formatTextWithBadges ? formatTextWithBadges(cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
