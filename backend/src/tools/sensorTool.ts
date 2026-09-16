import { SensorData, ToolResult } from '../types/index.js';
import { simulationEngine } from '../simulation/SimulationEngine.js';

export async function getSensorData(): Promise<ToolResult<SensorData>> {
  const sensorData = simulationEngine.getSensorData();
  return {
    success: true,
    tool: 'getSensorData',
    data: sensorData,
    timestamp: new Date().toISOString(),
  };
}
