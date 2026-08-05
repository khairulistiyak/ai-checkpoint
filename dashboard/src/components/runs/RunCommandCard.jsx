import React, { useState } from 'react';
import { Copy, Check, Terminal, Folder } from 'lucide-react';

const CATEGORY_STYLES = {
  dev: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  test: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  build: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  lint: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  checkpoint: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  custom: 'bg-white/10 text-white/70 border-white/15'
};

export default function RunCommandCard({ cmd, projectPath }) {
  const [copiedType, setCopiedType] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const badgeStyle = CATEGORY_STYLES[cmd.category] || CATEGORY_STYLES.custom;
  const isSubdir = cmd.cwd && cmd.cwd !== '.' && cmd.cwd !== '';
  const fullTerminalCmd = isSubdir && projectPath
    ? `cd "${projectPath}/${cmd.cwd}" && ${cmd.cmd}`
    : (isSubdir ? `cd "${cmd.cwd}" && ${cmd.cmd}` : cmd.cmd);

  return (
    <div className="bg-[#121214] border border-white/10 hover:border-white/20 transition-all rounded-xl p-4 flex flex-col justify-between gap-3 shadow-lg group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border font-semibold ${badgeStyle}`}>
              {cmd.category}
            </span>
            <h4 className="text-xs font-semibold text-white/90 truncate font-mono">{cmd.name}</h4>
          </div>
          {cmd.description && (
            <p className="text-[11px] text-white/40 truncate font-mono mt-0.5">{cmd.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-[10px] text-white/50 font-mono">
          <Folder className="w-3 h-3 text-white/40" />
          <span>{cmd.cwd || '.'}</span>
        </div>
      </div>

      <div className="bg-black/50 border border-white/5 rounded-lg p-2.5 flex items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2 min-w-0 text-white/80 overflow-hidden text-ellipsis">
          <Terminal className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <span className="truncate text-emerald-300/90">{cmd.cmd}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => copyToClipboard(cmd.cmd, 'cmd')}
            title="Copy command"
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[10px]"
          >
            {copiedType === 'cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Copy</span>
          </button>

          {isSubdir && (
            <button
              onClick={() => copyToClipboard(fullTerminalCmd, 'full')}
              title={`Copy combined cd + command (${fullTerminalCmd})`}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white/50 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[10px]"
            >
              {copiedType === 'full' ? <Check className="w-3 h-3 text-emerald-400" /> : <Terminal className="w-3 h-3" />}
              <span>cd+cmd</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
