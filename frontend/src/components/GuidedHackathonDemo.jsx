import React, { useState, useEffect } from 'react';
import { X, Play, Pause, SkipForward, RotateCcw, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function GuidedHackathonDemo({ isOpen, onClose, onRefreshData }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3000); // 3 seconds per step

  const steps = [
    {
      step: 1,
      title: 'Normal Operational Grid',
      stage: 'OBSERVE',
      narration: 'The network is in equilibrium. Flow is 42.4 L/min and pressure is 3.82 bar across all 4 zones. AquaAgent continuously analyzes telemetry streams.',
      action: async () => {
        await api.triggerNormal();
      }
    },
    {
      step: 2,
      title: 'Pipeline Burst Detected in Zone B',
      stage: 'OBSERVE',
      narration: 'A simulated high-pressure pipe rupture occurs in Zone B. Flow surges by 82% to ~82 L/min and pressure plunges by 41% to ~1.9 bar.',
      action: async () => {
        await api.triggerLeak();
      }
    },
    {
      step: 3,
      title: 'Agent Analyzes & Correlates Anomaly',
      stage: 'ANALYZE',
      narration: 'AquaAgent performs cross-sensor correlation, eliminates false alarms, classifies severity as HIGH, and selects safe isolation policy P-04.',
      action: async () => {
        await api.stepSimulation();
      }
    },
    {
      step: 4,
      title: 'Valve 1 Actuation & Mechanical Failure',
      stage: 'ACT',
      narration: 'AquaAgent transmits a close command to primary Valve 1. However, Valve 1 encounters a mechanical jam or timeout and fails to isolate.',
      action: async () => {
        await api.triggerValve1Failure();
      }
    },
    {
      step: 5,
      title: 'Autonomous Replanning (Key Agentic Trait)',
      stage: 'ADAPT',
      narration: 'Unlike static alert systems, AquaAgent does NOT give up. It detects the actuator failure, replans dynamically, and selects secondary Valve 2.',
      action: async () => {
        await api.triggerReplan();
      }
    },
    {
      step: 6,
      title: 'Valve 2 Alternate Path Activated',
      stage: 'ACT',
      narration: 'AquaAgent commands Valve 2 on the secondary ring. Valve 2 confirms closure in 180ms, effectively cutting off the ruptured pipe segment.',
      action: async () => {
        await api.triggerAdaptRecover();
      }
    },
    {
      step: 7,
      title: 'Post-Action Verification Active',
      stage: 'VERIFY',
      narration: 'The agent monitors hydraulic stabilization. Flow normalizes back to 42.1 L/min and network pressure recovers to 3.82 bar.',
      action: async () => {
        await api.triggerVerify();
      }
    },
    {
      step: 8,
      title: 'Incident Resolved & Water Loss Prevented',
      stage: 'RESOLVED',
      narration: 'Verification passes! Incident marked RESOLVED with complete explainability audit logs. 1,248 L of water saved in under 15 seconds.',
      action: async () => {
        await api.stepSimulation();
      }
    }
  ];

  // Run step action
  const executeStep = async (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      try {
        await steps[stepIndex].action();
        if (onRefreshData) onRefreshData();
      } catch (err) {
        console.error('Error executing demo step:', err);
      }
    }
  };

  // Auto-play timer
  useEffect(() => {
    let timer = null;
    if (isPlaying && isOpen) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next >= steps.length) {
            setIsPlaying(false);
            return prev;
          }
          executeStep(next);
          return next;
        });
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isOpen, speed]);

  if (!isOpen) return null;

  const current = steps[currentStep] || steps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0d1627] border border-cyan-500/50 p-6 shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Guided Hackathon Pitch Demo
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                8-Step Autonomous Closed-Loop Story for Hackathon Judges (2 Minutes)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsPlaying(false);
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Bar */}
        <div className="mt-5 grid grid-cols-8 gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => executeStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-cyan-400 shadow-sm shadow-cyan-400 ring-2 ring-cyan-400/40'
                  : idx < currentStep
                  ? 'bg-emerald-400/80'
                  : 'bg-slate-800'
              }`}
              title={`Step ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Step Card Content */}
        <div className="mt-5 p-5 rounded-xl bg-slate-900/90 border border-cyan-500/25 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-xs font-bold">
                STEP {current.step}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs uppercase font-semibold">
                {current.stage}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Presentation Mode
            </span>
          </div>

          <h4 className="text-xl font-bold text-white mb-2 tracking-tight">
            {current.title}
          </h4>

          <p className="text-slate-200 text-sm leading-relaxed bg-[#070e1b] p-4 rounded-xl border border-slate-800">
            "{current.narration}"
          </p>
        </div>

        {/* Controller Bar */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => executeStep(0)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Restart from Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-md shadow-cyan-600/25"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play Story'}</span>
            </button>
            <button
              onClick={() => executeStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep >= steps.length - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Pace:</span>
            {[
              { label: 'Fast (2s)', val: 2000 },
              { label: 'Normal (3.5s)', val: 3500 },
              { label: 'Detailed (5s)', val: 5000 }
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setSpeed(p.val)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition ${
                  speed === p.val
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
