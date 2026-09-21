import React from 'react';
import KpiCards from '../components/KpiCards';
import DemoControlCenter from '../components/DemoControlCenter';
import PipelineTopologyMap from '../components/PipelineTopologyMap';
import SensorCharts from '../components/SensorCharts';
import AIAgentPanel from '../components/AIAgentPanel';
import WhyAquaAgent from '../components/WhyAquaAgent';

export default function DashboardPage({
  status,
  sensors,
  network,
  agentState,
  activeScenario,
  onTriggerScenario,
  onReset,
  onStepAI,
  onToggleValve,
  onOpenExplain,
  onReplan,
  onVerify
}) {
  return (
    <div className="space-y-6">
      
      {/* 1. Top KPI Row */}
      <KpiCards status={status} sensors={sensors} />

      {/* 2. Demo Control Center Banner */}
      <DemoControlCenter
        activeScenario={activeScenario}
        onTriggerScenario={onTriggerScenario}
        onReset={onReset}
        onStepAI={onStepAI}
      />

      {/* 3. Main Center Grid: Topology Map + AI Agent Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <PipelineTopologyMap
            network={network}
            sensors={sensors}
            onToggleValve={onToggleValve}
            isOverride={status?.agent_status === 'HUMAN_OVERRIDE'}
          />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <AIAgentPanel
            agentState={agentState}
            onOpenExplain={onOpenExplain}
            onReplan={onReplan}
            onVerify={onVerify}
          />
        </div>
      </div>

      {/* 4. Live Sensor Telemetry Charts */}
      <SensorCharts sensors={sensors} />

      {/* 5. Why AquaAgent 30-Second Judge Section */}
      <WhyAquaAgent />

    </div>
  );
}
