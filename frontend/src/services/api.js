const BASE_URL = '/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API Error ${res.status}: ${err}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Fetch error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // System & Telemetry
  getSystemStatus: () => fetchJson('/system/status'),
  getSensors: () => fetchJson('/sensors'),
  getNetwork: () => fetchJson('/network'),
  getAgentState: () => fetchJson('/agent/state'),
  getIncidents: () => fetchJson('/incidents'),
  getIncidentById: (id) => fetchJson(`/incidents/${id}`),
  getLogs: () => fetchJson('/logs'),

  // Demo Scenarios
  triggerNormal: () => fetchJson('/simulation/normal', { method: 'POST' }),
  triggerLeak: () => fetchJson('/simulation/leak', { method: 'POST' }),
  triggerValve1Failure: () => fetchJson('/simulation/valve1-failure', { method: 'POST' }),
  triggerAdaptRecover: () => fetchJson('/simulation/adapt-recover', { method: 'POST' }),
  triggerBothValvesFailed: () => fetchJson('/simulation/both-valves-failed', { method: 'POST' }),
  resetSimulation: () => fetchJson('/simulation/reset', { method: 'POST' }),
  stepSimulation: () => fetchJson('/simulation/step', { method: 'POST' }),

  // Manual Valve Actuation
  openValve: (valveId) => fetchJson(`/valves/${valveId}/open`, { method: 'POST' }),
  closeValve: (valveId) => fetchJson(`/valves/${valveId}/close`, { method: 'POST' }),

  // Agent Operations
  triggerReplan: () => fetchJson('/agent/replan', { method: 'POST' }),
  triggerVerify: () => fetchJson('/agent/verify', { method: 'POST' }),
  toggleOverride: (enabled) => fetchJson('/agent/override', {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  }),
  acknowledgeIncident: () => fetchJson('/agent/acknowledge', { method: 'POST' }),
  toggleAutoLoop: (enabled) => fetchJson('/agent/toggle-auto-loop', {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  }),
};
