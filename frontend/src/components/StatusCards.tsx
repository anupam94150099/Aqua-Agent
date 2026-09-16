import React from 'react';
import { ArrowDownRight, ArrowUpRight, Gauge, Activity, Percent, ShieldAlert, Sparkles, DollarSign } from 'lucide-react';
import { SensorData, LeakAnalysis, LeakSeverity } from '../types';

interface StatusCardsProps {
  sensorData: SensorData;
  analysis?: LeakAnalysis;
  waterSavedLiters?: number;
}

export const StatusCards: React.FC<StatusCardsProps> = ({ sensorData, analysis, waterSavedLiters = 0 }) => {
  const loss = Math.max(0, sensorData.flow_in - sensorData.flow_out);
  const lossPct = sensorData.flow_in > 0 ? (loss / sensorData.flow_in) * 100 : 0;
  const severity: LeakSeverity = analysis?.severity || (lossPct >= 25 || sensorData.pressure < 2.0 ? 'HIGH' : lossPct >= 10 ? 'MEDIUM' : 'NORMAL');
  const leakProb = analysis?.leakProbability !== undefined ? (analysis.leakProbability * 100).toFixed(0) : (lossPct >= 25 ? 98 : lossPct >= 10 ? 65 : 4);

  // Economic impact calculation: average municipal treated water cost ~ $0.002 / Liter
  const costSaved = (waterSavedLiters * 0.0025).toFixed(2);

  const getSeverityBadge = () => {
    switch (severity) {
      case 'NORMAL':
        return <span className="badge badge-normal">NORMAL</span>;
      case 'MEDIUM':
        return <span className="badge badge-medium">MEDIUM</span>;
      case 'HIGH':
        return <span className="badge badge-high">HIGH</span>;
    }
  };

  return (
    <div className="status-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      {/* Flow In */}
      <div className="status-card">
        <div className="status-card-header">
          <span>Flow In</span>
          <ArrowDownRight size={16} color="#38bdf8" />
        </div>
        <div className="status-card-value">
          {sensorData.flow_in.toFixed(1)} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>L/s</span>
        </div>
        <div className="status-card-sub">Supply inflow sensor</div>
      </div>

      {/* Flow Out */}
      <div className="status-card">
        <div className="status-card-header">
          <span>Flow Out</span>
          <ArrowUpRight size={16} color="#34d399" />
        </div>
        <div className="status-card-value">
          {sensorData.flow_out.toFixed(1)} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>L/s</span>
        </div>
        <div className="status-card-sub">Downstream delivery</div>
      </div>

      {/* Pressure */}
      <div className="status-card">
        <div className="status-card-header">
          <span>Pressure</span>
          <Gauge size={16} color={sensorData.pressure < 2.0 ? '#ef4444' : '#38bdf8'} />
        </div>
        <div className="status-card-value" style={{ color: sensorData.pressure < 2.0 ? '#f87171' : '#fff' }}>
          {sensorData.pressure.toFixed(2)} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>bar</span>
        </div>
        <div className="status-card-sub">
          {sensorData.pressure >= 2.5 ? 'Nominal gradient' : 'Pressure drop alert'}
        </div>
      </div>

      {/* Estimated Loss */}
      <div className="status-card">
        <div className="status-card-header">
          <span>Estimated Loss</span>
          <Activity size={16} color={loss > 5 ? '#ef4444' : '#94a3b8'} />
        </div>
        <div className="status-card-value" style={{ color: loss > 10 ? '#f87171' : loss > 5 ? '#fbbf24' : '#34d399' }}>
          {loss.toFixed(1)} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>L/s ({lossPct.toFixed(1)}%)</span>
        </div>
        <div className="status-card-sub">Mass balance deficit</div>
      </div>

      {/* Leak Probability */}
      <div className="status-card">
        <div className="status-card-header">
          <span>Leak Probability</span>
          <Percent size={16} color="#c084fc" />
        </div>
        <div className="status-card-value">
          {leakProb}%
        </div>
        <div className="status-card-sub">Bayesian anomaly score</div>
      </div>

      {/* Severity */}
      <div className="status-card">
        <div className="status-card-header">
          <span>Severity</span>
          <ShieldAlert size={16} color={severity === 'HIGH' ? '#ef4444' : severity === 'MEDIUM' ? '#fbbf24' : '#10b981'} />
        </div>
        <div style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
          {getSeverityBadge()}
        </div>
        <div className="status-card-sub">{sensorData.zone}</div>
      </div>

      {/* Water Saved Counter */}
      <div className="status-card" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.05)' }}>
        <div className="status-card-header">
          <span style={{ color: '#38bdf8' }}>Water Saved</span>
          <Sparkles size={16} color="#38bdf8" />
        </div>
        <div className="status-card-value" style={{ color: '#38bdf8' }}>
          {Math.round(waterSavedLiters).toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>L</span>
        </div>
        <div className="status-card-sub">Autonomous loss prevented</div>
      </div>

      {/* Economic Savings */}
      <div className="status-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.05)' }}>
        <div className="status-card-header">
          <span style={{ color: '#34d399' }}>Cost Avoided</span>
          <DollarSign size={16} color="#34d399" />
        </div>
        <div className="status-card-value" style={{ color: '#34d399' }}>
          ${costSaved}
        </div>
        <div className="status-card-sub">Treated water utility savings</div>
      </div>
    </div>
  );
};
