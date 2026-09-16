import { ValveId, ValveAction, ToolResult } from '../types/index.js';
import { simulationEngine } from '../simulation/SimulationEngine.js';

export async function controlValve(valveId: ValveId, action: ValveAction): Promise<ToolResult> {
  const result = simulationEngine.executeValveAction(valveId, action);
  
  return {
    success: result.success,
    tool: 'controlValve',
    valve: valveId,
    action: action,
    error: result.success ? undefined : result.message,
    data: {
      message: result.message,
      pipelineState: result.state,
    },
    timestamp: new Date().toISOString(),
  };
}
