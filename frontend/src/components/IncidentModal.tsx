import React from 'react';
import { ShieldCheck, AlertOctagon, X } from 'lucide-react';
import { IncidentRecord } from '../types';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: IncidentRecord[];
}

export const IncidentModal: React.FC<IncidentModalProps> = ({ isOpen, onClose, incidents }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
            SQLite Persisted Incident History & Post-Mortem Audit
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {incidents.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
              No incidents recorded in database yet.
            </div>
          ) : (
            incidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748b' }}>
                    {new Date(inc.timestamp).toLocaleString()}
                  </span>
                  <span className={`badge ${inc.outcome === 'ESCALATED' ? 'badge-critical' : inc.outcome === 'ADAPTED_AND_RESOLVED' ? 'badge-adapted' : 'badge-normal'}`}>
                    {inc.outcome}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {inc.outcome === 'ESCALATED' ? <AlertOctagon size={16} color="#f87171" /> : <ShieldCheck size={16} color="#34d399" />}
                  {inc.zone} — Severity: {inc.severity}
                </div>

                <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  <strong>Autonomous Action Chain:</strong> {inc.actions}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', backgroundColor: '#182234', padding: '0.5rem', borderRadius: '4px' }}>
                  {inc.explanation}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
