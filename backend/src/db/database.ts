import path from 'path';
import fs from 'fs';
import { AgentEvent, SensorData, SystemOutcome } from '../types/index.js';

export interface IncidentRecord {
  id: string;
  timestamp: string;
  zone: string;
  severity: string;
  outcome: SystemOutcome;
  actions: string;
  explanation: string;
}

export interface TelemetryRecord {
  id: string;
  timestamp: string;
  flow_in: number;
  flow_out: number;
  pressure: number;
  loss: number;
  severity: string;
}

interface DatabaseSchema {
  events: AgentEvent[];
  incidents: IncidentRecord[];
  telemetry: TelemetryRecord[];
}

class DatabaseManager {
  private filePath: string;
  private data: DatabaseSchema = {
    events: [],
    incidents: [],
    telemetry: [],
  };

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, 'aqua_agent_db.json');
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
      }
      console.log('[Database] Persistent store initialized at ' + this.filePath);
    } catch (e) {
      console.warn('[Database] Initialized new persistent store.');
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('[Database] Failed to write database to disk:', e);
    }
  }

  public saveEvent(event: AgentEvent): void {
    this.data.events.unshift(event);
    if (this.data.events.length > 500) {
      this.data.events.pop();
    }
    this.save();
  }

  public getEvents(limit = 100): AgentEvent[] {
    return this.data.events.slice(0, limit);
  }

  public saveIncident(incident: IncidentRecord): void {
    this.data.incidents.unshift(incident);
    this.save();
  }

  public getIncidents(limit = 20): IncidentRecord[] {
    return this.data.incidents.slice(0, limit);
  }

  public saveTelemetry(sensor: SensorData, severity: string): void {
    const loss = Math.max(0, sensor.flow_in - sensor.flow_out);
    const rec: TelemetryRecord = {
      id: `tel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: sensor.timestamp,
      flow_in: sensor.flow_in,
      flow_out: sensor.flow_out,
      pressure: sensor.pressure,
      loss: parseFloat(loss.toFixed(2)),
      severity,
    };
    this.data.telemetry.push(rec);
    if (this.data.telemetry.length > 200) {
      this.data.telemetry.shift();
    }
    this.save();
  }

  public getTelemetryHistory(limit = 50): TelemetryRecord[] {
    return this.data.telemetry.slice(-limit);
  }

  public clearAll(): void {
    this.data = {
      events: [],
      incidents: [],
      telemetry: [],
    };
    this.save();
  }
}

export const dbManager = new DatabaseManager();
