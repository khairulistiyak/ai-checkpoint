/**
 * store.js — JSONL daily persistence for analytics events.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export function saveEvent(event) {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const file = path.join(DATA_DIR, `events-${dateStr}.jsonl`);
    const line = JSON.stringify({ ...event, timestamp: Date.now() }) + '\n';
    fs.appendFileSync(file, line, 'utf8');
  } catch (err) {
    console.error('Failed to persist analytics event:', err.message);
  }
}

export function getTodayEvents() {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const file = path.join(DATA_DIR, `events-${dateStr}.jsonl`);
    if (!fs.existsSync(file)) return [];
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
    return lines.filter(Boolean).map(l => JSON.parse(l));
  } catch {
    return [];
  }
}
