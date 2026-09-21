import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea } from 'recharts';
import { Activity, Gauge, Droplet, Clock } from 'lucide-react';

export default function SensorCharts({ sensors }) {
  const history = sensors?.history || [];
  const currentFlow = sensors?.current?.flow_rate ?? 42.4;
  const currentPressure = sensors?.current?.pressure ?? 3.82;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b1120] border border-cyan-500/30 p-2.5 rounded-xl shadow-xl text-xs font-mono">
          <div className="text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Time: {label}</span>
          </div>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 font-semibold" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span>{typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      {/* 1. Flow Rate Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Flow Rate vs Time
              </h3>
              <p className="text-[11px] text-slate-400">
                Safe Baseline: 40.0 – 45.0 L/min
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-lg font-bold text-cyan-300">
              {currentFlow.toFixed(1)} <span className="text-xs text-slate-400">L/min</span>
            </div>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              currentFlow > 55 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-cyan-950 text-cyan-400'
            }`}>
              {currentFlow > 55 ? 'SURGE ANOMALY' : 'NORMAL RANGE'}
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis domain={[20, 110]} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Baseline Safe Green Band */}
              <ReferenceArea y1={40} y2={45} fill="#10b981" fillOpacity={0.08} stroke="#10b981" strokeOpacity={0.2} strokeDasharray="2 2" />

              <Line
                type="monotone"
                dataKey="flow_rate"
                name="Flow Rate (L/min)"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#38bdf8' }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="zone_b_flow"
                name="Zone B Local Flow"
                stroke="#818cf8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Pressure Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Pipeline Pressure vs Time
              </h3>
              <p className="text-[11px] text-slate-400">
                Safe Baseline: 3.5 – 4.0 bar
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-lg font-bold text-sky-300">
              {currentPressure.toFixed(2)} <span className="text-xs text-slate-400">bar</span>
            </div>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              currentPressure < 3.0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-sky-950 text-sky-400'
            }`}>
              {currentPressure < 3.0 ? 'LOW PRESSURE' : 'NORMAL HEAD'}
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis domain={[1.0, 4.5]} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Baseline Safe Blue Band */}
              <ReferenceArea y1={3.5} y2={4.0} fill="#0284c7" fillOpacity={0.08} stroke="#0284c7" strokeOpacity={0.2} strokeDasharray="2 2" />

              <Line
                type="monotone"
                dataKey="pressure"
                name="Pressure (bar)"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#0ea5e9' }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="zone_b_pressure"
                name="Zone B Pressure"
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
