import React from 'react';
import { Activity, Shield, AlertTriangle, RefreshCw, Cpu, Radio, Sparkles, UserCheck, Play } from 'lucide-react';

export default function Header({ status, onReset, onToggleOverride, onOpenPitchMode, onStepLoop }) {
  const isEscalated = status?.agent_status === 'ESCALATED';
  const isOverride = status?.agent_status === 'HUMAN_OVERRIDE';
  const isLeak = status?.system_status?.includes('ANOMALY');

  const getStatusBadge = () => {
    if (isEscalated) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-semibold tracking-wide uppercase animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>CRITICAL ESCALATION</span>
        </div>
      );
    }
    if (isOverride) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>MANUAL OVERRIDE ACTIVE</span>
        </div>
      );
    }
    if (isLeak) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-semibold tracking-wide uppercase animate-pulse">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>AUTONOMOUS CONTAINMENT</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>SYSTEM OPERATIONAL</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-lg shadow-cyan-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0b1120] rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Aqua<span className="text-cyan-400">Agent</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                v2.4 AI Closed-Loop
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Autonomous AI for Smarter Water Networks
            </p>
          </div>
        </div>

        {/* Center / Status */}
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 border-l border-slate-800 pl-3">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Loop:</span>
            <span className="font-mono text-cyan-300 font-semibold">{status?.current_stage || 'MONITORING'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Step Engine button */}
          <button
            onClick={onStepLoop}
            title="Advance autonomous step manually"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span>Step AI</span>
          </button>

          {/* Guided Pitch Mode button */}
          <button
            onClick={onOpenPitchMode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pitch Demo Mode</span>
          </button>

          {/* Human Override Toggle */}
          <button
            onClick={() => onToggleOverride(!isOverride)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              isOverride
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isOverride ? 'Manual Control' : 'Human Override'}</span>
          </button>

          {/* Reset System */}
          <button
            onClick={onReset}
            title="Reset system to default baseline"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
