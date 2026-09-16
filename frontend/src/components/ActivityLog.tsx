import React, { useState } from 'react';
import { ScrollText, Filter, Download, Search } from 'lucide-react';
import { AgentEvent, AgentPhase } from '../types';

interface ActivityLogProps {
  events: AgentEvent[];
}

const FILTER_PHASES: (AgentPhase | 'ALL')[] = [
  'ALL',
  'OBSERVE',
  'ANALYZE',
  'DECIDE',
  'ACT',
  'FAILURE',
  'ADAPT',
  'VERIFY',
  'ESCALATED',
];

export const ActivityLog: React.FC<ActivityLogProps> = ({ events }) => {
  const [selectedPhase, setSelectedPhase] = useState<AgentPhase | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = events.filter((evt) => {
    const matchesPhase = selectedPhase === 'ALL' || evt.phase === selectedPhase;
    const matchesSearch =
      searchTerm === '' ||
      evt.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.timeFormatted.includes(searchTerm);
    return matchesPhase && matchesSearch;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aqua_agent_audit_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="section-card">
      <div className="section-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ScrollText size={18} color="#38bdf8" />
          <span>Real-time Agent Activity & Audit Trail</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleExportJSON}
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              color: '#38bdf8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Download full JSON audit trail"
          >
            <Download size={12} />
            <span>Export JSON</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Filter size={13} />
            <span>{filteredEvents.length}/{events.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '8px' }} />
          <input
            type="text"
            placeholder="Search audit trail by step, timestamp, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.35rem 0.5rem 0.35rem 2rem',
              color: '#f8fafc',
              fontSize: '0.75rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>

        {/* Phase Filter Chips */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {FILTER_PHASES.map((p) => {
            const isSelected = selectedPhase === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPhase(p)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                  borderColor: isSelected ? '#38bdf8' : '#334155',
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  border: '1px solid',
                  borderRadius: '4px',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Feed */}
      <div className="activity-container" style={{ height: '300px' }}>
        {filteredEvents.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '2rem' }}>
            {events.length === 0
              ? 'No agent events recorded yet. Trigger a scenario above to start observation.'
              : 'No events match your search or filter.'}
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div key={evt.id} className="log-item">
              <span className="log-time">{evt.timeFormatted}</span>
              <span className={`log-phase log-phase-${evt.phase}`}>[{evt.phase}]</span>
              <div className="log-content">
                <div className="log-title">{evt.step}</div>
                <div className="log-details">{evt.details}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
