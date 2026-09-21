import React from 'react';
import AIAgentPanel from '../components/AIAgentPanel';
import { Cpu, ShieldCheck, Terminal, Brain, ArrowRight, Zap, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export default function AIAgentPage({ agentState, onOpenExplain, onReplan, onVerify, onStepAI }) {
  const policies = [
    {
      id: 'POLICY-P01',
      name: 'Safe Operating Envelope Verification',
      rule: 'IF Flow in [40.0, 45.0] L/min AND Pressure in [3.5, 4.0] bar THEN State = NOMINAL.',
      status: 'ACTIVE'
    },
    {
      id: 'POLICY-P04',
      name: 'Burst Isolation Priority Rule',
      rule: 'IF Flow > 55 L/min AND Pressure < 2.9 bar THEN Classify as PIPE_BURST -> Target Valve 1.',
      status: 'ACTIVE'
    },
    {
      id: 'POLICY-P07',
      name: 'Dynamic Actuator Fault Adaptation',
      rule: 'IF Primary Valve 1 fails/times out (>3000ms) THEN Replan -> Target Valve 2 (Secondary).',
      status: 'ACTIVE'
    },
    {
      id: 'POLICY-R09',
      name: 'Responsible AI Dual-Fault Escalation',
      rule: 'IF All automated valves fail THEN Halt actuation -> Trigger Emergency Human Escalation.',
      status: 'ACTIVE'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            AquaAgent Autonomous Intelligence Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time causal analysis, policy arbitration, and adaptive self-healing execution
          </p>
        </div>

        <button
          onClick={onOpenExplain}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition self-start sm:self-auto"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Explain Current Reasoning</span>
        </button>
      </div>

      {/* Main Agent Panel */}
      <AIAgentPanel
        agentState={agentState}
        onOpenExplain={onOpenExplain}
        onReplan={onReplan}
        onVerify={onVerify}
      />

      {/* Policy Engine Rules */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Deterministic Safety & Actuation Policy Rules
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            4 / 4 Policies Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {policies.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-cyan-400">{p.id}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                  {p.status}
                </span>
              </div>
              <div className="text-xs font-semibold text-white mb-1.5">{p.name}</div>
              <p className="font-mono text-[11px] text-slate-300 bg-[#070e1b] p-2.5 rounded-lg border border-slate-800">
                {p.rule}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
