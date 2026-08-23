import { useEffect } from 'react';

/**
 * useTelemetryReporter — Background Analytics Telemetry Hook (Port 4100)
 * Sends page visit events and periodic heartbeat pings.
 */
export function useTelemetryReporter(route) {
  useEffect(() => {
    let sid = sessionStorage.getItem('__ac_telemetry_sid');
    if (!sid) {
      sid = 'client_' + Math.random().toString(36).substring(2, 9) + Date.now();
      sessionStorage.setItem('__ac_telemetry_sid', sid);
    }

    const reportEvent = () => {
      fetch('http://localhost:4100/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, page: route || 'home' })
      }).catch((err) => {
        void err;
      });
    };

    reportEvent();

    const timer = setInterval(() => {
      fetch('http://localhost:4100/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid })
      }).catch((err) => {
        void err;
      });
    }, 25000);

    return () => clearInterval(timer);
  }, [route]);
}
