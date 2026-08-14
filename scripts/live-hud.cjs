#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const progressFile = path.join(root, '.agents', 'PROGRESS.md');
const logFile = path.join(root, '.agents', 'activity-log.jsonl');

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  teal: '\x1b[38;2;115;218;202m', blue: '\x1b[38;2;122;162;247m',
  purple: '\x1b[38;2;187;154;247m', amber: '\x1b[38;2;224;175;104m',
  red: '\x1b[38;2;247;118;142m', dark: '\x1b[38;2;86;95;137m',
  white: '\x1b[38;2;192;202;245m', cyan: '\x1b[38;2;125;207;255m'
};

let filterMode = 'ALL';

let syntaxCheck = null;
try { syntaxCheck = require('../packages/cli/syntax-checker.js').syntaxCheck; } catch {}

function formatBytes(b) {
  if (!b || isNaN(b)) return '';
  return b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
}

function checkAstFast(fileRel) {
  if (!/\.(js|cjs|mjs|jsx|json|css)$/i.test(fileRel)) return '';
  const full = path.join(root, fileRel);
  if (!fs.existsSync(full) || !syntaxCheck) return '';
  try {
    const res = syntaxCheck(full);
    return res.ok ? `${C.teal}[AST OK]${C.reset}` : `${C.amber}[AST ERR]${C.reset}`;
  } catch { return ''; }
}

function getSysMetrics() {
  const mem = (process.memoryUsage().rss / 1048576).toFixed(1);
  let done = 0, total = 0, next = '';
  if (fs.existsSync(progressFile)) {
    fs.readFileSync(progressFile, 'utf8').split('\n').forEach(l => {
      if (/- \[[xX]\]/.test(l)) { done++; total++; }
      else if (/- \[[\/ ]\]/.test(l)) total++;
      if (l.startsWith('👉 Next:')) next = l.replace(/^👉\s*Next:\s*/, '').trim();
    });
  }
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { mem, done, total, pct, next };
}

function mapAction(act) {
  const a = (act || '').toUpperCase();
  if (a === 'CREATED') return { code: 'SPAWN ', color: C.teal };
  if (a === 'MODIFIED') return { code: 'MUTATE', color: C.cyan };
  if (a === 'DELETED') return { code: 'PURGE ', color: C.red };
  if (a === 'SYS') return { code: 'DAEMON', color: C.purple };
  return { code: 'PULSE ', color: C.dark };
}

function streamEntry(action, file, size, timeStr) {
  if (filterMode === 'FILES' && !['CREATED', 'MODIFIED', 'DELETED'].includes(action)) return;
  if (filterMode === 'LEDGER' && ['CREATED', 'MODIFIED', 'DELETED'].includes(action)) return;
  const time = timeStr || new Date().toLocaleTimeString();
  const hex = Math.random().toString(16).slice(2, 6).toUpperCase();
  const { code, color } = mapAction(action);
  const ast = checkAstFast(file);
  const tag = `${color}[${code}]${C.reset}`;
  const sizeInfo = size ? `${C.dark}(${formatBytes(size)})${C.reset}` : '';
  process.stdout.write(`${C.dark}[${time}]${C.reset} ${C.dim}${hex}${C.reset} ${tag} ${C.white}${file}${C.reset} ${sizeInfo} ${ast}\n`);
}

function printBanner() {
  const m = getSysMetrics();
  process.stdout.write(`\n${C.blue}${C.bold}[AI-CHECKPOINT]${C.reset} ${C.white}Telemetry Stream :: Core v2.0${C.reset}\n`);
  process.stdout.write(`${C.dark}Memory: ${m.mem} MB  |  Steps: ${m.done}/${m.total} (${m.pct}%)  |  Target: ${m.next || 'STABLE'}  |  Filter: [${filterMode}]${C.reset}\n`);
  process.stdout.write(`${C.dark}─────────────────────────────────────────────────────────────────────────────${C.reset}\n`);
}

function streamRecentActivity(limit = 8) {
  if (!fs.existsSync(logFile)) return;
  try {
    const raw = fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean);
    raw.slice(-limit).forEach(line => {
      try {
        const item = JSON.parse(line);
        streamEntry(item.action || 'LOG', item.file || item.message || line, item.size, item.ts ? new Date(item.ts).toLocaleTimeString() : '');
      } catch {}
    });
  } catch {}
}

function watchActivityLog() {
  if (!fs.existsSync(logFile)) return;
  let lastSize = fs.statSync(logFile).size;
  setInterval(() => {
    try {
      const curSize = fs.statSync(logFile).size;
      if (curSize > lastSize) {
        const fd = fs.openSync(logFile, 'r');
        const buf = Buffer.alloc(curSize - lastSize);
        fs.readSync(fd, buf, 0, buf.length, lastSize);
        fs.closeSync(fd);
        lastSize = curSize;
        buf.toString('utf8').trim().split('\n').filter(Boolean).forEach(line => {
          try {
            const item = JSON.parse(line);
            streamEntry(item.action || 'LOG', item.file || item.message || line, item.size, item.ts ? new Date(item.ts).toLocaleTimeString() : '');
          } catch {}
        });
      }
    } catch {}
  }, 400);
}

function startPulse() {
  setInterval(() => {
    const m = getSysMetrics();
    streamEntry('PULSE', `Heartbeat OK | Steps: ${m.done}/${m.total} (${m.pct}%) | RAM: ${m.mem} MB`);
  }, 4000);
}

function init() {
  printBanner();
  streamRecentActivity(15);
  watchActivityLog();
  startPulse();
  if (process.stdin.isTTY) {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (s, k) => {
      if (k.ctrl && k.name === 'c' || k.name === 'q') {
        streamEntry('SYS', 'Terminating telemetry stream...');
        setTimeout(() => process.exit(0), 100);
      } else if (k.name === '1') { filterMode = 'ALL'; streamEntry('SYS', 'Filter: ALL'); }
      else if (k.name === '2') { filterMode = 'FILES'; streamEntry('SYS', 'Filter: FILES ONLY'); }
      else if (k.name === '3') { filterMode = 'LEDGER'; streamEntry('SYS', 'Filter: LEDGER ONLY'); }
      else if (k.name === 'c') { process.stdout.write('\x1b[H\x1b[2J'); printBanner(); }
    });
  }
}

init();
