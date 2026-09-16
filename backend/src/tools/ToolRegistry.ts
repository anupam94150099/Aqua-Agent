import { ValveId, ValveAction, SensorData, ToolResult } from '../types/index.js';
import { getSensorData } from './sensorTool.js';
import { controlValve } from './valveTool.js';
import { sendAlert } from './alertTool.js';
import { verifyRecovery, getZoneStatus, analyzeLeakageTool, resetSimulationTool } from './verificationTool.js';

export class ToolRegistry {
  public static async getSensorData(): Promise<ToolResult<SensorData>> {
    return await getSensorData();
  }

  public static async analyzeLeakage(sensorData: SensorData) {
    return await analyzeLeakageTool(sensorData);
  }

  public static async getZoneStatus(zone: string) {
    return await getZoneStatus(zone);
  }

  public static async controlValve(valveId: ValveId, action: ValveAction): Promise<ToolResult> {
    return await controlValve(valveId, action);
  }

  public static async sendAlert(message: string, severity: 'INFO' | 'WARNING' | 'CRITICAL'): Promise<ToolResult> {
    return await sendAlert(message, severity);
  }

  public static async verifyRecovery() {
    return await verifyRecovery();
  }

  public static async resetSimulation() {
    return await resetSimulationTool();
  }

  public static getRegisteredTools() {
    return [
      {
        name: 'getSensorData',
        description: 'Pulls current live telemetric sensor data (flow_in, flow_out, pressure, zone, valve status)',
        parameters: {},
      },
      {
        name: 'analyzeLeakage',
        description: 'Computes water mass balance loss, loss percentage, and classifies pipeline leak severity',
        parameters: { sensorData: 'SensorData' },
      },
      {
        name: 'getZoneStatus',
        description: 'Retrieves pipeline zone topology and valve operating state',
        parameters: { zone: 'string' },
      },
      {
        name: 'controlValve',
        description: 'Commands an electro-mechanical isolation valve actuator to open or close',
        parameters: { valveId: 'Valve 1 | Valve 2', action: 'open | close' },
      },
      {
        name: 'sendAlert',
        description: 'Dispatches emergency telemetry notifications or escalations to field maintenance',
        parameters: { message: 'string', severity: 'INFO | WARNING | CRITICAL' },
      },
      {
        name: 'verifyRecovery',
        description: 'Takes fresh post-action telemetry and verifies if water loss is resolved',
        parameters: {},
      },
      {
        name: 'resetSimulation',
        description: 'Restores hydraulic simulation to baseline nominal parameters',
        parameters: {},
      },
    ];
  }
}
