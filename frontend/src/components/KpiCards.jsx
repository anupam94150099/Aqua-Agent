import React from 'react';
import { Droplet, Gauge, MapPin, ShieldCheck, AlertCircle, Cpu, TrendingUp, TrendingDown } from 'lucide-react';

export default function KpiCards({ status, sensors }) {
  const flow = sensors?.current?.flow_rate ?? status?.current_flow_rate ?? 42.4;
  const pressure = sensors?.current?.pressure ?? status?.current_pressure ?? 3.82;
  const waterSaved = status?.water_saved_liters ?? 1248;
  const activeIncidents = status?.active_incidents_count ?? 0;
  const agentStatus = status?.agent_status ?? 'AUTONOMOUS';
  const isLeak = flow > 55.0 || pressure < 3.0;

  const cards = [
    {
      title: 'Current Flow Rate',
      value: `${flow.toFixed(1)} L/min`,
      subtext: isLeak ? 'Anomaly detected (+82%)' : 'Nominal band (40–45 L/min)',
      icon: Droplet,
      isAlert: isLeak,
      badgeColor: isLeak ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      trendIcon: isLeak ? TrendingUp : null,
      trendText: isLeak ? '+38 L/min surge' : 'Stable flow'
    },
    {
      title: 'Pipeline Pressure',
      value: `${pressure.toFixed(2)} bar`,
      subtext: isLeak ? 'Severe drop (-41%)' : 'Nominal band (3.5–4.0 bar)',
      icon: Gauge,
      isAlert: isLeak,
      badgeColor: isLeak ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      trendIcon: isLeak ? TrendingDown : null,
      trendText: isLeak ? '-1.9 bar drop' : 'Optimal head'
    },
    {
      title: 'Active Zones',
      value: status?.active_zones_count || '4 / 4',
      subtext: 'Hydraulic grid topology online',
      icon: MapPin,
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      trendText: 'Zones A, B, C, D'
    },
    {
      title: 'Water Saved',
      value: `${Math.round(waterSaved).toLocaleString()} L`,
      subtext: 'Simulation estimate vs manual',
      icon: ShieldCheck,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      trendText: 'Fast containment'
    },
    {
      title: 'Active Incidents',
      value: `${activeIncidents}`,
      subtext: activeIncidents > 0 ? 'Zone B Isolation active' : 'Zero uncontained breaches',
      icon: AlertCircle,
      isAlert: activeIncidents > 0,
      badgeColor: activeIncidents > 0 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      trendText: activeIncidents > 0 ? 'Action in progress' : 'All clear'
    },
    {
      title: 'Agent Status',
      value: agentStatus,
      subtext: status?.current_stage ? `Stage: ${status.current_stage}` : 'Autonomous closed-loop',
      icon: Cpu,
      badgeColor: agentStatus === 'ESCALATED' 
        ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' 
        : agentStatus === 'HUMAN_OVERRIDE'
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
        : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      trendText: 'AI Core v2.4'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const TrendIcon = card.trendIcon;
        return (
          <div
            key={idx}
            className={`glass-panel rounded-xl p-4 transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
              card.isAlert ? 'border-rose-500/40 bg-rose-950/10 glow-rose' : ''
            }`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.badgeColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Main Metric */}
            <div className="my-1">
              <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight flex items-baseline gap-1.5">
                {card.value}
              </div>
            </div>

            {/* Bottom context / subtext */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="truncate pr-1">{card.subtext}</span>
              {card.trendText && (
                <span className={`font-mono font-medium flex items-center gap-0.5 whitespace-nowrap ${
                  card.isAlert ? 'text-rose-400' : 'text-cyan-400'
                }`}>
                  {TrendIcon && <TrendIcon className="w-2.5 h-2.5" />}
                  {card.trendText}
                </span>
              )}
            </div>

            {/* Subtle glow accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
          </div>
        );
      })}
    </div>
  );
}
