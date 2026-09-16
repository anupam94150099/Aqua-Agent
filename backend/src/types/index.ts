export type LeakSeverity = 'NORMAL' | 'MEDIUM' | 'HIGH';

export type AnomalyType = 'NONE' | 'LEAK_RUPTURE' | 'WATER_THEFT' | 'PRESSURE_SURGE';

export type ValveId = 
  | 'Valve 1' 
  | 'Valve 2' 
  | 'Valve 3' 
  | 'Valve 4';

export type ValveAction = 'open' | 'close';

export type ValveStatus = 'OPEN' | 'CLOSED' | 'FAULT';

export type AgentPhase = 
  | 'IDLE' 
  | 'OBSERVE' 
  | 'ANALYZE' 
  | 'PLAN' 
  | 'DECIDE' 
  | 'ACT' 
  | 'FAILURE' 
  | 'EVALUATE' 
  | 'ADAPT' 
  | 'VERIFY' 
  | 'RESOLVED' 
  | 'ADAPTED_AND_RESOLVED' 
  | 'ESCALATED';

export type SystemOutcome = 
  | 'NORMAL_OPERATION' 
  | 'RESOLVED' 
  | 'ADAPTED_AND_RESOLVED' 
  | 'ESCALATED' 
  | 'IN_PROGRESS' 
  | 'IDLE';

export interface PipelineZone {
  id: string;
  name: string;
  type: 'Residential' | 'Commercial' | 'Industrial' | 'Bypass';
  flow_in: number;
  flow_out: number;
  pressure: number;
  loss: number;
  lossPercentage: number;
  status: 'NORMAL' | 'LEAK' | 'THEFT' | 'ISOLATED';
  activeValve: ValveId;
  valveStatus: ValveStatus;
}

export interface SensorData {
  flow_in: number;
  flow_out: number;
  pressure: number;
  zone: string;
  timestamp: string;
  valve_status: Record<ValveId, ValveStatus>;
  zones: PipelineZone[];
  anomalyType: AnomalyType;
  anomalyLocation: string;
}

export interface LeakAnalysis {
  flow_in: number;
  flow_out: number;
  loss: number;
  lossPercentage: number;
  pressure: number;
  severity: LeakSeverity;
  anomalyType: AnomalyType;
  leakProbability: number;
  theftProbability: number;
  isLeak: boolean;
  zone: string;
  message: string;
}

export interface AgentDecision {
  action: 'NO_ACTION' | 'ISOLATE_PRIMARY' | 'ISOLATE_SECONDARY' | 'RESTRICT_THEFT_BRANCH' | 'ESCALATE_HUMAN';
  targetValve?: ValveId;
  valveAction?: ValveAction;
  severity: LeakSeverity;
  anomalyType: AnomalyType;
  targetZone: string;
  reason: string;
  explanation: string;
}

export interface ToolResult<T = any> {
  success: boolean;
  tool: string;
  data?: T;
  error?: string;
  valve?: ValveId;
  action?: ValveAction;
  timestamp: string;
}

export interface AgentEvent {
  id: string;
  timestamp: string;
  timeFormatted: string;
  phase: AgentPhase;
  step: string;
  details: string;
  data?: Record<string, any>;
}

export interface AgentMemoryState {
  currentGoal: string;
  currentPhase: AgentPhase;
  currentZone: string;
  sensorData: SensorData;
  analysis?: LeakAnalysis;
  selectedAction?: string;
  attemptedActions: string[];
  actionResults: ToolResult[];
  failures: string[];
  eventHistory: AgentEvent[];
  finalOutcome: SystemOutcome;
  decisionExplanation?: string;
}

export interface SimulationState {
  flow_in: number;
  flow_out: number;
  pressure: number;
  zone: string;
  valves: Record<ValveId, ValveStatus>;
  zones: PipelineZone[];
  leakActive: boolean;
  theftActive: boolean;
  leakSeverity: LeakSeverity;
  anomalyType: AnomalyType;
  anomalyLocation: string;
  valveFailureMode: 'none' | 'valve1_fail' | 'both_fail';
}

export type ScenarioType = 
  | 'normal' 
  | 'medium-leak' 
  | 'high-leak' 
  | 'water-theft' 
  | 'failure' 
  | 'both-failed';
