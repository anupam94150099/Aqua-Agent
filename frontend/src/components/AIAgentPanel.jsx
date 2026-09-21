import React from 'react';
import { Cpu, Terminal, Eye, Brain, Compass, Play, CheckCircle, ShieldAlert, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';

export default function AIAgentPanel({ agentState, onOpenExplain, onReplan, onVerify }) {
  const currentStage = agentState?.stage || 'IDLE';
  const mode = agentState?.mode || 'AUTONOMOUS';
  const objective = agentState?.current_objective || 'Maintain network stability and monitor hydraulic balance.';
  const timeline = agentState?.timeline || [];
  const latestThought = agentState?.latest_thought || 'All sensors nominal.';

  const stages = [
    { key: 'OBSERVE', label: 'OBSERVE', icon: Eye, desc: 'Flow & Pressure Telemetry' },
    { key: 'ANALYZE', label: 'ANALYZE', icon: Brain, desc: 'Burst Correlation & Zone' },
    { key: 'PLAN', label: 'PLAN', icon: Compass, desc: 'Safe Action Policy P-04' },
    { key: 'ACT', label: 'ACT', icon: Play, desc: 'Actuator Command Dispatch' },
    { key: 'VERIFY', label: 'VERIFY', icon: CheckCircle, desc: 'Hydraulic Stabilization' },
  ];

  const getStageIndex = (st) => {
    switch (st) {
      case 'OBSERVE': return 0;
      case 'ANALYZE': return 1;
      case 'PLAN': return 2;
      case 'ACT': return 3;
      case 'VERIFY': return 4;
      case 'ADAPT': return 2; // replans back at stage 2/3
      case 'ESCALATE': return 4;
      case 'RESOLVED': return 5;
      default: return -1;
    }
  };

  const activeIdx = getStageIndex(currentStage);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyan-500/25 bg-[#0d1627]/95 shadow-xl flex flex-col justify-between">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                AquaAgent Intelligence
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  Autonomous Kernel
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Continuous Closed-Loop Reasoning & Actuation Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${
              mode === 'ESCALATED'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : mode === 'HUMAN_OVERRIDE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              {mode}
            </span>
            <button
              onClick={onOpenExplain}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-xs font-medium text-cyan-300 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Explain AI</span>
            </button>
          </div>
        </div>

        {/* Current Objective */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Objective: </span>
            <span className="text-cyan-200">{objective}</span>
          </div>
        </div>

        {/* Five-Stage Closed-Loop Pipeline */}
        <div className="mt-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Agent Reasoning & Action Pipeline:
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {stages.map((st, idx) => {
              const Icon = st.icon;
              const isCurrent = currentStage === st.key || (st.key === 'PLAN' && currentStage === 'ADAPT');
              const isPast = activeIdx > idx;

              return (
                <div
                  key={st.key}
                  className={`flex flex-col items-center text-center p-2 sm:p-2.5 rounded-xl border transition-all duration-300 relative ${
                    isCurrent
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 glow-cyan ring-1 ring-cyan-400'
                      : isPast
                      ? 'bg-slate-900/80 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isCurrent ? 'animate-bounce text-cyan-300' : ''}`} />
                  <span className="text-[10px] sm:text-xs font-bold tracking-tight">
                    {st.label}
                  </span>
                  <span className="text-[9px] opacity-70 hidden sm:block truncate w-full">
                    {st.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Thought & Incident Timeline */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Agent Thought Stream & Action Log</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {timeline.length} events logged
          </span>
        </div>

        <div className="h-44 sm:h-48 overflow-y-auto rounded-xl bg-[#070e1b] p-3 border border-slate-800/80 font-mono text-xs space-y-2">
          {timeline.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
              <Eye className="w-6 h-6 mb-1 text-slate-600 animate-pulse" />
              <span>Observing pipeline telemetry in real-time...</span>
            </div>
          ) : (
            timeline.map((step, idx) => {
              const isResolved = step.stage === 'RESOLVED';
              const isEscalated = step.stage === 'ESCALATE';
              const isAdapt = step.stage === 'ADAPT';

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-[11px] leading-relaxed transition ${
                    isResolved
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : isEscalated
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                      : isAdapt
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 opacity-80 text-[10px]">
                    <span className="text-cyan-400">[{step.timestamp}]</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase text-[9px] font-semibold">
                      {step.stage}
                    </span>
                  </div>
                  <div>{step.message}</div>
                </div>
              );
            })
          )}
        </div>

        {/* Manual Replan / Verify controls for judge presentation */}
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800/60">
          <button
            onClick={onReplan}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 border border-slate-700 flex items-center justify-center gap-1 transition"
          >
            <Compass className="w-3 h-3 text-amber-400" />
            <span>Force Replan (Alt Valve)</span>
          </button>
          <button
            onClick={onVerify}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 border border-slate-700 flex items-center justify-center gap-1 transition"
          >
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Run Verification</span>
          </button>
        </div>

      </div>

    </div>
  );
}
