import { 
  SensorData, 
  SimulationState, 
  ScenarioType, 
  ValveId, 
  ValveAction, 
  ValveStatus, 
  PipelineZone,
  AnomalyType 
} from '../types/index.js';

export class SimulationEngine {
  private state: SimulationState;

  constructor() {
    this.state = this.getDefaultState();
  }

  private getDefaultZones(): PipelineZone[] {
    return [
      {
        id: 'zone-1',
        name: 'Zone 1: Residential Sector (Sector A)',
        type: 'Residential',
        flow_in: 35.0,
        flow_out: 34.2,
        pressure: 3.1,
        loss: 0.8,
        lossPercentage: 0.023,
        status: 'NORMAL',
        activeValve: 'Valve 4',
        valveStatus: 'OPEN',
      },
      {
        id: 'zone-2',
        name: 'Zone 2: Commercial & Hospital District',
        type: 'Commercial',
        flow_in: 25.0,
        flow_out: 24.5,
        pressure: 2.9,
        loss: 0.5,
        lossPercentage: 0.02,
        status: 'NORMAL',
        activeValve: 'Valve 3',
        valveStatus: 'OPEN',
      },
      {
        id: 'zone-3',
        name: 'Zone 3: Industrial Park & Heavy Manufacturing',
        type: 'Industrial',
        flow_in: 40.0,
        flow_out: 38.3,
        pressure: 3.2,
        loss: 1.7,
        lossPercentage: 0.042,
        status: 'NORMAL',
        activeValve: 'Valve 1',
        valveStatus: 'OPEN',
      },
      {
        id: 'zone-4',
        name: 'Zone 4: Emergency Redundant Bypass Feed',
        type: 'Bypass',
        flow_in: 0.0,
        flow_out: 0.0,
        pressure: 3.2,
        loss: 0.0,
        lossPercentage: 0.0,
        status: 'NORMAL',
        activeValve: 'Valve 2',
        valveStatus: 'OPEN',
      },
    ];
  }

  private getDefaultState(): SimulationState {
    return {
      flow_in: 100.0,
      flow_out: 97.0,
      pressure: 3.2,
      zone: 'Zone 3 - Industrial Sector Main',
      valves: {
        'Valve 1': 'OPEN',
        'Valve 2': 'OPEN',
        'Valve 3': 'OPEN',
        'Valve 4': 'OPEN',
      },
      zones: this.getDefaultZones(),
      leakActive: false,
      theftActive: false,
      leakSeverity: 'NORMAL',
      anomalyType: 'NONE',
      anomalyLocation: 'None - All Zones Nominal',
      valveFailureMode: 'none',
    };
  }

  public reset(): SimulationState {
    this.state = this.getDefaultState();
    return this.getState();
  }

  public getState(): SimulationState {
    return {
      ...this.state,
      valves: { ...this.state.valves },
      zones: this.state.zones.map(z => ({ ...z })),
    };
  }

  public getSensorData(): SensorData {
    const jitter = (Math.random() - 0.5) * 0.4;
    const flow_in = parseFloat((this.state.flow_in + jitter * 0.2).toFixed(1));
    const flow_out = parseFloat((this.state.flow_out + jitter * 0.2).toFixed(1));
    const pressure = parseFloat((this.state.pressure + jitter * 0.05).toFixed(2));

    const updatedZones = this.state.zones.map(z => {
      const zJitter = (Math.random() - 0.5) * 0.2;
      return {
        ...z,
        flow_in: parseFloat((z.flow_in + zJitter).toFixed(1)),
        flow_out: parseFloat((z.flow_out + zJitter).toFixed(1)),
        pressure: parseFloat((z.pressure + zJitter * 0.1).toFixed(2)),
        valveStatus: this.state.valves[z.activeValve] || 'OPEN',
      };
    });

    return {
      flow_in,
      flow_out,
      pressure,
      zone: this.state.zone,
      timestamp: new Date().toISOString(),
      valve_status: { ...this.state.valves },
      zones: updatedZones,
      anomalyType: this.state.anomalyType,
      anomalyLocation: this.state.anomalyLocation,
    };
  }

