import React, { useState } from 'react';
import { FileCode, Layers, Link2, Terminal, Copy, Check } from 'lucide-react';

function getActionColor(action) {
  const a = (action || '').toUpperCase();
  if (a.includes('CREATE')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (a.includes('EDIT')) return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
  if (a.includes('DELETE')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
}

export default function PlanStepMetadata({ body, formatTextWithBadges }) {
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedCheck, setCopiedCheck] = useState(false);

  if (!body) return null;
  const lines = body.split('\n');
  let file = '', action = '', depends = '', doneCheck = '';
  const otherLines = [];

  lines.forEach((line) => {
    const clean = line.trim();
    if (/^[-*]?\s*(\*\*)?File:?(\*\*)?/i.test(clean)) {
      file = clean.replace(/^[-*]?\s*(\*\*)?File:?(\*\*)?\s*/i, '').replace(/[`*]/g, '').trim();
    } else if (/^[-*]?\s*(\*\*)?Action:?(\*\*)?/i.test(clean)) {
      action = clean.replace(/^[-*]?\s*(\*\*)?Action:?(\*\*)?\s*/i, '').replace(/[`*]/g, '').trim();
    } else if (/^[-*]?\s*(\*\*)?Depends:?(\*\*)?/i.test(clean)) {
      depends = clean.replace(/^[-*]?\s*(\*\*)?Depends:?(\*\*)?\s*/i, '').replace(/[`*]/g, '').trim();
    } else if (/^[-*]?\s*(\*\*)?Done-check:?(\*\*)?/i.test(clean)) {
      doneCheck = clean.replace(/^[-*]?\s*(\*\*)?Done-check:?(\*\*)?\s*/i, '').trim();
    } else {
      otherLines.push(line);
    }
  });

  const hasDepends = depends && !['none', 'nil', '-', 'n/a'].includes(depends.toLowerCase().trim());
  const bodyContent = otherLines.join('\n').trim();

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'file') { setCopiedFile(true); setTimeout(() => setCopiedFile(false), 2000); }
    if (type === 'check') { setCopiedCheck(true); setTimeout(() => setCopiedCheck(false), 2000); }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {(file || action || hasDepends) && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10">
          {file && (
            <button
              onClick={() => handleCopy(file, 'file')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-mono text-[11px] transition-colors cursor-pointer group"
              title="Click to copy file path"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span className="truncate max-w-[15rem] font-bold text-sky-200">{file}</span>
              {copiedFile ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <Copy className="w-3 h-3 text-white/30 group-hover:text-white/70 shrink-0" />}
            </button>
          )}

          {action && (
            <span className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 ${getActionColor(action)}`}>
              <Layers className="w-3 h-3" />
              <span>{action}</span>
            </span>
          )}

          {hasDepends && (
            <span className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 font-mono text-[11px] flex items-center gap-1">
              <Link2 className="w-3 h-3 text-zinc-500" />
              <span>Depends: <strong className="text-zinc-200">{depends}</strong></span>
            </span>
          )}
        </div>
      )}

      {bodyContent && (
        <div className="text-zinc-300 leading-relaxed space-y-2 whitespace-pre-wrap">
          {formatTextWithBadges ? formatTextWithBadges(bodyContent) : bodyContent}
        </div>
      )}

      {doneCheck && (
        <div className="rounded-xl border border-white/15 bg-[#08090d] overflow-hidden shadow-md">
          <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.04] border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1 ml-1.5">
                <Terminal className="w-3 h-3 text-emerald-400" />
                Done-Check Gate
              </span>
            </div>
            <button
              onClick={() => handleCopy(doneCheck.replace(/[`]/g, ''), 'check')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white text-[10px] transition-colors cursor-pointer border border-white/10"
            >
              {copiedCheck ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCheck ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3 overflow-x-auto text-[11px] font-mono text-emerald-300/90 leading-relaxed">
            {formatTextWithBadges ? formatTextWithBadges(doneCheck) : doneCheck}
          </div>
        </div>
      )}
    </div>
  );
}
