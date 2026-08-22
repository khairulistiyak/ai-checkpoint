/**
 * version-checker.js — Compares app version with remote/local release metadata.
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseSemver(v) {
  const cleaned = (v || '').replace(/^v/, '').trim();
  const parts = cleaned.split('.').map(n => parseInt(n, 10) || 0);
  return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
}

function isNewer(latest, current) {
  const l = parseSemver(latest);
  const c = parseSemver(current);
  if (l.major > c.major) return true;
  if (l.major === c.major && l.minor > c.minor) return true;
  if (l.major === c.major && l.minor === c.minor && l.patch > c.patch) return true;
  return false;
}

export async function checkAppUpdate(currentVersion = '1.0.0', updateUrl = null) {
  const defaultUrl = 'https://raw.githubusercontent.com/khairulistiyak/ai-checkpoint/main/dashboard/public/version.json';
  const targetUrl = updateUrl || defaultUrl;

  try {
    const res = await fetch(targetUrl, { timeout: 5000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const remoteData = await res.json();

    const latestVersion = remoteData.version || '1.0.0';
    const updateAvailable = isNewer(latestVersion, currentVersion);

    return {
      success: true,
      updateAvailable,
      currentVersion,
      latestVersion,
      releaseNotes: remoteData.releaseNotes || 'Bug fixes and performance improvements.',
      downloadUrl: remoteData.downloadUrl || 'https://github.com/khairulistiyak/ai-checkpoint/releases',
      mandatory: remoteData.mandatory || false,
      pubDate: remoteData.pubDate || new Date().toISOString()
    };
  } catch (err) {
    return {
      success: false,
      updateAvailable: false,
      currentVersion,
      error: err.message
    };
  }
}
