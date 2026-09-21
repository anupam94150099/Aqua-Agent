import React from 'react';
import { ArrowRight, CheckCircle, XCircle, Zap, Shield, HelpCircle, Activity, Award, Sparkles } from 'lucide-react';

export default function WhyAquaAgent() {
  const fiveQuestions = [
    {
      q: '1. What is the Problem?',
      a: 'Municipal & industrial pipelines lose 30%+ of treated water to undetected leaks. Traditional telemetry only sounds passive alarms, leaving hours of manual delay before a human can visit the valve.',
      color: 'text-rose-400'
    },
    {
      q: '2. What is AquaAgent?',
      a: 'An autonomous, closed-loop AI agent platform that unifies real-time sensor observation, cross-sensor causal reasoning, safe valve actuation, and post-action verification.',
      color: 'text-cyan-400'
    },
    {
      q: '3. How does the AI Agent Work?',
      a: 'Continuous 5-step loop: OBSERVE telemetry → ANALYZE cross-sensor correlations → PLAN permitted valve action → ACT wirelessly → VERIFY hydraulic stabilization.',
      color: 'text-sky-400'
    },
    {
      q: '4. What happens when something fails?',
      a: 'When primary actuators jam or timeout, AquaAgent replans alternate isolation paths (Valve 2). If all autonomous options are exhausted, it safely escalates to human operators with an explainable causal audit trail.',
      color: 'text-amber-400'
    },
    {
      q: '5. Why is this useful?',
      a: 'Cuts response time from 45–60 minutes down to under 5 seconds, saving thousands of liters of clean water, preventing road collapses, and ensuring infrastructure resilience.',
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/25 bg-[#0d1627]/95 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-lg shadow-cyan-500/20">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Why AquaAgent?
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
              30-Second Judge Summary
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            From passive monitoring to proactive, self-healing smart water infrastructure
          </p>
        </div>
      </div>

      {/* Comparison Grid: Traditional vs AquaAgent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Traditional */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-rose-500/30 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              Traditional Water Monitoring
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              Response: 45–60 min
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 rounded-lg bg-[#070e1b] border border-slate-800 font-mono text-slate-400 flex items-center justify-between">
              <span>Sensors</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span>Alarm / SMS</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span>Human Inspection</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span>Manual Turn</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] pt-1">
              <li>High latency between detection and valve shutoff.</li>
              <li>Massive treated water loss and property damage.</li>
              <li>No verification if the alarm was a false positive.</li>
              <li>No autonomous backup if a crew is delayed.</li>
            </ul>
          </div>
        </div>

        {/* AquaAgent */}
        <div className="p-5 rounded-xl bg-cyan-950/20 border border-cyan-500/40 relative glow-cyan">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              AquaAgent Autonomous Closed-Loop
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900 text-cyan-300 border border-cyan-600 font-bold">
              Response: &lt; 5 seconds
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 rounded-lg bg-[#070e1b] border border-cyan-800 font-mono text-cyan-300 flex items-center justify-between text-[11px]">
              <span>OBSERVE</span>
              <ArrowRight className="w-3 h-3 text-cyan-500" />
              <span>REASON</span>
              <ArrowRight className="w-3 h-3 text-cyan-500" />
              <span>ACT</span>
              <ArrowRight className="w-3 h-3 text-cyan-500" />
              <span>VERIFY</span>
              <ArrowRight className="w-3 h-3 text-cyan-500" />
              <span>ADAPT</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-cyan-100/80 text-[11px] pt-1">
              <li>Immediate autonomous isolation of the breached segment.</li>
              <li>Post-action hydraulic verification confirms containment.</li>
              <li>Dynamic replanning upon actuator mechanical failure.</li>
              <li>Responsible fail-safe escalation to human operators.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* The 5 Key Questions */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          The 5 Core Hackathon Judge Pillars
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {fiveQuestions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
              <div className={`font-bold text-xs mb-1.5 ${item.color}`}>
                {item.q}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
