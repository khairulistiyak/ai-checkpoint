import { useState, useEffect } from 'react';

export function useLiveStream(serverUrl = 'http://localhost:4100') {
  const [data, setData] = useState({
    liveCount: 0,
    todayTotal: 0,
    activeSessions: [],
    countries: [],
    devices: { Desktop: 0, Mobile: 0, Tablet: 0 },
    browsers: { Chrome: 0, Firefox: 0, Safari: 0, Edge: 0, Other: 0 },
    hourlyTrend: new Array(24).fill(0),
    recentEvents: []
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(`${serverUrl}/api/live-stream`);

    es.onopen = () => setConnected(true);
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch {}
    };
    es.onerror = () => {
      setConnected(false);
    };

    return () => es.close();
  }, [serverUrl]);

  return { ...data, connected };
}
