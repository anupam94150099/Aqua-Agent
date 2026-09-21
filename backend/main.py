import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from models.schemas import SystemOverview, SensorReading, ValveStatus, ZoneStatus, Incident, SystemLog
from services.state import state

# Periodic background loop for continuous physics & agent thinking
async def background_loop():
    while True:
        try:
            # 1. Advance simulation physics (fluids, pressure, leak accumulation)
            state.sim.tick()
            state.tick_count += 1
            
            # 2. Advance agent autonomous state machine every 2 ticks (approx 2s) if enabled
            if state.auto_loop and state.agent.mode == "AUTONOMOUS":
                if state.tick_count % 2 == 0:
                    state.agent.autonomous_step()
                    
        except Exception as e:
            print(f"Error in background loop: {e}")
            
        await asyncio.sleep(1.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background task
    task = asyncio.create_task(background_loop())
    yield
    task.cancel()

app = FastAPI(
    title="AquaAgent API",
    description="Autonomous AI Agent for Smart Water Leakage Detection & Response Backend",
    version="2.4.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- SYSTEM OVERVIEW & TELEMETRY ----------------- #

@app.get("/api/system/status")
def get_system_status():
    flow = state.sim.flow_rate
    pressure = state.sim.pressure
    
    # Calculate operational status string
    if state.agent.mode == "ESCALATED":
        sys_status = "CRITICAL ALERT - ESCALATED"
    elif state.agent.mode == "HUMAN_OVERRIDE":
        sys_status = "MANUAL OVERRIDE ACTIVE"
    elif state.sim.leak_active:
        sys_status = f"ANOMALY CONTAINMENT IN PROGRESS ({state.agent.stage})"
    elif state.agent.stage == "RESOLVED":
        sys_status = "SYSTEM OPERATIONAL - RECENTLY CONTAINED"
    else:
        sys_status = "SYSTEM OPERATIONAL"

    active_incidents = 1 if (state.sim.leak_active or state.agent.stage not in ["IDLE", "RESOLVED"]) else 0
    
    return {
        "app_name": "AquaAgent",
        "subtitle": "Autonomous AI for Smarter Water Networks",
        "system_status": sys_status,
        "current_flow_rate": flow,
        "current_pressure": pressure,
        "active_zones_count": "4 / 4",
        "water_saved_liters": round(state.sim.water_saved_liters, 1),
        "water_lost_liters": round(state.sim.water_lost_liters, 1),
        "active_incidents_count": active_incidents,
        "agent_status": state.agent.mode,
        "current_objective": state.agent.current_objective,
        "current_stage": state.agent.stage,
        "scenario": state.scenario_name,
        "auto_loop_enabled": state.auto_loop,
        "latest_thought": state.agent.latest_thought
    }

@app.get("/api/sensors")
def get_sensors():
    return {
        "current": {
            "timestamp": state.sim.history[-1]["timestamp"] if state.sim.history else "00:00:00",
            "flow_rate": state.sim.flow_rate,
            "pressure": state.sim.pressure,
            "expected_flow_min": 40.0,
            "expected_flow_max": 45.0,
            "expected_pressure_min": 3.5,
            "expected_pressure_max": 4.0,
            "zone_b_flow": state.sim.zones["Zone B"]["flow"],
            "zone_b_pressure": state.sim.zones["Zone B"]["pressure"]
        },
        "history": state.sim.history
    }

@app.get("/api/network")
def get_network():
    return {
        "zones": state.sim.zones,
        "valves": state.sim.valves,
        "leak_zone": state.sim.leak_zone if state.sim.leak_active else None,
        "leak_active": state.sim.leak_active,
        "leak_severity": state.sim.leak_severity
    }

@app.get("/api/agent/state")
def get_agent_state():
    return {
        "mode": state.agent.mode,
        "stage": state.agent.stage,
        "current_objective": state.agent.current_objective,
        "latest_thought": state.agent.latest_thought,
        "current_incident_id": state.agent.current_incident_id,
        "timeline": state.agent.timeline,
        "active_decision_explanation": state.agent.active_decision_explanation,
        "retries": state.agent.retries,
        "target_valve_attempted": state.agent.target_valve_attempted,
        "auto_loop": state.auto_loop
    }

@app.get("/api/incidents")
def get_incidents():
    return state.agent.incidents

@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    inc = next((i for i in state.agent.incidents if i["id"] == incident_id), None)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@app.get("/api/logs")
def get_logs():
    return state.agent.logs

# ----------------- DEMO SCENARIOS ----------------- #

@app.post("/api/simulation/normal")
def set_normal_scenario():
    state.set_scenario("NORMAL")
    state.agent.add_log("SCENARIO_NORMAL", "INFO", "AGENT_ENGINE", "Scenario [NORMAL] activated: baseline 42 L/min, 3.8 bar.")
    return {"status": "ok", "scenario": "NORMAL"}

@app.post("/api/simulation/leak")
def trigger_leak_scenario():
    state.set_scenario("LEAK")
    state.agent.add_log("SCENARIO_LEAK_TRIGGERED", "WARNING", "HUMAN_OPERATOR", "Scenario [SIMULATE LEAK] activated: High-flow pipe rupture injected into Zone B.")
    # Prompt an immediate agent step so the UI reacts instantly
    state.agent.autonomous_step()
    return {"status": "ok", "scenario": "LEAK"}

@app.post("/api/simulation/valve1-failure")
def trigger_valve1_failure_scenario():
    state.set_scenario("VALVE1_FAILURE")
    state.agent.add_log("SCENARIO_V1_FAILURE", "ERROR", "HUMAN_OPERATOR", "Scenario [VALVE 1 FAILURE] activated: Primary Actuator fault injected.")
    state.agent.autonomous_step()
    return {"status": "ok", "scenario": "VALVE1_FAILURE"}

@app.post("/api/simulation/adapt-recover")
def trigger_adapt_recover_scenario():
    state.set_scenario("ADAPT_RECOVER")
    state.agent.add_log("SCENARIO_ADAPT_RECOVER", "SUCCESS", "AGENT_ENGINE", "Scenario [ADAPT & RECOVER] completed: Replan to Valve 2 succeeded. Verification passed.")
    return {"status": "ok", "scenario": "ADAPT_RECOVER"}

@app.post("/api/simulation/both-valves-failed")
def trigger_both_failed_scenario():
    state.set_scenario("BOTH_FAILED")
    state.agent.add_log("SCENARIO_BOTH_FAILED", "CRITICAL", "AGENT_ENGINE", "Scenario [BOTH VALVES FAILED]: Primary & Secondary isolation failed. Escalated to human operator.")
    return {"status": "ok", "scenario": "BOTH_FAILED"}

@app.post("/api/simulation/reset")
def reset_simulation():
    state.reset_all()
    state.agent.add_log("SYSTEM_RESET", "INFO", "HUMAN_OPERATOR", "System state reset to baseline operational parameters.")
    return {"status": "ok", "scenario": "NORMAL"}

@app.post("/api/simulation/step")
def step_simulation():
    state.agent.autonomous_step()
    return {
        "status": "ok",
        "stage": state.agent.stage,
        "thought": state.agent.latest_thought
    }

# ----------------- MANUAL ACTUATION & CONTROL ----------------- #

class ValveActionRequest(BaseModel):
    zone: Optional[str] = None

@app.post("/api/valves/{valve_id}/open")
def open_valve(valve_id: str):
    res = state.sim.command_valve(valve_id, "OPEN")
    valve_name = state.sim.valves.get(valve_id, {}).get("name", valve_id)
    state.agent.add_log("MANUAL_VALVE_OPEN", "INFO", "HUMAN_OPERATOR", f"Manual command dispatched: OPEN {valve_name} ({valve_id}).")
    return {"valve_id": valve_id, "status": "OPEN", "success": res}

@app.post("/api/valves/{valve_id}/close")
def close_valve(valve_id: str):
    res = state.sim.command_valve(valve_id, "CLOSE")
    valve_name = state.sim.valves.get(valve_id, {}).get("name", valve_id)
    state.agent.add_log("MANUAL_VALVE_CLOSE", "INFO", "HUMAN_OPERATOR", f"Manual command dispatched: CLOSE {valve_name} ({valve_id}).")
    return {"valve_id": valve_id, "status": state.sim.valves[valve_id]["status"], "success": res}

@app.post("/api/agent/replan")
def trigger_agent_replan():
    state.agent.trigger_replan_manual()
    return {"status": "ok", "stage": state.agent.stage}

@app.post("/api/agent/verify")
def trigger_agent_verify():
    state.agent.trigger_verify_manual()
    return {"status": "ok", "stage": state.agent.stage}

class OverrideRequest(BaseModel):
    enabled: bool

@app.post("/api/agent/override")
def set_agent_override(req: OverrideRequest):
    state.agent.set_human_override(req.enabled)
    return {"mode": state.agent.mode}

@app.post("/api/agent/acknowledge")
def acknowledge_incident():
    state.agent.acknowledge_incident()
    return {"status": "acknowledged", "mode": state.agent.mode}

class ToggleLoopRequest(BaseModel):
    enabled: bool

@app.post("/api/agent/toggle-auto-loop")
def toggle_auto_loop(req: ToggleLoopRequest):
    state.auto_loop = req.enabled
    return {"auto_loop": state.auto_loop}
