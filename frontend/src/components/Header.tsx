import React from 'react';
import { Droplets, Cpu, Radio } from 'lucide-react';
import { SystemOutcome } from '../types';

interface HeaderProps {
  outcome: SystemOutcome;
  connected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ outcome, connected }) => {
  const getOutcomeBadge = () => {
    switch (outcome) {
      case 'NORMAL_OPERATION':
        return <span className="badge badge-normal">System Nominal</span>;
      case 'RESOLVED':
        return <span className="badge badge-normal">Leak Resolved</span>;
      case 'ADAPTED_AND_RESOLVED':
        return <span className="badge badge-adapted">Adapted & Resolved</span>;
      case 'ESCALATED':
        return <span className="badge badge-critical">Human Escalated</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-medium">Agent Active</span>;
      default:
        return <span className="badge badge-normal">Standby</span>;
    }
  };

  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-icon">
          <Droplets size={28} color="#38bdf8" />
        </div>
        <div className="header-title">
          <h1>AquaAgent</h1>
          <p>Autonomous AI Agent for Smart Water Leakage Detection and Response</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {getOutcomeBadge()}
        <div className="header-badge">
          <Radio size={14} color={connected ? '#10b981' : '#ef4444'} />
          <span>{connected ? 'LIVE TELEMETRY' : 'OFFLINE'}</span>
          <span className={`status-dot ${connected ? 'active' : ''}`} style={{ backgroundColor: connected ? '#10b981' : '#ef4444' }} />
        </div>
        <div className="header-badge" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc', backgroundColor: 'rgba(168, 85, 247, 0.15)' }}>
          <Cpu size={14} />
          <span>AGENTIC CONTROLLER</span>
        </div>
      </div>
    </header>
  );
};
