import React, { useState } from 'react';
import { Settings, ShieldCheck, Sliders, ToggleLeft, ToggleRight, Radio, Lock, Unlock, AlertTriangle, Key, Cpu } from 'lucide-react';
import { api } from '../services/api';

export default function SettingsPage({ status, onToggleOverride }) {
  const [autoLoop, setAutoLoop] = useState(true);
  const [maxFlowThreshold, setMaxFlowThreshold] = useState(55.0);
  const [minPressureThreshold, setMinPressureThreshold] = useState(2.9);
  const isOverride = status?.agent_status === 'HUMAN_OVERRIDE';

  const handleToggleAutoLoop = async () => {
    const next = !autoLoop;
    setAutoLoop(next);
    try {
      await api.toggleAutoLoop(next);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            System Configuration & Responsible AI Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Safe operating envelopes, autonomous actuation permissions, and human safety guardrails
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
            Safety Kernel: ENFORCED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Responsible AI Architecture */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Responsible AI & Controlled-Action Principles
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            AquaAgent operates strictly under a <strong>bounded autonomy policy</strong>. It does not possess unrestricted system control and executes only pre-authorized, deterministic isolation sequences.
          </p>

          <div className="space-y-2 text-xs">
            {[
              { title: 'Human Priority Override', desc: 'Operators can disengage autonomous control instantly via single-click manual takeover.' },
              { title: 'Bounded Action Policies', desc: 'Agent commands are restricted to verified safe isolation valves within the affected DMA zone.' },
              { title: 'Mandatory Post-Action Verification', desc: 'Every physical valve actuation requires dynamic sensor feedback verification before closure.' },
              { title: 'Graceful Escalation', desc: 'When dual valve paths fail, the agent halts further actuation and escalates to human field engineers.' },
              { title: 'Immutable Audit Trail', desc: 'Every inference step, sensor delta, and wireless packet is permanently timestamped in the audit logs.' }
            ].map((p, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#070e1b] border border-slate-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                <div>
                  <span className="font-semibold text-cyan-200">{p.title}: </span>
                  <span className="text-slate-400">{p.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Operational Thresholds & Guardrails */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Hydraulic Operating Thresholds & Triggers
            </h3>
          </div>

          {/* Override Mode Switch */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                {isOverride ? <Unlock className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4 text-emerald-400" />}
                <span>Human Override Mode</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isOverride ? 'Manual operator is in direct control of valves.' : 'Agent autonomous closed-loop is actively monitoring.'}
              </p>
            </div>
            <button
              onClick={() => onToggleOverride(!isOverride)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition border ${
                isOverride
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isOverride ? 'ENGAGED' : 'AUTONOMOUS'}
            </button>
          </div>

          {/* Autonomous Background Loop Switch */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-white">
                Autonomous Decision Heartbeat
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Continuously steps the agent closed-loop every 2 seconds.
              </p>
            </div>
            <button
              onClick={handleToggleAutoLoop}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition border ${
                autoLoop
                  ? 'bg-cyan-600 text-white border-cyan-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {autoLoop ? 'ENABLED' : 'PAUSED'}
            </button>
          </div>

          {/* Slider controls */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Burst Trigger Flow Surge (L/min):</span>
                <span className="font-mono text-cyan-400 font-bold">{maxFlowThreshold} L/min</span>
              </div>
              <input
                type="range"
                min="48"
                max="80"
                step="1"
                value={maxFlowThreshold}
                onChange={(e) => setMaxFlowThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Pressure Drop Anomaly Threshold (bar):</span>
                <span className="font-mono text-sky-400 font-bold">{minPressureThreshold} bar</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="3.4"
                step="0.1"
                value={minPressureThreshold}
                onChange={(e) => setMinPressureThreshold(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
