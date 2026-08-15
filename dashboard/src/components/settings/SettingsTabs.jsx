import React from 'react';
import { Bot, Shield, Terminal, Palette, Check } from 'lucide-react';

export function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all">
      <div className="pr-4">
        <div className="text-xs sm:text-sm font-bold text-white font-outfit">{label}</div>
        {desc && <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{desc}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
          checked ? 'bg-sky-500 justify-end' : 'bg-zinc-800 justify-start'
        }`}
      >
        <div className="bg-white w-4 h-4 rounded-full shadow-md" />
      </button>
    </div>
  );
}

export function SelectRow({ label, desc, value, options, onChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all gap-2">
      <div>
        <div className="text-xs sm:text-sm font-bold text-white font-outfit">{label}</div>
        {desc && <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{desc}</div>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/60 border border-white/15 text-white text-xs font-mono rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer shrink-0"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#121214] text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AgentTab({ prefs, update }) {
  return (
    <div className="space-y-2.5">
      <SelectRow
        label="Rule 0 Max File Line Guard"
        desc="Enforce strict micro-file limit across repo"
        value={prefs.rule0Limit || 150}
        options={[
          { value: 100, label: '100 lines (Strict)' },
          { value: 150, label: '150 lines (Standard)' },
          { value: 200, label: '200 lines (Relaxed)' }
        ]}
        onChange={(v) => update({ rule0Limit: Number(v) })}
      />
      <ToggleRow
        label="Auto-Sync Plan Engine"
        desc="Sync plan/*.md into PROGRESS.md on changes"
        checked={prefs.autoSyncPlans !== false}
        onChange={(v) => update({ autoSyncPlans: v })}
      />
      <SelectRow
        label="Default AI Plan Tier"
        desc="Preset architecture strategy for plans"
        value={prefs.defaultAiTier || 'small'}
        options={[
          { value: 'small', label: 'Small (Granular Atomic)' },
          { value: 'medium', label: 'Medium (Structured)' },
          { value: 'large', label: 'Large (High-Reasoning)' }
        ]}
        onChange={(v) => update({ defaultAiTier: v })}
      />
      <ToggleRow
        label="Strict AST Syntax Guard"
        desc="Run in-memory parser before completing steps"
        checked={prefs.strictSyntaxCheck !== false}
        onChange={(v) => update({ strictSyntaxCheck: v })}
      />
    </div>
  );
}

export function TelemetryTab({ prefs, update }) {
  return (
    <div className="space-y-2.5">
      <ToggleRow
        label="Auto-Restore System Files"
        desc="Recreate deleted .agents/ system files safely"
        checked={prefs.autoRestoreFiles !== false}
        onChange={(v) => update({ autoRestoreFiles: v })}
      />
      <SelectRow
        label="Telemetry Pulse Interval"
        desc="Frequency of live activity logger stream"
        value={prefs.telemetryPulse || 3}
        options={[
          { value: 1, label: '1s (Real-time)' },
          { value: 3, label: '3s (Balanced)' },
          { value: 5, label: '5s (Low CPU)' }
        ]}
        onChange={(v) => update({ telemetryPulse: Number(v) })}
      />
      <SelectRow
        label="Activity Log Retention"
        desc="Maximum entries stored in activity-log.jsonl"
        value={prefs.logRetention || 1000}
        options={[
          { value: 500, label: '500 entries' },
          { value: 1000, label: '1,000 entries' },
          { value: 5000, label: '5,000 entries' }
        ]}
        onChange={(v) => update({ logRetention: Number(v) })}
      />
    </div>
  );
}

export function IdeTab({ prefs, update }) {
  return (
    <div className="space-y-2.5">
      <SelectRow
        label="Preferred IDE Protocol"
        desc="App opened when clicking 'Open in IDE'"
        value={prefs.preferredIde || 'vscode'}
        options={[
          { value: 'vscode', label: 'VS Code (vscode://)' },
          { value: 'cursor', label: 'Cursor (cursor://)' },
          { value: 'windsurf', label: 'Windsurf (windsurf://)' },
          { value: 'idea', label: 'IntelliJ / WebStorm (idea://)' }
        ]}
        onChange={(v) => update({ preferredIde: v })}
      />
      <SelectRow
        label="Preferred Shell Environment"
        desc="Default terminal interpreter for CLI jobs"
        value={prefs.preferredShell || '/bin/zsh'}
        options={[
          { value: '/bin/zsh', label: 'Zsh (/bin/zsh)' },
          { value: '/bin/bash', label: 'Bash (/bin/bash)' },
          { value: '/bin/sh', label: 'POSIX Shell (/bin/sh)' }
        ]}
        onChange={(v) => update({ preferredShell: v })}
      />
    </div>
  );
}
