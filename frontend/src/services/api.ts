import { AgentMemoryState, SimulationState, AgentEvent, IncidentRecord } from '../types';

const API_BASE = '/api';

export async function fetchState(): Promise<AgentMemoryState> {
  const res = await fetch(`${API_BASE}/state`);
  if (!res.ok) throw new Error('Failed to fetch agent state');
  const json = await res.json();
  return json.state;
}

export async function fetchSimulation(): Promise<{ simulation: SimulationState }> {
  const res = await fetch(`${API_BASE}/simulation`);
  if (!res.ok) throw new Error('Failed to fetch simulation');
  return await res.json();
}

export async function fetchLogs(): Promise<AgentEvent[]> {
  const res = await fetch(`${API_BASE}/logs?limit=150`);
  if (!res.ok) throw new Error('Failed to fetch event logs');
  const json = await res.json();
  return json.events;
}

export async function fetchIncidents(): Promise<IncidentRecord[]> {
  const res = await fetch(`${API_BASE}/incidents`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  const json = await res.json();
  return json.incidents;
}

export async function triggerScenario(scenario: 'normal' | 'medium-leak' | 'high-leak' | 'water-theft' | 'failure' | 'both-failed'): Promise<any> {
  const res = await fetch(`${API_BASE}/scenario/${scenario}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stepDelayMs: 650 }),
  });
  if (!res.ok) throw new Error(`Failed to trigger scenario ${scenario}`);
  return await res.json();
}

export async function controlValve(valveId: string, action: 'OPEN' | 'CLOSE'): Promise<any> {
  const res = await fetch(`${API_BASE}/valve/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valveId, action }),
  });
  if (!res.ok) throw new Error(`Failed to control valve ${valveId}`);
  return await res.json();
}

export async function resetSystem(): Promise<any> {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to reset system');
  return await res.json();
}

export async function runAgentCycle(): Promise<any> {
  const res = await fetch(`${API_BASE}/agent/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stepDelayMs: 650 }),
  });
  if (!res.ok) throw new Error('Failed to run agent cycle');
  return await res.json();
}

export function subscribeToStream(
  onData: (data: { type: string; event?: AgentEvent; state?: AgentMemoryState; simulation?: SimulationState }) => void,
  onError?: (err: any) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/stream`);

  eventSource.onmessage = (e) => {
    try {
      const parsed = JSON.parse(e.data);
      onData(parsed);
    } catch (err) {
      console.warn('Failed to parse SSE event:', err);
    }
  };

  eventSource.onerror = (err) => {
    if (onError) onError(err);
  };

  return () => {
    eventSource.close();
  };
}
