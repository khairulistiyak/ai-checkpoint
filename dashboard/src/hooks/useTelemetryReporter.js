import { useEffect } from 'react';

/**
 * useTelemetryReporter — Background Analytics Telemetry Hook (Port 4100)
 * Smart Circuit Breaker: Automatically silences requests when analytics server is offline.
 */
let isServerOffline = false;
let lastOfflineCheck = 0;
const RETRY_BACKOFF_MS = 5 * 60 * 1000; // 5 minutes backoff if offline

async function safePost(url, payload) {
  const now = Date.now();
  if (isServerOffline && now - lastOfflineCheck < RETRY_BACKOFF_MS) {
    return false;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'cors',
      credentials: 'omit',
      signal: controller ? controller.signal : undefined
    });
    if (timeoutId) clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    isServerOffline = false;
    return true;
  } catch {
    if (timeoutId) clearTimeout(timeoutId);
    isServerOffline = true;
    lastOfflineCheck = Date.now();
    return false;
  }
}

export function useTelemetryReporter(route) {
  useEffect(() => {
    let sid = null;
    try {
      sid = sessionStorage.getItem('__ac_telemetry_sid');
      if (!sid) {
        sid = 'client_' + Math.random().toString(36).substring(2, 9) + Date.now();
        sessionStorage.setItem('__ac_telemetry_sid', sid);
      }
    } catch {
      sid = 'client_anon_' + Date.now();
    }

    safePost('http://localhost:4100/api/event', {
      sessionId: sid,
      page: route || 'home'
    });

    const timer = setInterval(() => {
      if (!isServerOffline) {
        safePost('http://localhost:4100/api/heartbeat', { sessionId: sid });
      }
    }, 25000);

    return () => clearInterval(timer);
  }, [route]);
}

