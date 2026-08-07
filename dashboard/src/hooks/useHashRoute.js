import { useState, useEffect, useCallback } from 'react';

function parseHash(hashString) {
  const raw = (hashString || '#/').replace(/^#/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) {
    return { path: '/', route: 'home', projectId: null, tab: null };
  }

  if (parts[0] === 'project' && parts[1]) {
    const projectId = decodeURIComponent(parts[1]);
    if (parts[2] === 'plans') {
      const tab = parts[3] ? decodeURIComponent(parts[3]) : 'progress';
      return { path, route: 'plans', projectId, tab };
    }
    return { path, route: 'project', projectId, tab: null };
  }

  return { path: '/', route: 'home', projectId: null, tab: null };
}

export function useHashRoute() {
  const [routeInfo, setRouteInfo] = useState(() =>
    parseHash(typeof window !== 'undefined' ? window.location.hash : '#/')
  );

  useEffect(() => {
    const handleHashChange = () => {
      setRouteInfo(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((toUrl, { replace = false } = {}) => {
    if (typeof window === 'undefined') return;
    const target = toUrl.startsWith('#') ? toUrl : `#${toUrl.startsWith('/') ? '' : '/'}${toUrl}`;
    if (replace && window.history?.replaceState) {
      window.history.replaceState(null, '', target);
      setRouteInfo(parseHash(target));
    } else {
      window.location.hash = target;
    }
  }, []);

  return {
    ...routeInfo,
    navigate
  };
}
