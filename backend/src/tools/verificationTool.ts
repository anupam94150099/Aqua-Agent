import { SensorData, LeakAnalysis, ToolResult } from '../types/index.js';
import { simulationEngine } from '../simulation/SimulationEngine.js';
import { DecisionEngine } from '../agent/DecisionEngine.js';

export async function verifyRecovery(): Promise<ToolResult<{ recovered: boolean; sensorData: SensorData; analysis: LeakAnalysis }>> {
  const sensorData = simulationEngine.getSensorData();
  const analysis = DecisionEngine.analyzeLeakage(sensorData);
  const recovered = analysis.severity === 'NORMAL' && analysis.lossPercentage < 0.10 && sensorData.pressure >= 2.5;

  return {
    success: true,
    tool: 'verifyRecovery',
    data: {
      recovered,
      sensorData,
      analysis,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function getZoneStatus(zone: string): Promise<ToolResult> {
  const sensor = simulationEngine.getSensorData();
  const sim = simulationEngine.getState();
  return {
    success: true,
    tool: 'getZoneStatus',
    data: {
      zone: zone || sim.zone,
      valves: sim.valves,
      leakActive: sim.leakActive,
      leakSeverity: sim.leakSeverity,
      lastTelemetry: sensor,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function analyzeLeakageTool(sensorData: SensorData): Promise<ToolResult<LeakAnalysis>> {
  const analysis = DecisionEngine.analyzeLeakage(sensorData);
  return {
    success: true,
    tool: 'analyzeLeakage',
    data: analysis,
    timestamp: new Date().toISOString(),
  };
}

export async function resetSimulationTool(): Promise<ToolResult> {
  const state = simulationEngine.reset();
  return {
    success: true,
    tool: 'resetSimulation',
    data: {
      message: 'Simulation and physical pipeline reset to initial nominal conditions.',
      state,
    },
    timestamp: new Date().toISOString(),
  };
}
