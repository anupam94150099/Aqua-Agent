from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SensorReading(BaseModel):
    timestamp: str
    flow_rate: float
    pressure: float
    expected_flow_min: float = 40.0
    expected_flow_max: float = 45.0
    expected_pressure_min: float = 3.5
    expected_pressure_max: float = 4.0
    zone_b_flow: float
    zone_b_pressure: float

class ValveStatus(BaseModel):
    id: str
    name: str
    zone: str
    status: str # OPEN, CLOSED, FAILED, CLOSING
    last_command: Optional[str] = None
    last_response_time_ms: Optional[int] = None
    failure_rate_sim: float = 0.0

class ZoneStatus(BaseModel):
    id: str
    name: str
    status: str # NORMAL, WARNING, LEAK DETECTED, ISOLATED, RESOLVED
    flow_rate: float
    pressure: float
    valves: List[str]

class AgentDecisionExplain(BaseModel):
    title: str
    timestamp: str
    observations: Dict[str, Any]
    reasoning: str
    selected_action: str
    expected_outcome: str
    verification_status: str
    decision_result: str

class SystemLog(BaseModel):
    id: str
    timestamp: str
    event: str
    severity: str # INFO, WARNING, ERROR, SUCCESS, CRITICAL
    source: str # SENSOR_MONITOR, AGENT_ENGINE, ACTUATOR_V1, ACTUATOR_V2, HUMAN_OPERATOR
    details: str

class Incident(BaseModel):
    id: str
    timestamp: str
    zone: str
    type: str
    severity: str
    status: str # DETECTED, ANALYZING, CONTAINING, REPLANNING, VERIFYING, RESOLVED, ESCALATED_TO_HUMAN
    actions_taken: List[str]
    resolution: str
    water_lost_liters: float
    water_saved_liters: float
    timeline: List[Dict[str, Any]]
    explanation: Optional[AgentDecisionExplain] = None

class SystemOverview(BaseModel):
    app_name: str = "AquaAgent"
    subtitle: str = "Autonomous AI for Smarter Water Networks"
    system_status: str
    current_flow_rate: float
    current_pressure: float
    active_zones_count: str
    water_saved_liters: float
    water_lost_liters: float
    active_incidents_count: int
    agent_status: str # AUTONOMOUS, HUMAN_OVERRIDE, ESCALATED
    current_objective: str
    current_stage: str # OBSERVE, ANALYZE, PLAN, ACT, VERIFY, ADAPT, ESCALATE, RESOLVED, IDLE
    scenario: str # NORMAL, LEAK, VALVE1_FAILURE, ADAPT_RECOVER, BOTH_FAILED
    auto_loop_enabled: bool
    latest_thought: str
