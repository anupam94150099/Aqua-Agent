import { 
  AgentPhase, 
  AgentMemoryState, 
  AgentEvent, 
  SensorData, 
  LeakAnalysis, 
  SystemOutcome, 
  ToolResult 
} from '../types/index.js';
import { dbManager } from '../db/database.js';

export type EventListener = (event: AgentEvent, state: AgentMemoryState) => void;

export class AgentState {
  private memory: AgentMemoryState;
  private listeners: EventListener[] = [];

  constructor() {
    this.memory = this.getInitialState();
  }

  private getInitialState(): AgentMemoryState {
    return {
      currentGoal: 'Detect and isolate abnormal water leakage while minimizing water wastage and maintaining safe operation.',
      currentPhase: 'IDLE',
      currentZone: 'Zone 4 - Industrial Sector',
      sensorData: {
        flow_in: 100.0,
        flow_out: 97.0,
        pressure: 3.2,
        zone: 'Zone 4 - Industrial Sector',
        timestamp: new Date().toISOString(),
        valve_status: { 'Valve 1': 'OPEN', 'Valve 2': 'OPEN' },
      },
      attemptedActions: [],
      actionResults: [],
      failures: [],
      eventHistory: [],
      finalOutcome: 'IDLE',
      decisionExplanation: 'Agent standing by for pipeline telemetry signals.',
    };
  }

  public reset(): void {
    this.memory = this.getInitialState();
    dbManager.clearAll();
  }

  public getState(): AgentMemoryState {
    return {
      ...this.memory,
      sensorData: { ...this.memory.sensorData, valve_status: { ...this.memory.sensorData.valve_status } },
      attemptedActions: [...this.memory.attemptedActions],
      actionResults: [...this.memory.actionResults],
      failures: [...this.memory.failures],
      eventHistory: [...this.memory.eventHistory],
    };
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public emitEvent(
    phase: AgentPhase, 
    step: string, 
    details: string, 
    data?: Record<string, any>
  ): AgentEvent {
    const now = new Date();
    const timeFormatted = now.toTimeString().split(' ')[0];
    const event: AgentEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.toISOString(),
      timeFormatted,
      phase,
      step,
      details,
      data,
    };

    this.memory.currentPhase = phase;
    this.memory.eventHistory.unshift(event);
    if (this.memory.eventHistory.length > 300) {
      this.memory.eventHistory.pop();
    }

    dbManager.saveEvent(event);

    const currentState = this.getState();
    this.listeners.forEach(fn => {
      try {
        fn(event, currentState);
      } catch (err) {
        console.error('[AgentState] Listener notification error:', err);
      }
    });

    return event;
  }

  public updateSensorData(sensorData: SensorData): void {
    this.memory.sensorData = { ...sensorData };
    this.memory.currentZone = sensorData.zone;
  }

  public updateAnalysis(analysis: LeakAnalysis): void {
    this.memory.analysis = { ...analysis };
    dbManager.saveTelemetry(this.memory.sensorData, analysis.severity);
  }

  public updateGoal(goal: string): void {
    this.memory.currentGoal = goal;
  }

  public updateDecision(explanation: string, action?: string): void {
    this.memory.decisionExplanation = explanation;
    if (action) this.memory.selectedAction = action;
  }

  public recordAttempt(valveOrAction: string): void {
    if (!this.memory.attemptedActions.includes(valveOrAction)) {
      this.memory.attemptedActions.push(valveOrAction);
    }
  }

  public recordActionResult(result: ToolResult): void {
    this.memory.actionResults.push(result);
    if (!result.success && result.error) {
      this.memory.failures.push(result.error);
    }
  }

  public setFinalOutcome(outcome: SystemOutcome): void {
    this.memory.finalOutcome = outcome;
  }
}

export const globalAgentState = new AgentState();
