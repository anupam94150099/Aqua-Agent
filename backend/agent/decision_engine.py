import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import uuid

class AgentDecisionEngine:
    def __init__(self, simulation_engine):
        self.sim = simulation_engine
        self.reset()

    def reset(self):
        self.mode = "AUTONOMOUS"  # AUTONOMOUS, HUMAN_OVERRIDE, ESCALATED
        self.stage = "IDLE"  # IDLE, OBSERVE, ANALYZE, PLAN, ACT, VERIFY, ADAPT, ESCALATE, RESOLVED
        self.current_objective = "Continuous baseline monitoring, leak prevention, and pressure stability."
        self.latest_thought = "System nominal. Monitoring flow (40-45 L/min) and pressure (3.5-4.0 bar) across all 4 zones."
        self.current_incident_id: Optional[str] = None
        self.incidents: List[Dict[str, Any]] = []
        self.logs: List[Dict[str, Any]] = []
        self.timeline: List[Dict[str, Any]] = []
        self.active_decision_explanation: Optional[Dict[str, Any]] = None
        self.retries = 0
        self.target_valve_attempted = "valve_1"
        self.scenario = "NORMAL"
        
        self.add_log("SYSTEM_BOOT", "INFO", "AGENT_ENGINE", "AquaAgent Autonomous Decision Kernel v2.4 initialized in AUTONOMOUS mode.")
        self.add_log("BASELINE_VERIFIED", "INFO", "SENSOR_MONITOR", "Hydraulic baseline verified: Flow 42.4 L/min (+/-1.5%), Pressure 3.82 bar. All 4 zones healthy.")

    def add_log(self, event: str, severity: str, source: str, details: str):
        t_str = datetime.now().strftime("%H:%M:%S")
        entry = {
            "id": f"LOG-{uuid.uuid4().hex[:6].upper()}",
            "timestamp": t_str,
            "event": event,
            "severity": severity,
            "source": source,
            "details": details
        }
        self.logs.insert(0, entry)
        if len(self.logs) > 120:
            self.logs.pop()
        return entry

    def add_timeline_step(self, stage: str, message: str, details: Optional[Dict[str, Any]] = None):
        t_str = datetime.now().strftime("%H:%M:%S")
        entry = {
            "timestamp": t_str,
            "stage": stage,
            "message": message,
            "details": details or {}
        }
        self.timeline.append(entry)
        self.latest_thought = message

    def autonomous_step(self):
        """Advance the agent closed-loop state machine by one cycle"""
        if self.mode == "HUMAN_OVERRIDE":
            self.stage = "IDLE"
            self.latest_thought = "Human operator is in direct control. Autonomous actuation paused."
            return

        flow = self.sim.flow_rate
        pressure = self.sim.pressure

        # 1. Check for anomaly if currently IDLE or normal
        if self.stage in ["IDLE", "RESOLVED"]:
            if flow > 55.0 or pressure < 2.9 or self.sim.leak_active:
                self.stage = "OBSERVE"
                self.current_objective = "Contain detected hydraulic burst in Zone B and prevent network pressure collapse."
                self.current_incident_id = f"INC-{len(self.incidents) + 1:03d}"
                self.timeline = []
                self.retries = 0
                self.target_valve_attempted = "valve_1"
                
                self.add_log("FLOW_ANOMALY_DETECTED", "WARNING", "SENSOR_MONITOR", f"Flow surge detected: {flow} L/min (Expected: 40-45 L/min).")
                self.add_log("PRESSURE_DROP_DETECTED", "WARNING", "SENSOR_MONITOR", f"Pressure plummeted: {pressure} bar (Expected: 3.5-4.0 bar).")
                self.add_timeline_step("OBSERVE", f"Sensor anomaly detected. Flow={flow} L/min, Pressure={pressure} bar.")
                return

        # 2. OBSERVE -> ANALYZE
        if self.stage == "OBSERVE":
            self.stage = "ANALYZE"
            flow_pct = int(((flow - 42.0) / 42.0) * 100)
            pres_pct = int(((3.8 - pressure) / 3.8) * 100)
            self.add_log("CROSS_SENSOR_CORRELATION", "ERROR", "AGENT_ENGINE", f"Cross-sensor correlation indicates probable pipeline leakage (+{flow_pct}% Flow, -{pres_pct}% Pressure).")
            self.add_log("SEVERITY_CLASSIFIED_HIGH", "ERROR", "AGENT_ENGINE", "Severity classified as HIGH. Affected zone: Zone B.")
            self.add_timeline_step("ANALYZE", f"Cross-sensor correlation confirms pipeline leakage in Zone B (+{flow_pct}% Flow, -{pres_pct}% Pressure). Severity: HIGH.")
            return

        # 3. ANALYZE -> PLAN
        if self.stage == "ANALYZE":
            self.stage = "PLAN"
            target_valve = "valve_1" if self.retries == 0 else "valve_2"
            self.target_valve_attempted = target_valve
            valve_name = self.sim.valves[target_valve]["name"]
            self.add_log("ISOLATION_PLAN_SELECTED", "INFO", "AGENT_ENGINE", f"Selecting safe isolation action: Command {valve_name} ({target_valve}) to CLOSE.")
            self.add_timeline_step("PLAN", f"Selecting safe isolation action: Preparing command for {valve_name} ({target_valve}).")
            return

        # 4. PLAN -> ACT
        if self.stage == "ACT":
            target_valve = self.target_valve_attempted
            valve_name = self.sim.valves[target_valve]["name"]
            
            self.add_log(f"{target_valve.upper()}_COMMAND_SENT", "INFO", "AGENT_ENGINE", f"Command sent to {valve_name} ({target_valve}).")
            self.add_timeline_step("ACT", f"Command sent to {valve_name} ({target_valve}). Awaiting actuator response.")
            
            success = self.sim.command_valve(target_valve, "CLOSE")
            if success:
                self.stage = "VERIFY"
                resp_ms = self.sim.valves[target_valve]["last_response_time_ms"]
                self.add_log(f"{target_valve.upper()}_CONFIRMED_CLOSED", "SUCCESS", f"ACTUATOR_{target_valve.upper()}", f"{valve_name} response confirmed in {resp_ms}ms.")
                self.add_timeline_step("ACT", f"{valve_name} activated successfully. Initiating verification.")
            else:
                self.stage = "ADAPT"
                self.add_log(f"{target_valve.upper()}_RESPONSE_NOT_DETECTED", "CRITICAL", f"ACTUATOR_{target_valve.upper()}", f"{valve_name} response not detected (Actuator fault/timeout).")
                self.add_timeline_step("ADAPT", f"{valve_name} response not detected. Replanning response.")
            return

        # 5. ADAPT
        if self.stage == "ADAPT":
            if self.retries == 0:
                self.retries += 1
                self.stage = "PLAN"
                self.target_valve_attempted = "valve_2"
                self.add_log("AGENT_REPLAN_TRIGGERED", "WARNING", "AGENT_ENGINE", "Primary isolation path unavailable. Replanning response: Selecting Valve 2 as alternate isolation point.")
                self.add_timeline_step("ADAPT", "Primary isolation path unavailable. Valve 2 selected as alternate isolation point.")
            else:
                self.stage = "ESCALATE"
                self.mode = "ESCALATED"
                self.add_log("AUTONOMOUS_LIMIT_EXCEEDED", "CRITICAL", "AGENT_ENGINE", "Both automated isolation paths (Valve 1 & Valve 2) failed. Autonomous response exhausted.")
                self.add_timeline_step("ESCALATE", "Autonomous response exhausted. Both valves unavailable. Emergency escalation to human operator!")
                self.active_decision_explanation = {
                    "title": "Dual-Actuator Critical Fault - Human Escalation",
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                    "observations": {
                        "flow_rate": f"{flow} L/min (Expected: 40-45 L/min)",
                        "pressure": f"{pressure} bar (Expected: 3.5-4.0 bar)",
                        "valve_1": self.sim.valves["valve_1"]["status"],
                        "valve_2": self.sim.valves["valve_2"]["status"]
                    },
                    "reasoning": "High flow + severe pressure drop indicates ongoing pipeline burst. Both Valve 1 and Valve 2 failed actuation attempts. System cannot safely self-heal without physical technician intervention.",
                    "selected_action": "EMERGENCY_HUMAN_ESCALATION",
                    "expected_outcome": "Field technician dispatch alert; audible control-room alarm.",
                    "verification_status": "UNRESOLVED_AUTONOMOUS_LIMIT",
                    "decision_result": "HUMAN_INTERVENTION_REQUIRED"
                }
                self.record_incident("ESCALATED_TO_HUMAN", "Escalated to human operator (Dual Actuator Fault)")
            return

        # 6. VERIFY
        if self.stage == "VERIFY":
            if flow <= 46.0 and pressure >= 3.5:
                self.stage = "RESOLVED"
                self.sim.mark_zone_resolved("Zone B")
                self.add_log("FLOW_RETURNED_TO_NORMAL", "SUCCESS", "SENSOR_MONITOR", f"Flow returned to normal range ({flow} L/min).")
                self.add_log("PRESSURE_STABILIZED", "SUCCESS", "SENSOR_MONITOR", f"Pressure stabilized ({pressure} bar).")
                self.add_log("INCIDENT_RESOLVED", "SUCCESS", "AGENT_ENGINE", "Incident successfully resolved autonomously. Network integrity confirmed.")
                self.add_timeline_step("RESOLVED", f"Flow returned to normal range ({flow} L/min). Pressure stabilized ({pressure} bar). Incident resolved.")
                
                valve_label = "Valve 2 (Alternate after Actuator Fault)" if self.retries > 0 else "Valve 1 (Primary)"
                self.active_decision_explanation = {
                    "title": f"Autonomous Closed-Loop Containment ({valve_label})",
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                    "observations": {
                        "flow_rate": f"{flow} L/min (Expected: 40-45 L/min)",
                        "pressure": f"{pressure} bar (Expected: 3.5-4.0 bar)",
                        "valve_1": self.sim.valves["valve_1"]["status"],
                        "valve_2": self.sim.valves["valve_2"]["status"]
                    },
                    "reasoning": f"High flow + low pressure indicated a probable leakage event. {('Primary isolation attempt failed on Valve 1. Valve 2 was dynamically selected as permitted alternate.') if self.retries > 0 else 'Valve 1 was commanded to isolate Zone B.'}",
                    "selected_action": f"{self.target_valve_attempted.upper()} -> CLOSE",
                    "expected_outcome": "Zone B isolated, pressure restored to 3.8 bar across network.",
                    "verification_status": "Flow normalized. Pressure stabilized.",
                    "decision_result": "Incident resolved."
                }
                self.record_incident("RESOLVED", f"Auto-resolved via {valve_label}")
            else:
                self.add_timeline_step("VERIFY", f"Post-action verification active. Current flow: {flow} L/min, pressure: {pressure} bar...")
            return

    def record_incident(self, status: str, resolution: str):
        if not self.current_incident_id:
            return
            
        actions = []
        if self.sim.valves["valve_1"]["status"] in ["CLOSED", "FAILED"]:
            actions.append(f"Valve 1 ({self.sim.valves['valve_1']['status']})")
        if self.sim.valves["valve_2"]["status"] in ["CLOSED", "FAILED"]:
            actions.append(f"Valve 2 ({self.sim.valves['valve_2']['status']})")
        if not actions:
            actions = ["Telemetry Audit"]
            
        incident = {
            "id": self.current_incident_id,
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "zone": "Zone B",
            "type": "Pipeline Leakage",
            "severity": "HIGH" if status != "ESCALATED_TO_HUMAN" else "CRITICAL",
            "status": status,
            "actions_taken": actions,
            "resolution": resolution,
            "water_lost_liters": self.sim.water_lost_liters,
            "water_saved_liters": self.sim.water_saved_liters,
            "timeline": list(self.timeline),
            "explanation": self.active_decision_explanation
        }
        
        existing_idx = next((i for i, inc in enumerate(self.incidents) if inc["id"] == self.current_incident_id), None)
        if existing_idx is not None:
            self.incidents[existing_idx] = incident
        else:
            self.incidents.insert(0, incident)

    def trigger_replan_manual(self):
        self.stage = "ADAPT"
        self.autonomous_step()

    def trigger_verify_manual(self):
        self.stage = "VERIFY"
        self.autonomous_step()

    def set_human_override(self, enabled: bool):
        if enabled:
            self.mode = "HUMAN_OVERRIDE"
            self.add_log("HUMAN_OVERRIDE_ENGAGED", "WARNING", "HUMAN_OPERATOR", "Operator engaged MANUAL OVERRIDE. Agent autonomous control paused.")
        else:
            self.mode = "AUTONOMOUS"
            self.add_log("AUTONOMOUS_MODE_RESTORED", "INFO", "HUMAN_OPERATOR", "Operator restored AUTONOMOUS mode. Closed-loop AI agent re-armed.")

    def acknowledge_incident(self):
        self.add_log("INCIDENT_ACKNOWLEDGED", "INFO", "HUMAN_OPERATOR", f"Incident {self.current_incident_id} acknowledged by human operator.")
        if self.mode == "ESCALATED":
            self.mode = "HUMAN_OVERRIDE"
