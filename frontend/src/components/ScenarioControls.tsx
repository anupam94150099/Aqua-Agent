import React, { useState } from 'react';
import { Play, Flame, AlertOctagon, RotateCcw, ShieldCheck, AlertTriangle, Sliders, Send, Wrench } from 'lucide-react';

interface ScenarioControlsProps {
  onTriggerScenario: (scenario: 'normal' | 'medium-leak' | 'high-leak' | 'water-theft' | 'failure' | 'both-failed') => void;
  onReset: () => void;
  loading: boolean;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  onTriggerScenario,
  onReset,
  loading,
}) => {
  const [showCustomDrawer, setShowCustomDrawer] = useState(false);
  const [customFlowIn, setCustomFlowIn] = useState(100);
  const [customFlowOut, setCustomFlowOut] = useState(65);
  const [customPressure, setCustomPressure] = useState(1.8);
  const [transmitting, setTransmitting] = useState(false);

  const handleSendCustomTelemetry = async () => {
    setTransmitting(true);
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow_in: customFlowIn,
          flow_out: customFlowOut,
          pressure: customPressure,
          zone: 'Zone 4 - Manual Telemetry Simulator',
        }),
      });
    } catch (e) {
      console.error('Failed to transmit custom telemetry:', e);
    } finally {
      setTransmitting(false);
    }
  };

  return (
    <div className="section-card">
      <div className="section-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Play size={18} color="#38bdf8" />
          <span>Interactive Simulation & Scenario Triggers</span>
        </div>
        <button
          onClick={() => setShowCustomDrawer(!showCustomDrawer)}
          style={{
            background: showCustomDrawer ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            border: '1px solid #334155',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            color: showCustomDrawer ? '#38bdf8' : '#94a3b8',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Sliders size={13} />
          <span>{showCustomDrawer ? 'Close Manual Console' : 'Manual Telemetry Injection'}</span>
        </button>
      </div>

      <div className="scenario-panel">
        <div className="btn-grid">
          <button
            className="btn btn-secondary"
            onClick={() => onTriggerScenario('normal')}
            disabled={loading}
          >
            <ShieldCheck size={16} color="#10b981" />
            <span>Normal Baseline</span>
          </button>

          <button
            className="btn btn-warning"
            onClick={() => onTriggerScenario('medium-leak')}
            disabled={loading}
          >
            <AlertTriangle size={16} />
            <span>Medium Leak</span>
          </button>

          <button
            className="btn btn-danger"
            onClick={() => onTriggerScenario('high-leak')}
            disabled={loading}
          >
            <AlertOctagon size={16} />
            <span>High Leak Rupture</span>
          </button>

          <button
            className="btn"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              borderColor: '#f59e0b',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => onTriggerScenario('water-theft')}
            disabled={loading}
            title="Demonstrates: Water Theft / Illegal Tapping in Zone 2 -> Pressure remains stable but flow missing -> Agent isolates theft tap"
          >
            <AlertTriangle size={16} color="#fbbf24" />
            <span>🕵️ Water Theft / Siphoning</span>
          </button>

          <button
            className="btn btn-demo"
            onClick={() => onTriggerScenario('failure')}
            disabled={loading}
            title="Demonstrates: Valve 1 fails -> Agent adapts to Valve 2 -> Recovers pipeline"
          >
            <Flame size={16} color="#f87171" />
            <span>🔥 Failure + Adaptation Demo</span>
          </button>

          <button
            className="btn btn-danger"
            style={{ backgroundColor: 'rgba(153, 27, 27, 0.3)', borderColor: 'rgba(239, 68, 68, 0.5)' }}
            onClick={() => onTriggerScenario('both-failed')}
            disabled={loading}
            title="Demonstrates: Valve 1 & 2 fail -> Automatic isolation impossible -> Human emergency escalation"
          >
            <AlertOctagon size={16} color="#fca5a5" />
            <span>Both Valves Failed</span>
          </button>

          <button
            className="btn btn-reset"
            onClick={onReset}
            disabled={loading}
          >
            <RotateCcw size={16} />
            <span>Reset Simulation</span>
          </button>
        </div>

        {/* Manual Telemetry Injection Drawer */}
        {showCustomDrawer && (
          <div style={{
            marginTop: '0.75rem',
            padding: '1rem',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0' }}>
              <Wrench size={14} color="#38bdf8" />
              <span>Live Telemetry & Fault Injection Console (ESP32 Simulator)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {/* Flow In Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>Supply Flow In</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{customFlowIn} L/s</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="1"
                  value={customFlowIn}
                  onChange={(e) => setCustomFlowIn(Number(e.target.value))}
                  style={{ accentColor: '#38bdf8' }}
                />
              </div>

              {/* Flow Out Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>Delivery Flow Out</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>{customFlowOut} L/s</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="1"
                  value={customFlowOut}
                  onChange={(e) => setCustomFlowOut(Number(e.target.value))}
                  style={{ accentColor: '#34d399' }}
                />
              </div>

              {/* Pressure Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>Line Pressure</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>{customPressure.toFixed(2)} bar</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={customPressure}
                  onChange={(e) => setCustomPressure(Number(e.target.value))}
                  style={{ accentColor: '#fbbf24' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Deficit: {Math.max(0, customFlowIn - customFlowOut).toFixed(1)} L/s ({(((customFlowIn - customFlowOut) / customFlowIn) * 100).toFixed(1)}%)
              </span>
              <button
                onClick={handleSendCustomTelemetry}
                disabled={transmitting || loading}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.35rem 0.85rem',
                  color: '#090d16',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Send size={13} />
                <span>{transmitting ? 'Transmitting...' : 'Transmit Custom IoT Telemetry'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