  public setScenario(scenario: ScenarioType): SimulationState {
    const zones = this.getDefaultZones();

    switch (scenario) {
      case 'normal':
        this.state = {
          flow_in: 100.0,
          flow_out: 97.0,
          pressure: 3.2,
          zone: 'Main Distribution Header',
          valves: { 'Valve 1': 'OPEN', 'Valve 2': 'OPEN', 'Valve 3': 'OPEN', 'Valve 4': 'OPEN' },
          zones,
          leakActive: false,
          theftActive: false,
          leakSeverity: 'NORMAL',
          anomalyType: 'NONE',
          anomalyLocation: 'None - All Sectors Balanced',
          valveFailureMode: 'none',
        };
        break;

      case 'medium-leak':
        // Moderate leak in Zone 3
        zones[2].flow_out = 22.0;
        zones[2].loss = 18.0;
        zones[2].lossPercentage = 0.45;
        zones[2].pressure = 2.4;
        zones[2].status = 'LEAK';

        this.state = {
          flow_in: 100.0,
          flow_out: 82.0,
          pressure: 2.4,
          zone: 'Zone 3: Industrial Park',
          valves: { 'Valve 1': 'OPEN', 'Valve 2': 'OPEN', 'Valve 3': 'OPEN', 'Valve 4': 'OPEN' },
          zones,
          leakActive: true,
          theftActive: false,
          leakSeverity: 'MEDIUM',
          anomalyType: 'LEAK_RUPTURE',
          anomalyLocation: 'Zone 3 - Industrial Main Branch Junction J3',
          valveFailureMode: 'none',
        };
        break;

      case 'high-leak':
        // Acute physical burst rupture in Zone 3
        zones[2].flow_out = 10.0;
        zones[2].loss = 30.0;
        zones[2].lossPercentage = 0.75;
        zones[2].pressure = 1.6;
        zones[2].status = 'LEAK';

        this.state = {
          flow_in: 100.0,
          flow_out: 58.0,
          pressure: 1.6,
          zone: 'Zone 3: Industrial Park',
          valves: { 'Valve 1': 'OPEN', 'Valve 2': 'OPEN', 'Valve 3': 'OPEN', 'Valve 4': 'OPEN' },
          zones,
          leakActive: true,
          theftActive: false,
          leakSeverity: 'HIGH',
          anomalyType: 'LEAK_RUPTURE',
          anomalyLocation: 'Zone 3 - High-Pressure Line Rupture at Node #104',
          valveFailureMode: 'none',
        };
        break;

      case 'water-theft':
        // Illegal Water Tapping / Siphoning in Zone 2
        // Characteristic: High unmetered loss (18 L/s), but line pressure remains intact (2.85 bar)
        zones[1].flow_in = 25.0;
        zones[1].flow_out = 7.0; // 18 L/s stolen through illegal bypass tap
        zones[1].loss = 18.0;
        zones[1].lossPercentage = 0.72;
        zones[1].pressure = 2.85; // Pressure is high because pipe is not physically broken
        zones[1].status = 'THEFT';

        this.state = {
          flow_in: 100.0,
          flow_out: 82.0, // 18 L/s unmetered deficit
          pressure: 2.85, // stable line pressure confirms unauthorized draw rather than physical rupture
          zone: 'Zone 2: Commercial & Hospital District',
          valves: { 'Valve 1': 'OPEN', 'Valve 2': 'OPEN', 'Valve 3': 'OPEN', 'Valve 4': 'OPEN' },
          zones,
          leakActive: false,
          theftActive: true,
          leakSeverity: 'MEDIUM',
          anomalyType: 'WATER_THEFT',
          anomalyLocation: 'Zone 2 - Unauthorized Tapping Detected on Commercial Feeder #12B',
          valveFailureMode: 'none',
        };
        break;

      case 'failure':
        // Critical Failure & Adaptation Scenario:
        // Rupture in Zone 3, Valve 1 Jammed, Valve 2 operational backup
        zones[2].flow_out = 10.0;
        zones[2].loss = 30.0;
        zones[2].lossPercentage = 0.75;
        zones[2].pressure = 1.6;
        zones[2].status = 'LEAK';

        this.state = {
          flow_in: 100.0,
          flow_out: 58.0,
          pressure: 1.6,
          zone: 'Zone 3: Industrial Park',
          valves: { 'Valve 1': 'OPEN', 'Valve 2': 'OPEN', 'Valve 3': 'OPEN', 'Valve 4': 'OPEN' },
          zones,
          leakActive: true,
          theftActive: false,
          leakSeverity: 'HIGH',
          anomalyType: 'LEAK_RUPTURE',
          anomalyLocation: 'Zone 3 - Critical Rupture [Valve 1 Jammed]',
          valveFailureMode: 'valve1_fail',
        };
        break;

      case 'both-failed':
        zones[2].flow_out = 10.0;
        zones[2].loss = 30.0;
        zones[2].lossPercentage = 0.75;
        zones[2].pressure = 1.6;
        zones[2].status = 'LEAK';

        this.state = {
          flow_in: 100.0,
          flow_out: 58.0,
          pressure: 1.6,
          zone: 'Zone 3: Industrial Park',
          valves: { 'Valve 1': 'OPEN', 'Valve 2': 'OPEN', 'Valve 3': 'OPEN', 'Valve 4': 'OPEN' },
          zones,
          leakActive: true,
          theftActive: false,
          leakSeverity: 'HIGH',
          anomalyType: 'LEAK_RUPTURE',
          anomalyLocation: 'Zone 3 - Multi-Actuator Bus Outage',
          valveFailureMode: 'both_fail',
        };
        break;
    }

    return this.getState();
  }

