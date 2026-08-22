/**
 * session-manager.js — In-memory live user session tracker.
 */

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.listeners = new Set();
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 15000);
  }

  addOrUpdate(sessionId, metadata = {}) {
    const now = Date.now();
    const existing = this.sessions.get(sessionId) || {};
    const updated = {
      sessionId,
      lastSeen: now,
      startTime: existing.startTime || now,
      country: metadata.country || existing.country || 'Unknown',
      city: metadata.city || existing.city || 'Unknown',
      flag: metadata.flag || existing.flag || '🌐',
      lat: metadata.lat ?? existing.lat ?? 0,
      lon: metadata.lon ?? existing.lon ?? 0,
      device: metadata.device || existing.device || 'Desktop',
      browser: metadata.browser || existing.browser || 'Chrome',
      os: metadata.os || existing.os || 'Linux',
      page: metadata.page || existing.page || '/'
    };

    this.sessions.set(sessionId, updated);
    this.notify();
    return updated;
  }

  cleanupExpired() {
    const cutoff = Date.now() - 60000; // 60 seconds timeout
    let changed = false;
    for (const [id, session] of this.sessions.entries()) {
      if (session.lastSeen < cutoff) {
        this.sessions.delete(id);
        changed = true;
      }
    }
    if (changed) this.notify();
  }

  getActiveSessions() {
    return Array.from(this.sessions.values());
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const data = this.getActiveSessions();
    for (const listener of this.listeners) {
      try { listener(data); } catch {}
    }
  }
}

export const sessionManager = new SessionManager();
