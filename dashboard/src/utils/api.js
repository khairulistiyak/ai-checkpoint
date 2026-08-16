const urlParams = new URLSearchParams(window.location.search);
const electronPort = urlParams.get('port');
const BASE_URL = electronPort 
  ? `http://localhost:${electronPort}/api`
  : (window.location.port === '5173' ? 'http://localhost:20226/api' : window.location.origin + '/api');

async function req(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, options);
  if (!res.ok) {
    let err = 'Request failed';
    try {
      const data = await res.json();
      if (data.error) err = data.error;
    } catch (e) { /* response not JSON */ }
    throw new Error(err);
  }
  return res.json();
}

const post = (url, body) => req(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: body !== undefined ? JSON.stringify(body) : undefined
});

export const fetchProjects = () => req('/projects');
export const fetchProjectDetails = (id) => req(`/projects/${id}`);
export const fetchProjectHealth = (id) => req(`/projects/${id}/health`);
export const fetchProjectCheckpoints = (id) => req(`/projects/${id}/checkpoints`);
export const fetchSettings = () => req('/settings');
export const addProject = (path, name) => post('/settings/projects', { path, name });
export const removeProject = (id) => req(`/settings/projects/${id}`, { method: 'DELETE' });
export const reorderProjects = (projectIds) => req('/settings/projects/reorder', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectIds })
});
export const executeCommand = (id, command, step, message, rawInput) => post(`/projects/${id}/command`, { command, step, message, rawInput });
export const fetchConfig = (id) => req(`/projects/${id}/config`);
export const updateConfig = (id, config) => post(`/projects/${id}/config`, config);
export const rollbackCheckpoint = (id, hash) => post(`/projects/${id}/rollback`, { hash });
export const installProject = (id) => post(`/projects/${id}/install`);
export const fetchAiTier = (id) => req(`/projects/${id}/ai-tier`);
export const updateAiTier = (id, tier) => post(`/projects/${id}/ai-tier`, { tier });
export const generatePlan = (id, { name, tier, description }) => post(`/projects/${id}/generate-plan`, { name, tier, description });
export const fetchPlanFileContent = (id, filename) => req(`/projects/${id}/plan-file/${encodeURIComponent(filename)}`);
export const savePlanFileContent = (id, filename, content) => post(`/projects/${id}/plan-file/${encodeURIComponent(filename)}`, { content });
export const fetchProjectRunConfig = (id) => req(`/projects/${id}/run-config`);
export const saveProjectRunConfig = (id, config) => post(`/projects/${id}/run-config`, config);
export const fetchProject = (id) => req(`/projects/${id}`);
export const updateProjectName = (id, name) => req(`/projects/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name })
});
export const relinkProjectBridge = (id) => post(`/projects/${id}/relink-bridge`);
export const syncProjectPlans = (id) => post(`/projects/${id}/sync-plans`);
export const deleteActivityLog = (id) => req(`/projects/${id}/activity-log`, { method: 'DELETE' });
export const triggerProjectAutofix = (id) => post(`/projects/${id}/autofix`);
export const fetchProjectStack = (id) => req(`/projects/${id}/stack`);
export const fetchProjectCompliance = (id) => req(`/projects/${id}/compliance`);
export const scaffoldCleanArch = (id, options) => post(`/projects/${id}/scaffold-clean-arch`, options);
export const fetchBoundaryLeaks = (id) => req(`/projects/${id}/boundary-leaks`);
export const fetchDryAnalysis = (id, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return req(`/projects/${id}/dry-analysis${q ? '?' + q : ''}`);
};
export const fetchUtilityIndex = (id, query = '') => req(`/projects/${id}/utility-index${query ? '?q=' + encodeURIComponent(query) : ''}`);
export const fetchRefactorProposal = (id, pair) => post(`/projects/${id}/refactor-proposal`, pair);
