import { useEffect, useRef, useCallback } from 'react';

const BASE_URL = (window.location.port === '5173'
  ? 'http://localhost:20226'
  : window.location.origin) + '/api';

/**
 * useFileWatcher — Connects to the backend SSE endpoint for real-time file change events.
 * 
 * @param {string|null} projectId - The project to watch (null = no watching)
 * @param {object} callbacks - Event handlers
 * @param {function} callbacks.onRefresh - Called when UI should refresh data
 * @param {function} callbacks.onFileRestored - Called with {file, message} when a file is auto-restored
 * @param {function} callbacks.onFileDeletedWarning - Called with {file, message, canRestore} for delete warnings
 * @param {function} callbacks.onPlanDeleted - Called with {file} when a plan file is deleted
 */
export function useFileWatcher(projectId, callbacks = {}) {
  const eventSourceRef = useRef(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const connect = useCallback(() => {
    if (!projectId) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const url = `${BASE_URL}/projects/${projectId}/watch`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('connected', () => {
      console.log(`🔗 File watcher connected for project ${projectId}`);
    });

    es.addEventListener('file-restored', (e) => {
      try {
        const data = JSON.parse(e.data);
        callbacksRef.current.onFileRestored?.(data);
        callbacksRef.current.onRefresh?.();
      } catch (err) { /* ignore parse errors */ }
    });

    es.addEventListener('file-deleted-warning', (e) => {
      try {
        const data = JSON.parse(e.data);
        callbacksRef.current.onFileDeletedWarning?.(data);
        callbacksRef.current.onRefresh?.();
      } catch (err) { /* ignore */ }
    });

    es.addEventListener('plan-updated', (e) => {
      callbacksRef.current.onRefresh?.();
    });

    es.addEventListener('plan-deleted', (e) => {
      try {
        const data = JSON.parse(e.data);
        callbacksRef.current.onPlanDeleted?.(data);
        callbacksRef.current.onRefresh?.();
      } catch (err) { /* ignore */ }
    });

    es.addEventListener('progress-updated', (e) => {
      callbacksRef.current.onRefresh?.();
    });

    es.addEventListener('config-updated', (e) => {
      callbacksRef.current.onRefresh?.();
    });

    es.addEventListener('activity-log', (e) => {
      try {
        const entry = JSON.parse(e.data);
        callbacksRef.current.onActivityLog?.(entry);
      } catch (err) { /* ignore */ }
    });

    es.addEventListener('activity-log-cleared', (e) => {
      try {
        const data = JSON.parse(e.data);
        callbacksRef.current.onActivityLogCleared?.(data);
      } catch (err) { /* ignore */ }
    });

    es.onerror = () => {
      // SSE will auto-reconnect, no action needed
    };
  }, [projectId]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);
}

/**
 * Clear activity log history by range
 * @param {string} projectId
 * @param {'last_hour'|'today'|'last_7d'|'last_30d'|'all'} range
 */
export async function clearActivityLog(projectId, range = 'all') {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/activity-log?range=${range}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear activity log');
  return res.json();
}

/**
 * Restore PROGRESS.md from template (after user accepts the warning)
 */
export async function restoreProgress(projectId) {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/restore-progress`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to restore PROGRESS.md');
  return res.json();
}
