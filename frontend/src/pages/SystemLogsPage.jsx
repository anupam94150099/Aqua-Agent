import React, { useState } from 'react';
import { Terminal, Download, Search, Filter, ShieldCheck, AlertTriangle, Cpu, Radio, User } from 'lucide-react';

export default function SystemLogsPage({ logs = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchSearch = searchTerm === '' ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSource = sourceFilter === 'ALL' || log.source === sourceFilter;
    const matchSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

    return matchSearch && matchSource && matchSeverity;
  });

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'CRITICAL': return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
      case 'ERROR': return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
      case 'WARNING': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'SUCCESS': return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      default: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const exportLogsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aquaagent_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            System Audit Logs & Causal Event Trace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable timeline of telemetry signals, agent reasoning inferences, and actuator feedback
          </p>
        </div>

        <button
          onClick={exportLogsJson}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export JSON Audit</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel rounded-xl p-4 border border-cyan-500/20 bg-[#0d1627]/90 flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#070e1b] px-3 py-1.5 rounded-lg border border-slate-800 flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search event, details, source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-500 w-full"
          />
        </div>

        {/* Source & Severity Filter Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400">Source:</span>
          {['ALL', 'SENSOR_MONITOR', 'AGENT_ENGINE', 'HUMAN_OPERATOR'].map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                sourceFilter === s
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl border border-cyan-500/20 bg-[#0d1627]/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070e1b] text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Log ID</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Event Code</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 text-xs font-sans">
                    No matching log entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 text-slate-500 font-bold">
                      {log.id}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityStyle(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-cyan-300">
                      {log.event}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {log.source}
                    </td>
                    <td className="py-2.5 px-4 text-slate-200 font-sans text-xs max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
