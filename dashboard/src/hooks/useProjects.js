import { useState, useEffect, useCallback } from 'react';
import * as api from '../utils/api';

export function useProjects(refreshInterval = 5000) {
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [projs, sets] = await Promise.all([
        api.fetchProjects(),
        api.fetchSettings()
      ]);
      setProjects(projs);
      setSettings(sets);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  const addProject = async (path, name) => {
    await api.addProject(path, name);
    await fetchData();
  };

  const removeProject = async (id) => {
    await api.removeProject(id);
    await fetchData();
  };

  return { projects, settings, loading, error, addProject, removeProject, refresh: fetchData };
}
