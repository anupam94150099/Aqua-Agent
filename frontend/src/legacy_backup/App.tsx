import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { StatusCards } from './components/StatusCards';
import { AgentPanel } from './components/AgentPanel';
import { ValveDiagram } from './components/ValveDiagram';
import { ScenarioControls } from './components/ScenarioControls';
import { TelemetryCharts } from './components/TelemetryCharts';
import { ActivityLog } from './components/ActivityLog';
import { IncidentModal } from './components/IncidentModal';
import { 
  fetchState, 
  fetchLogs, 
  fetchIncidents, 
  triggerScenario, 
  controlValve,
  resetSystem, 
  subscribeToStream 
} from './services/api';
import { 
  AgentMemoryState, 
  AgentEvent, 
  TelemetryPoint, 
  IncidentRecord,
  ValveId,
  ValveStatus
} from './types';
import { History, RefreshCw, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

export const App: React.FC = () => {
  const [agentState, setAgentState] = useState<AgentMemoryState>({
    currentGoal: 'Detect and isolate abnormal water leakage while minimizing water wastage and maintaining safe operation.',
    currentPhase: 'IDLE',
    currentZone: 'Zone 4 - Industrial Sector',
    sensorData: {
      flow_in: 100.0,
      flow_out: 97.0,
      pressure: 3.2,
      zone: 'Zone 4 - Industrial Sector',
      timestamp: new Date().toISOString(),
      valve_status: { 'Valve 1': 'OPEN', 'Valve 2': 'OPEN' },
    },
    attemptedActions: [],
    actionResults: [],
    failures: [],
    eventHistory: [],
    finalOutcome: 'IDLE',
    decisionExplanation: 'Agent standing by for pipeline telemetry signals.',
  });

  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [waterSavedLiters, setWaterSavedLiters] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  }, [soundEnabled]);

  const recordTelemetryPoint = useCallback((sensor: { flow_in: number; flow_out: number; pressure: number }) => {
    const time = new Date().toTimeString().split(' ')[0];
    const loss = Math.max(0, sensor.flow_in - sensor.flow_out);
    setTelemetryHistory((prev) => {
      const next = [...prev, {
        time,
        flow_in: parseFloat(sensor.flow_in.toFixed(1)),
        flow_out: parseFloat(sensor.flow_out.toFixed(1)),
        pressure: parseFloat(sensor.pressure.toFixed(2)),
        loss: parseFloat(loss.toFixed(1)),
      }];
      return next.slice(-25);
    });
  }, []);

  // Compute live water saved counter when leak is successfully isolated
  useEffect(() => {
    if (agentState.finalOutcome === 'RESOLVED' || agentState.finalOutcome === 'ADAPTED_AND_RESOLVED') {
      const interval = setInterval(() => {
        setWaterSavedLiters((prev) => prev + 42.0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [agentState.finalOutcome]);

  useEffect(() => {
    let unsubscribeStream: (() => void) | null = null;

    const initData = async () => {
      try {
        const [state, logs, incs] = await Promise.all([
          fetchState().catch(() => null),
          fetchLogs().catch(() => []),
          fetchIncidents().catch(() => []),
        ]);

        if (state) {
          setAgentState(state);
          recordTelemetryPoint(state.sensorData);
        }
        if (logs) setEvents(logs);
        if (incs) setIncidents(incs);

        unsubscribeStream = subscribeToStream(
          (data) => {
            setConnected(true);
            if (data.type === 'INIT' && data.state) {
              setAgentState(data.state);
              if (data.state.sensorData) recordTelemetryPoint(data.state.sensorData);
            } else if (data.type === 'TELEMETRY_TICK') {
              if (data.state) {
                setAgentState((prev) => ({
                  ...prev,
                  sensorData: data.sensorData || data.state?.sensorData || prev.sensorData,
                  analysis: data.state?.analysis || prev.analysis,
                }));
              }
              if (data.sensorData) {
                recordTelemetryPoint(data.sensorData);
              }
            } else if (data.type === 'EVENT') {
              if (data.state) {
                setAgentState(data.state);
                if (data.state.sensorData) recordTelemetryPoint(data.state.sensorData);
              }
              if (data.event) {
                setEvents((prev) => [data.event!, ...prev]);

                if (data.event.phase === 'FAILURE') {
                  playTone(280, 'sawtooth', 0.4);
                } else if (data.event.phase === 'ADAPT') {
                  playTone(440, 'triangle', 0.25);
                } else if (data.event.phase === 'RESOLVED' || data.event.phase === 'ADAPTED_AND_RESOLVED') {
                  playTone(660, 'sine', 0.5);
                } else if (data.event.phase === 'ESCALATED') {
                  playTone(200, 'square', 0.6);
                }
              }
            }
          },
          () => {
            setConnected(false);
          }
        );
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    initData();

    return () => {
      if (unsubscribeStream) unsubscribeStream();
    };
  }, [recordTelemetryPoint, playTone]);

  const handleScenarioTrigger = async (scenario: 'normal' | 'medium-leak' | 'high-leak' | 'water-theft' | 'failure' | 'both-failed') => {
    setLoading(true);
    setWaterSavedLiters(0);
    try {
      await triggerScenario(scenario);
      setTimeout(async () => {
        const updatedIncidents = await fetchIncidents().catch(() => []);
        setIncidents(updatedIncidents);
      }, 5000);
    } catch (err) {
      console.error(`Failed scenario ${scenario}:`, err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleToggleValve = async (valveId: ValveId, currentStatus: ValveStatus) => {
    try {
      const nextAction = currentStatus === 'CLOSED' ? 'OPEN' : 'CLOSE';
      await controlValve(valveId, nextAction);
      const updatedState = await fetchState();
      setAgentState(updatedState);
    } catch (err) {
      console.error(`Failed to toggle valve ${valveId}:`, err);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setWaterSavedLiters(0);
    try {
      await resetSystem();
      setEvents([]);
      const state = await fetchState();
      setAgentState(state);
      setTelemetryHistory([]);
      recordTelemetryPoint(state.sensorData);
    } catch (err) {
      console.error('Failed to reset:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenIncidents = async () => {
    const incs = await fetchIncidents().catch(() => []);
    setIncidents(incs);
    setIsModalOpen(true);
  };

  const isCriticalRupture = (agentState.sensorData.flow_in - agentState.sensorData.flow_out) > 15;

  return (
    <div className="app-container">
      <Header outcome={agentState.finalOutcome} connected={connected} />

      {/* Critical Incident Alert Banner */}
      {isCriticalRupture && agentState.finalOutcome !== 'RESOLVED' && agentState.finalOutcome !== 'ADAPTED_AND_RESOLVED' && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.18)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.5)',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fca5a5',
          fontSize: '0.8125rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <AlertTriangle size={16} color="#ef4444" />
            <span>CRITICAL INCIDENT ACTIVE: Mass balance deficit of {(agentState.sensorData.flow_in - agentState.sensorData.flow_out).toFixed(1)} L/s detected in {agentState.currentZone}. Autonomous isolation in progress.</span>
          </div>
          <span className="badge badge-high">ACTIVE AGENT CYCLE</span>
        </div>
      )}

      <main className="main-content">
        <StatusCards
          sensorData={agentState.sensorData}
          analysis={agentState.analysis}
          waterSavedLiters={waterSavedLiters}
        />

        <ValveDiagram 
          sensorData={agentState.sensorData} 
          onToggleValve={handleToggleValve} 
        />

        <ScenarioControls
          onTriggerScenario={handleScenarioTrigger}
          onReset={handleReset}
          loading={loading}
        />

        <div className="dashboard-row">
          <AgentPanel agentState={agentState} />
          <ActivityLog events={events} />
        </div>

        <TelemetryCharts data={telemetryHistory} />
      </main>

      <footer className="footer">
        <div>
          AquaAgent v1.0.0 • Autonomous Multi-Step Agentic Water Control System
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              color: soundEnabled ? '#38bdf8' : '#64748b',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title={soundEnabled ? 'Mute acoustic alert chimes' : 'Enable acoustic alert chimes'}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{soundEnabled ? 'Audio Cue: ON' : 'Audio Cue: OFF'}</span>
          </button>

          <button
            onClick={handleOpenIncidents}
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <History size={13} />
            <span>SQLite Incident Log ({incidents.length})</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw size={12} />
            <span>Reload</span>
          </button>
        </div>
      </footer>

      <IncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        incidents={incidents}
      />
    </div>
  );
};
