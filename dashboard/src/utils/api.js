const BASE_URL = 'http://localhost:20226/api';

export async function fetchProjects() {
  const res = await fetch(`${BASE_URL}/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function fetchProjectDetails(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project details');
  return res.json();
}

export async function fetchProjectHealth(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}/health`);
  if (!res.ok) throw new Error('Failed to fetch project health');
  return res.json();
}

export async function fetchProjectCheckpoints(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}/checkpoints`);
  if (!res.ok) throw new Error('Failed to fetch project checkpoints');
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${BASE_URL}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function addProject(path, name) {
  const res = await fetch(`${BASE_URL}/settings/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, name })
  });
  if (!res.ok) throw new Error('Failed to add project');
  return res.json();
}

export async function removeProject(id) {
  const res = await fetch(`${BASE_URL}/settings/projects/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to remove project');
  return res.json();
}

export async function reorderProjects(projectIds) {
  const res = await fetch(`${BASE_URL}/settings/projects/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectIds })
  });
  if (!res.ok) throw new Error('Failed to reorder projects');
  return res.json();
}

export async function executeCommand(id, command, step, message) {
  const res = await fetch(`${BASE_URL}/projects/${id}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, step, message })
  });
  if (!res.ok) throw new Error('Command execution failed');
  return res.json();
}

export async function fetchConfig(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}/config`);
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}

export async function updateConfig(id, config) {
  const res = await fetch(`${BASE_URL}/projects/${id}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to update config');
  return res.json();
}

export async function rollbackCheckpoint(id, hash) {
  const res = await fetch(`${BASE_URL}/projects/${id}/rollback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash })
  });
  if (!res.ok) throw new Error('Rollback failed');
  return res.json();
}

export async function installProject(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}/install`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Installation failed');
  return res.json();
}