  public executeValveAction(valveId: ValveId, action: ValveAction): { success: boolean; message: string; state: SimulationState } {
    if (this.state.valveFailureMode === 'valve1_fail' && valveId === 'Valve 1') {
      this.state.valves['Valve 1'] = 'FAULT';
      return {
        success: false,
        message: `Actuator hardware error on ${valveId}: Mechanical jam detected, valve failed to execute '${action}' command.`,
        state: this.getState(),
      };
    }

    if (this.state.valveFailureMode === 'both_fail') {
      this.state.valves[valveId] = 'FAULT';
      return {
        success: false,
        message: `Actuator power bus fault on ${valveId}: Telemetry lost and command '${action}' failed.`,
        state: this.getState(),
      };
    }

    this.state.valves[valveId] = action === 'close' ? 'CLOSED' : 'OPEN';

    if (action === 'close') {
      // If closing Valve 1 or Valve 2 (isolating Zone 3 leak)
      if (valveId === 'Valve 1' || valveId === 'Valve 2') {
        this.state.leakActive = false;
        this.state.leakSeverity = 'NORMAL';
        this.state.flow_in = 100.0;
        this.state.flow_out = 97.5;
        this.state.pressure = 3.15;
        this.state.zones[2].status = 'ISOLATED';
        this.state.zones[2].flow_out = 38.5;
        this.state.zones[2].loss = 1.5;
        this.state.zones[2].pressure = 3.15;
      }
      
      // If closing Valve 3 (isolating Zone 2 Water Theft tapping)
      if (valveId === 'Valve 3') {
        this.state.theftActive = false;
        this.state.flow_in = 100.0;
        this.state.flow_out = 98.0;
        this.state.pressure = 3.2;
        this.state.zones[1].status = 'ISOLATED';
        this.state.zones[1].flow_out = 24.5;
        this.state.zones[1].loss = 0.5;
      }
    }

    return {
      success: true,
      message: `${valveId} successfully actuated to '${action}' state. Target branch isolation active.`,
      state: this.getState(),
    };
  }

  public injectSensorReading(flowIn: number, flowOut: number, pressure: number, zone?: string): SensorData {
    this.state.flow_in = flowIn;
    this.state.flow_out = flowOut;
    this.state.pressure = pressure;
    if (zone) this.state.zone = zone;

    const loss = flowIn - flowOut;
    const lossPercentage = flowIn > 0 ? loss / flowIn : 0;
    
    // Anomaly identification
    if (lossPercentage >= 0.10 && pressure >= 2.5) {
      this.state.anomalyType = 'WATER_THEFT';
      this.state.theftActive = true;
      this.state.leakActive = false;
      this.state.leakSeverity = 'MEDIUM';
      this.state.anomalyLocation = `${zone || 'Selected Branch'} - High Unmetered Mass Loss with Intact Hydraulic Pressure`;
    } else if (lossPercentage >= 0.10 || pressure < 2.5) {
      this.state.anomalyType = 'LEAK_RUPTURE';
      this.state.leakActive = true;
      this.state.theftActive = false;
      this.state.leakSeverity = (lossPercentage >= 0.25 || pressure < 2.0) ? 'HIGH' : 'MEDIUM';
      this.state.anomalyLocation = `${zone || 'Selected Branch'} - Physical Pipe Rupture & Pressure Drop`;
    } else {
      this.state.anomalyType = 'NONE';
      this.state.leakActive = false;
      this.state.theftActive = false;
      this.state.leakSeverity = 'NORMAL';
      this.state.anomalyLocation = 'None - Nominal Balance';
    }

    return this.getSensorData();
  }
}

export const simulationEngine = new SimulationEngine();
