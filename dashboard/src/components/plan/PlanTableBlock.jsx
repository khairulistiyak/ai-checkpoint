import React from 'react';

export default function PlanTableBlock({ block, idx, formatTextWithBadges }) {
  if (!block || !block.headers || block.headers.length === 0) return null;

  return (
    <div key={idx} className="my-4 rounded-xl border border-white/[0.07] overflow-hidden bg-[#090a0f] shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/[0.06]">
              {block.headers.map((header, hIdx) => (
                <th
                  key={hIdx}
                  className="px-4 py-2.5 text-zinc-200 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap"
                >
                  {formatTextWithBadges ? formatTextWithBadges(header) : header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {block.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="even:bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
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
