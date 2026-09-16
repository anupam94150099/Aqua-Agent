import React from 'react';
import { Target, Compass, Zap, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AgentMemoryState, AgentPhase } from '../types';

interface AgentPanelProps {
  agentState: AgentMemoryState;
}

const PHASES: AgentPhase[] = ['OBSERVE', 'ANALYZE', 'DECIDE', 'ACT', 'EVALUATE', 'ADAPT', 'VERIFY', 'RESOLVED'];

export const AgentPanel: React.FC<AgentPanelProps> = ({ agentState }) => {
  const currentPhase = agentState.currentPhase;

  const getPhaseIndex = (phase: AgentPhase) => {
    if (phase === 'ADAPTED_AND_RESOLVED') return 7;
    if (phase === 'ESCALATED') return 7;
    return PHASES.indexOf(phase);
  };

  const currentIndex = getPhaseIndex(currentPhase);

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'OBSERVE': return '#38bdf8';
      case 'ANALYZE': return '#818cf8';
      case 'DECIDE': return '#fbbf24';
      case 'ACT': return '#34d399';
      case 'FAILURE': return '#ef4444';
      case 'ADAPT': return '#e879f9';
      case 'EVALUATE': return '#67e8f9';
      case 'VERIFY': return '#4ade80';
      case 'RESOLVED': return '#10b981';
      case 'ADAPTED_AND_RESOLVED': return '#c084fc';
      case 'ESCALATED': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="section-card">
      <div className="section-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={18} color="#38bdf8" />
          <span>Autonomous Agent Controller</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PHASE:</span>
          <span className="badge" style={{ backgroundColor: `${getPhaseColor()}22`, borderColor: getPhaseColor(), color: getPhaseColor() }}>
            {currentPhase}
          </span>
        </div>
      </div>

      <div className="workflow-stepper">
        {['OBSERVE', 'ANALYZE', 'DECIDE', 'ACT', 'EVALUATE', 'ADAPT', 'VERIFY', 'OUTCOME'].map((stepName, idx) => {
          let stepClass = 'step-item';
          const isCurrent = (idx === currentIndex) || (idx === 7 && (currentPhase === 'RESOLVED' || currentPhase === 'ADAPTED_AND_RESOLVED' || currentPhase === 'ESCALATED'));
          const isPassed = idx < currentIndex;
          const isFailure = currentPhase === 'FAILURE' && idx === 3;
          const isEscalated = currentPhase === 'ESCALATED' && idx === 7;

          if (isCurrent) stepClass += ' active';
          if (isPassed) stepClass += ' completed';
          if (isFailure || isEscalated) stepClass += ' failure';

          return (
            <div key={stepName} className={stepClass}>
              <div className="step-dot" />
              <span>{stepName}</span>
            </div>
          );
        })}
      </div>

      <div className="agent-grid">
        <div className="agent-field">
          <div className="agent-label">
            <Target size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Current Goal
          </div>
          <div className="agent-value" style={{ color: '#e2e8f0', fontSize: '0.8125rem' }}>
            {agentState.currentGoal}
          </div>
        </div>

        <div className="agent-field">
          <div className="agent-label">
            <Zap size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Current Action
          </div>
          <div className="agent-value" style={{ color: '#38bdf8' }}>
            {agentState.selectedAction || 'Monitoring Active Telemetry'}
          </div>
        </div>
      </div>

      <div className="agent-field">
        <div className="agent-label">
          <HelpCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Decision Explanation & Autonomous Tactical Reasoning
        </div>
        <div className="agent-explanation">
          {agentState.decisionExplanation || 'Continuous sensor observation cycle. No anomaly threshold breached.'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem' }}>
        <div style={{ color: 'var(--text-muted)' }}>
          Attempted Actuators: <span style={{ color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>{agentState.attemptedActions.length > 0 ? agentState.attemptedActions.join(' → ') : 'None'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>System Outcome:</span>
          {agentState.finalOutcome === 'ESCALATED' ? (
            <span style={{ color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <AlertTriangle size={13} /> ESCALATED
            </span>
          ) : agentState.finalOutcome === 'ADAPTED_AND_RESOLVED' ? (
            <span style={{ color: '#c084fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle2 size={13} /> ADAPTED & RESOLVED
            </span>
          ) : agentState.finalOutcome === 'RESOLVED' ? (
            <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle2 size={13} /> RESOLVED
            </span>
          ) : (
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>{agentState.finalOutcome}</span>
          )}
        </div>
      </div>
    </div>
  );
};
