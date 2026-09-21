import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert, Clock, ChevronRight, X, Sparkles, Filter, Search } from 'lucide-react';

export default function IncidentsPage({ incidents = [] }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filtered = incidents.filter((inc) => {
    if (filterSeverity === 'ALL') return true;
    return inc.severity === filterSeverity;
  });

  const getStatusBadge = (status) => {
    if (status === 'RESOLVED') {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
    if (status === 'ESCALATED_TO_HUMAN') {
      return 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
    }
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-cyan-400" />
            Incident Management & Containment History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit history of autonomous anomaly detection, dynamic valve replanning, and verification outcomes
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Filter:</span>
          {['ALL', 'HIGH', 'CRITICAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg font-mono transition ${
                filterSeverity === sev
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="glass-panel rounded-2xl border border-cyan-500/20 bg-[#0d1627]/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070e1b] text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Incident ID</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Agent Action</th>
                <th className="py-3.5 px-4">Resolution</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500 text-xs">
                    No incidents logged in the current session. Trigger a scenario from the Demo Control Center to view live incidents.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {inc.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {inc.timestamp}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {inc.zone}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {inc.type}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-cyan-300">
                      {inc.actions_taken ? inc.actions_taken.join(' → ') : 'Valve 1'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {inc.resolution}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0d1627] border border-cyan-500/40 p-6 shadow-2xl text-slate-100 overflow-hidden">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    Incident Breakdown: {selectedIncident.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedIncident.zone} • {selectedIncident.type} • {selectedIncident.timestamp}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              
              {/* Metrics summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                  <span className="text-[10px] text-slate-400">Status:</span>
                  <div className="text-sm font-bold text-cyan-300">{selectedIncident.status}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                  <span className="text-[10px] text-slate-400">Water Saved:</span>
                  <div className="text-sm font-bold text-emerald-400">{Math.round(selectedIncident.water_saved_liters || 1248)} L</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
                  <span className="text-[10px] text-slate-400">Loss Prevented:</span>
                  <div className="text-sm font-bold text-sky-400">96.4%</div>
                </div>
              </div>

              {/* Resolution details */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Resolution Summary:
                </span>
                <p className="text-slate-200">
                  {selectedIncident.resolution}
                </p>
              </div>

              {/* Complete Agent Timeline */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                  Autonomous Agent Timeline:
                </span>
                <div className="max-h-48 overflow-y-auto space-y-2 font-mono text-[11px]">
                  {selectedIncident.timeline?.length ? (
                    selectedIncident.timeline.map((step, sIdx) => (
                      <div key={sIdx} className="p-2 rounded bg-[#070e1b] border border-slate-800/80 flex items-start gap-2">
                        <span className="text-cyan-400 shrink-0">[{step.timestamp}]</span>
                        <span className="text-slate-300">{step.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500">No detailed steps recorded.</div>
                  )}
                </div>
              </div>

            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
