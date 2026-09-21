import React from 'react';
import { Play, AlertOctagon, Wrench, RefreshCw, CheckCircle2, ShieldAlert, Zap } from 'lucide-react';

export default function DemoControlCenter({
  activeScenario,
  onTriggerScenario,
  onReset,
  onStepAI,
  isExecuting
}) {
  const scenarios = [
    {
      id: 'NORMAL',
      label: '1. NORMAL',
      description: 'Nominal 42 L/min, 3.8 bar, monitoring all zones',
      icon: CheckCircle2,
      color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25',
      activeColor: 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 glow-emerald'
    },
    {
      id: 'LEAK',
      label: '2. SIMULATE LEAK',
      description: 'Flow +82%, Pressure -41% in Zone B. Agent isolates V1',
      icon: Zap,
      color: 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25',
      activeColor: 'bg-rose-500 text-white font-bold border-rose-400 glow-rose'
    },
    {
      id: 'VALVE1_FAILURE',
      label: '3. VALVE 1 FAILURE',
      description: 'Primary V1 fails. Agent detects & replans alternate path',
      icon: Wrench,
      color: 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25',
      activeColor: 'bg-amber-500 text-slate-950 font-bold border-amber-400 glow-amber'
    },
    {
      id: 'ADAPT_RECOVER',
      label: '4. ADAPT & RECOVER',
      description: 'Valve 2 closes, sensors verify normal flow, incident resolved',
      icon: CheckCircle2,
      color: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25',
      activeColor: 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 glow-cyan'
    },
    {
      id: 'BOTH_FAILED',
      label: '5. BOTH VALVES FAILED',
      description: 'Dual actuator fault. Agent safely escalates to human operator',
      icon: ShieldAlert,
      color: 'bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25',
      activeColor: 'bg-purple-600 text-white font-bold border-purple-400 glow-rose'
    },
    {
      id: 'RESET',
      label: '6. RESET SYSTEM',
      description: 'Restore initial baseline parameters and clear all faults',
      icon: RefreshCw,
      color: 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700',
      activeColor: 'bg-slate-700 text-white border-slate-600'
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0f172a]/90 relative overflow-hidden shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              Demo Control Center
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                Hackathon Presentation Engine
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test autonomous agent closed-loop state transitions, fault adaptations, and human escalations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onStepAI}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-xs font-semibold text-cyan-300 transition"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-400" />
            <span>Step State Machine</span>
          </button>
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => {
                if (sc.id === 'RESET') {
                  onReset();
                } else {
                  onTriggerScenario(sc.id);
                }
              }}
              disabled={isExecuting}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-150 relative group ${
                isActive ? sc.activeColor : sc.color
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-xs font-bold tracking-tight">
                  {sc.label}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-current' : 'opacity-70 group-hover:opacity-100'}`} />
              </div>
              <p className={`text-[10px] leading-tight line-clamp-2 ${
                isActive ? 'opacity-90' : 'text-slate-400 group-hover:text-slate-300'
              }`}>
                {sc.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
