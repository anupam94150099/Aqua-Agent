import React from 'react';
import { Layers, Activity, AlertTriangle, ShieldCheck, CheckCircle2, Lock, Unlock, Droplets } from 'lucide-react';

export default function PipelineTopologyMap({ network, sensors, onToggleValve, isOverride }) {
  const zones = network?.zones || {};
  const valves = network?.valves || {};
  const isLeak = network?.leak_active || false;
  const leakZone = network?.leak_zone || 'Zone B';

  const v1 = valves['valve_1'] || { status: 'OPEN', name: 'Valve 1 (Primary)' };
  const v2 = valves['valve_2'] || { status: 'OPEN', name: 'Valve 2 (Secondary)' };
  const vMain = valves['valve_main'] || { status: 'OPEN', name: 'Main Valve' };

  const getValveBadge = (v) => {
    if (v.status === 'CLOSED') {
      return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50', label: 'CLOSED (ISOLATED)' };
    }
    if (v.status === 'FAILED') {
      return { bg: 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse', label: 'FAULT (FAILED)' };
    }
    if (v.status === 'CLOSING') {
      return { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse', label: 'CLOSING...' };
    }
    return { bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', label: 'OPEN (PASSING)' };
  };

  const v1Badge = getValveBadge(v1);
  const v2Badge = getValveBadge(v2);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyan-500/25 bg-[#0d1627]/95 shadow-xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Pipeline Topology & Actuation Grid
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                Hydraulic Network
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time fluid distribution across DMA zones with automated valve isolation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Flow Particles: Active
          </span>
        </div>
      </div>

      {/* SVG Pipeline Canvas */}
      <div className="mt-4 p-4 rounded-xl bg-[#060c18] border border-slate-800/90 relative overflow-x-auto">
        <svg viewBox="0 0 900 420" className="w-full min-w-[700px] h-auto font-sans select-none">
          
          <defs>
            <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
            </linearGradient>
            
            <linearGradient id="pipeLeakGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.9" />
            </linearGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Water Source Reservoir */}
          <g transform="translate(40, 160)">
            <rect x="0" y="0" width="110" height="90" rx="12" fill="#0c4a6e" stroke="#0284c7" strokeWidth="2" />
            <circle cx="55" cy="35" r="18" fill="#0369a1" />
            <Droplets className="w-6 h-6 text-cyan-300" x="43" y="23" width="24" height="24" fill="#38bdf8" />
            <text x="55" y="68" textAnchor="middle" fill="#f0f9ff" fontSize="11" fontWeight="bold">WATER SOURCE</text>
            <text x="55" y="80" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontFamily="monospace">Pump Station 1</text>
          </g>

          {/* Main Feed Pipe */}
          <path d="M 150 205 L 260 205" stroke="#0ea5e9" strokeWidth="8" fill="none" />
          <path d="M 150 205 L 260 205" stroke="#e0f2fe" strokeWidth="3" fill="none" className="flow-anim" />

          {/* Central Junction */}
          <g transform="translate(260, 185)">
            <rect x="0" y="0" width="90" height="40" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text x="45" y="22" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">MAIN HEADER</text>
            <text x="45" y="33" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">42.4 L/min</text>
          </g>

          {/* Vertical Distribution Spine */}
          <path d="M 350 205 L 420 205" stroke="#0ea5e9" strokeWidth="6" fill="none" />
          <path d="M 420 70 L 420 350" stroke="#0ea5e9" strokeWidth="6" fill="none" />
          <path d="M 420 70 L 420 350" stroke="#e0f2fe" strokeWidth="2" fill="none" className="flow-anim" />

          {/* --- BRANCH 1: ZONE A --- */}
          <path d="M 420 70 L 520 70" stroke="#0ea5e9" strokeWidth="5" fill="none" />
          <path d="M 420 70 L 520 70" stroke="#bae6fd" strokeWidth="2" fill="none" className="flow-anim" />
          <g transform="translate(520, 35)">
            <rect x="0" y="0" width="160" height="70" rx="10" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
            <text x="14" y="22" fill="#10b981" fontSize="11" fontWeight="bold">ZONE A (Commercial)</text>
            <text x="14" y="42" fill="#94a3b8" fontSize="9">Status: <tspan fill="#34d399" fontWeight="bold">NORMAL</tspan></text>
            <text x="14" y="58" fill="#38bdf8" fontSize="10" fontFamily="monospace">Flow: 12.1 L/min | 3.85 bar</text>
          </g>

          {/* --- BRANCH 2: ZONE B (TARGET / LEAK ZONE) --- */}
          {/* Main Path to Valve 1 */}
          <path
            d="M 420 160 L 480 160"
            stroke={isLeak ? "#f43f5e" : "#0ea5e9"}
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M 420 160 L 480 160"
            stroke={isLeak ? "#ffe4e6" : "#e0f2fe"}
            strokeWidth="2"
            fill="none"
            className={isLeak ? "flow-anim-fast" : "flow-anim"}
          />

          {/* Valve 1 Box */}
          <g transform="translate(480, 138)" className="cursor-pointer" onClick={() => onToggleValve('valve_1')}>
            <rect
              x="0"
              y="0"
              width="80"
              height="44"
              rx="6"
              fill={v1.status === 'FAILED' ? '#4c0519' : v1.status === 'CLOSED' ? '#064e3b' : '#0c4a6e'}
              stroke={v1.status === 'FAILED' ? '#f43f5e' : v1.status === 'CLOSED' ? '#10b981' : '#38bdf8'}
              strokeWidth="2"
            />
            <text x="40" y="18" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">VALVE 1</text>
            <text
              x="40"
              y="32"
              textAnchor="middle"
              fill={v1.status === 'FAILED' ? '#fda4af' : v1.status === 'CLOSED' ? '#6ee7b7' : '#7dd3fc'}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {v1.status}
            </text>
          </g>

          {/* Pipe from V1 to Zone B */}
          <path
            d="M 560 160 L 610 160"
            stroke={v1.status === 'CLOSED' ? '#334155' : isLeak ? '#f43f5e' : '#0ea5e9'}
            strokeWidth="6"
            fill="none"
          />

          {/* Bypass Pipe to Valve 2 */}
          <path
            d="M 450 160 L 450 230 L 480 230"
            stroke={v2.status === 'CLOSED' ? '#334155' : isLeak ? '#f43f5e' : '#0ea5e9'}
            strokeWidth="4"
            fill="none"
          />

          {/* Valve 2 Box */}
          <g transform="translate(480, 210)" className="cursor-pointer" onClick={() => onToggleValve('valve_2')}>
            <rect
              x="0"
              y="0"
              width="80"
              height="40"
              rx="6"
              fill={v2.status === 'FAILED' ? '#4c0519' : v2.status === 'CLOSED' ? '#064e3b' : '#0c4a6e'}
              stroke={v2.status === 'FAILED' ? '#f43f5e' : v2.status === 'CLOSED' ? '#10b981' : '#38bdf8'}
              strokeWidth="2"
            />
            <text x="40" y="16" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">VALVE 2 (Alt)</text>
            <text
              x="40"
              y="29"
              textAnchor="middle"
              fill={v2.status === 'FAILED' ? '#fda4af' : v2.status === 'CLOSED' ? '#6ee7b7' : '#7dd3fc'}
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {v2.status}
            </text>
          </g>

          {/* Connect V2 into Zone B Header */}
          <path
            d="M 560 230 L 590 230 L 590 180 L 610 180"
            stroke={v2.status === 'CLOSED' ? '#334155' : isLeak ? '#f43f5e' : '#0ea5e9'}
            strokeWidth="4"
            fill="none"
          />

          {/* ZONE B CONTAINER */}
          <g transform="translate(610, 130)">
            <rect
              x="0"
              y="0"
              width="250"
              height="105"
              rx="12"
              fill={isLeak ? '#2d0612' : (v1.status === 'CLOSED' || v2.status === 'CLOSED') ? '#064e3b' : '#0f172a'}
              stroke={isLeak ? '#f43f5e' : (v1.status === 'CLOSED' || v2.status === 'CLOSED') ? '#10b981' : '#38bdf8'}
              strokeWidth={isLeak ? "3" : "1.5"}
              filter={isLeak ? "url(#glowEffect)" : ""}
            />
            <text x="16" y="24" fill={isLeak ? '#f43f5e' : '#38bdf8'} fontSize="12" fontWeight="bold">
              ZONE B (Residential Sector)
            </text>
            
            {/* Anomaly Indicator */}
            {isLeak && (
              <g transform="translate(16, 32)">
                <rect x="0" y="0" width="130" height="20" rx="4" fill="#f43f5e" />
                <text x="65" y="14" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  PIPE BURST DETECTED
                </text>
              </g>
            )}

            {!isLeak && (v1.status === 'CLOSED' || v2.status === 'CLOSED') && (
              <g transform="translate(16, 32)">
                <rect x="0" y="0" width="145" height="20" rx="4" fill="#10b981" />
                <text x="72" y="14" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  CONTAINED / ISOLATED
                </text>
              </g>
            )}

            {!isLeak && v1.status === 'OPEN' && v2.status === 'OPEN' && (
              <g transform="translate(16, 32)">
                <rect x="0" y="0" width="80" height="20" rx="4" fill="#0369a1" />
                <text x="40" y="14" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  NORMAL
                </text>
              </g>
            )}

            <text x="16" y="72" fill="#e2e8f0" fontSize="10" fontFamily="monospace">
              Flow: {sensors?.current?.zone_b_flow || '18.2'} L/min {isLeak && '(+82% SURGE)'}
            </text>
            <text x="16" y="88" fill="#e2e8f0" fontSize="10" fontFamily="monospace">
              Pressure: {sensors?.current?.zone_b_pressure || '3.82'} bar {isLeak && '(-41% DROP)'}
            </text>
          </g>

          {/* --- BRANCH 3: ZONE C --- */}
          <path d="M 420 280 L 520 280" stroke="#0ea5e9" strokeWidth="5" fill="none" />
          <path d="M 420 280 L 520 280" stroke="#bae6fd" strokeWidth="2" fill="none" className="flow-anim" />
          <g transform="translate(520, 250)">
            <rect x="0" y="0" width="160" height="60" rx="10" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
            <text x="14" y="20" fill="#38bdf8" fontSize="11" fontWeight="bold">ZONE C (Industrial)</text>
            <text x="14" y="36" fill="#94a3b8" fontSize="9">Status: <tspan fill="#38bdf8" fontWeight="bold">NORMAL</tspan></text>
            <text x="14" y="50" fill="#7dd3fc" fontSize="10" fontFamily="monospace">Flow: 7.5 L/min | 3.80 bar</text>
          </g>

          {/* --- BRANCH 4: ZONE D --- */}
          <path d="M 420 350 L 520 350" stroke="#0ea5e9" strokeWidth="5" fill="none" />
          <path d="M 420 350 L 520 350" stroke="#bae6fd" strokeWidth="2" fill="none" className="flow-anim" />
          <g transform="translate(520, 325)">
            <rect x="0" y="0" width="160" height="60" rx="10" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
            <text x="14" y="20" fill="#38bdf8" fontSize="11" fontWeight="bold">ZONE D (Suburban)</text>
            <text x="14" y="36" fill="#94a3b8" fontSize="9">Status: <tspan fill="#38bdf8" fontWeight="bold">NORMAL</tspan></text>
            <text x="14" y="50" fill="#7dd3fc" fontSize="10" fontFamily="monospace">Flow: 4.6 L/min | 3.79 bar</text>
          </g>

        </svg>
      </div>

      {/* Valve Interactive Legend / Quick Actuation */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Valve 1: Primary Zone B Inlet</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${v1Badge.bg}`}>
                {v1.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Response: {v1.last_response_time_ms || 120}ms | Health: {v1.health || 100}%
            </div>
          </div>
          <button
            onClick={() => onToggleValve('valve_1')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-medium transition"
          >
            {v1.status === 'OPEN' ? 'Close Valve' : 'Open Valve'}
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Valve 2: Alternate Isolation Ring</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${v2Badge.bg}`}>
                {v2.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Response: {v2.last_response_time_ms || 140}ms | Health: {v2.health || 100}%
            </div>
          </div>
          <button
            onClick={() => onToggleValve('valve_2')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-medium transition"
          >
            {v2.status === 'OPEN' ? 'Close Valve' : 'Open Valve'}
          </button>
        </div>
      </div>

    </div>
  );
}
