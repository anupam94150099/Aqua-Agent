import React from 'react';
import { LayoutDashboard, Network, Cpu, AlertCircle, BarChart3, Terminal, Settings, HelpCircle, Info } from 'lucide-react';

export default function Navigation({ activeTab, onSelectTab, incidentCount = 0 }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'network', label: 'Live Network', icon: Network },
    { id: 'agent', label: 'AI Agent', icon: Cpu },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle, badge: incidentCount > 0 ? incidentCount : null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'System Logs', icon: Terminal },
    { id: 'why', label: 'Why AquaAgent?', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <nav className="bg-[#0f172a]/60 border-b border-slate-800/80 px-4 lg:px-8 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold font-mono animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
