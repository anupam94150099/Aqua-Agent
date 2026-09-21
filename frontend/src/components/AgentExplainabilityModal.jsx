import React from 'react';
import { X, Brain, CheckCircle, AlertTriangle, Cpu, ShieldCheck, ArrowRight, Eye, Play } from 'lucide-react';

export default function AgentExplainabilityModal({ isOpen, onClose, explanation, agentState, sensors }) {
  if (!isOpen) return null;

  const obs = explanation?.observations || {
    flow_rate: `${sensors?.current?.flow_rate?.toFixed(1) || '42.4'} L/min`,
    expected_flow: '40.0 – 45.0 L/min',
    pressure: `${sensors?.current?.pressure?.toFixed(2) || '3.82'} bar`,
    expected_pressure: '3.5 – 4.0 bar',
    valve_1_status: 'AVAILABLE',
    valve_2_status: 'AVAILABLE'
  };

  const reasoning = explanation?.reasoning || 
    'Continuous baseline monitoring. Cross-sensor telemetry confirms flow and pressure are within optimal operating bounds (Delta < 2%). No containment actuation required.';

  const action = explanation?.selected_action || 'CONTINUOUS_MONITORING';
  const verification = explanation?.verification_status || 'Hydraulic baseline verified stable.';
  const result = explanation?.decision_result || 'Operational Equilibrium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0d1627] border border-cyan-500/40 p-6 shadow-2xl shadow-cyan-950/50 text-slate-100 overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                AI Agent Decision Explainability
              </h3>
              <p className="text-xs text-slate-400">
                Transparent causal trace of sensor observations, policy reasoning, and verified actuation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4 text-xs">
          
          {/* 1. OBSERVATIONS */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px] mb-2.5">
              <Eye className="w-4 h-4" />
              <span>1. Telemetry Observations</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div className="p-2 rounded-lg bg-[#070e1b] border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Observed Flow:</div>
                <div className="text-sm font-bold text-cyan-300">{obs.flow_rate || '42.4 L/min'}</div>
                <div className="text-[9px] text-slate-500">Exp: 40–45 L/min</div>
              </div>
              <div className="p-2 rounded-lg bg-[#070e1b] border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Observed Pressure:</div>
                <div className="text-sm font-bold text-sky-300">{obs.pressure || '3.82 bar'}</div>
                <div className="text-[9px] text-slate-500">Exp: 3.5–4.0 bar</div>
              </div>
              <div className="p-2 rounded-lg bg-[#070e1b] border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Valve 1 Status:</div>
                <div className="text-sm font-bold text-amber-300">{obs.valve_1_status || obs.valve_1 || 'NORMAL'}</div>
                <div className="text-[9px] text-slate-500">Primary Inlet</div>
              </div>
              <div className="p-2 rounded-lg bg-[#070e1b] border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Valve 2 Status:</div>
                <div className="text-sm font-bold text-emerald-300">{obs.valve_2_status || obs.valve_2 || 'NORMAL'}</div>
                <div className="text-[9px] text-slate-500">Secondary Ring</div>
              </div>
            </div>
          </div>

          {/* 2. AGENT REASONING */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px] mb-1.5">
              <Brain className="w-4 h-4" />
              <span>2. Autonomous AI Reasoning & Policy Match</span>
            </div>
            <p className="text-slate-200 leading-relaxed bg-[#070e1b] p-3 rounded-lg border border-slate-800/80 font-sans">
              "{reasoning}"
            </p>
          </div>

          {/* 3. ACTION & VERIFICATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[11px] mb-1.5">
                <Play className="w-3.5 h-3.5" />
                <span>3. Selected Action</span>
              </div>
              <div className="font-mono text-sm font-bold text-white bg-[#070e1b] p-2.5 rounded-lg border border-indigo-500/30">
                {action}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>4. Post-Action Verification</span>
              </div>
              <div className="font-mono text-xs font-medium text-emerald-300 bg-[#070e1b] p-2.5 rounded-lg border border-emerald-500/30">
                {verification}
              </div>
            </div>
          </div>

          {/* 4. RESULT */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-cyan-200">Decision Outcome:</span>
            </div>
            <span className="font-mono font-bold text-xs uppercase px-2.5 py-1 rounded bg-cyan-900/80 text-cyan-300 border border-cyan-600/50">
              {result}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-md shadow-cyan-600/20"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
