import React from 'react';
import { Info, Sparkles, Droplets, Cpu, Radio, ShieldCheck, ArrowRight, CheckCircle2, Layers, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Hero Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-cyan-500/30 bg-gradient-to-br from-[#0c4a6e]/40 via-[#0d1627] to-[#070e1b] shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Global Innovation Hackathon 2026 Submission</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Aqua<span className="text-cyan-400">Agent</span>
          </h1>

          <p className="text-lg text-cyan-200 font-medium">
            "From passive detection to autonomous closed-loop response."
          </p>

          <p className="text-xs text-slate-300 leading-relaxed">
            AquaAgent transforms traditional smart water monitoring by closing the operational loop: detecting hydraulic pipeline bursts, evaluating permitted safe isolation policies, triggering physical solenoid valves, verifying pressure recovery, and adapting dynamically when hardware fails.
          </p>
        </div>

        <div className="relative w-40 h-40 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center p-4 shadow-xl">
          <Droplets className="w-20 h-20 text-cyan-400 animate-pulse" />
          <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-xl"></div>
        </div>

      </div>

      {/* The Core 5-Stage Agent Loop */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 bg-[#0d1627]/90 space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          The Autonomous Closed-Loop Architecture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          {[
            { step: '1. OBSERVE', desc: 'Real-time ingestion of flow rate (L/min), pipeline pressure (bar), and valve conductance.' },
            { step: '2. REASON', desc: 'Cross-sensor anomaly correlation identifies bursts and isolates false-positive meter noise.' },
            { step: '3. ACT', desc: 'Dispatches targeted wireless commands to isolate the nearest upstream safety valve.' },
            { step: '4. VERIFY', desc: 'Monitors post-action telemetry to ensure flow normalizes and line pressure stabilizes.' },
            { step: '5. ADAPT / ESCALATE', desc: 'If primary actuators jam, replans secondary valves; escalates to human if options exhaust.' }
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <span className="font-mono font-bold text-cyan-300 text-xs mb-1.5">{item.step}</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware Integration Roadmap */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 bg-[#0d1627]/90 space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          Hardware & Physical Deployment Architecture
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed">
          The prototype was engineered with an abstracted telemetry driver layer. Replacing the simulation engine with real physical hardware requires zero UI or agent logic changes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="font-bold text-white block mb-1">Microcontroller Node</span>
            <span className="text-cyan-400 font-mono text-[11px] block mb-2">ESP32-WROOM-32</span>
            <p className="text-slate-400 text-[11px]">
              Collects pulse interrupts from flow meters, samples analog pressure sensors at 50Hz, and communicates over WiFi/MQTT.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="font-bold text-white block mb-1">Hydraulic Sensors</span>
            <span className="text-sky-400 font-mono text-[11px] block mb-2">YF-S201 & DFRobot Transducer</span>
            <p className="text-slate-400 text-[11px]">
              0.5–30 L/min Hall-effect flow turbine paired with a 0–1.2 MPa high-precision piezoresistive pressure transmitter.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="font-bold text-white block mb-1">Actuator Control</span>
            <span className="text-emerald-400 font-mono text-[11px] block mb-2">12V Solenoid & Relay Optocoupler</span>
            <p className="text-slate-400 text-[11px]">
              Normally-open latching brass solenoid valves driven via optocoupled MOSFET drivers with current-sensing feedback.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
