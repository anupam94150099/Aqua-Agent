import React from 'react';
import PipelineTopologyMap from '../components/PipelineTopologyMap';
import { Layers, Activity, Cpu, ShieldCheck, Power, Wifi, Radio, Server, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function LiveNetworkPage({ network, sensors, onToggleValve, status }) {
  const zones = network?.zones || {};
  const valves = network?.valves || {};

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Live Network & Hydraulic Grid Distribution
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            District Metered Areas (DMA) Topology, wireless solenoid actuator health, and telemetry routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            ESP32 / MQTT Mesh Online
          </span>
        </div>
      </div>

      {/* Main Map */}
      <PipelineTopologyMap
        network={network}
        sensors={sensors}
        onToggleValve={onToggleValve}
        isOverride={status?.agent_status === 'HUMAN_OVERRIDE'}
      />

      {/* DMA Zones Detailed Grid */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          DMA Zone Telemetry Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(zones).map(([zoneKey, z]) => {
            const isAlert = z.status === 'LEAK DETECTED';
            const isIsolated = z.status === 'ISOLATED';

            return (
              <div
                key={zoneKey}
                className={`glass-panel rounded-xl p-4 border transition ${
                  isAlert
                    ? 'bg-rose-950/20 border-rose-500/50 glow-rose'
                    : isIsolated
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white">
                    {z.name || zoneKey}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    isAlert
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                      : isIsolated
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-cyan-950 text-cyan-400 border-cyan-800'
                  }`}>
                    {z.status}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs text-slate-300 my-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Flow:</span>
                    <span className="font-bold text-cyan-300">{z.flow || '12.0'} L/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pressure:</span>
                    <span className="font-bold text-sky-300">{z.pressure || '3.80'} bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Conductance:</span>
                    <span className="text-slate-300">0.98 m³/h·bar</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Valves: {z.valves?.length ? z.valves.join(', ') : 'None'}</span>
                  <span className="text-emerald-400 font-mono">OK</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hardware Interface & Bridge Protocol */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-[#0d1627]/90 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Hardware Bridge & IoT Telemetry Interface
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Protocol: MQTT / JSON Telemetry Payload
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          AquaAgent's simulation engine outputs standardized JSON payloads over WebSockets/REST that drop-in match physical ESP32 microcontrollers wired to YF-S201 Hall-effect flow sensors, DFRobot analog pressure transducers, and 12V latching solenoid valves.
        </p>

        <div className="p-3 rounded-xl bg-[#070e1b] border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
          <code>
            {`// ESP32 -> AquaAgent Ingest Telemetry Topic: aquaagent/telemetry/zone_b
{
  "node_id": "esp32_zone_b_gateway_01",
  "timestamp": 1774138862,
  "flow_lpm": 82.4,
  "pressure_bar": 1.88,
  "valve_states": { "valve_1": "OPEN", "valve_2": "OPEN" },
  "rssi_dbm": -58
}`}
          </code>
        </div>
      </div>

    </div>
  );
}
