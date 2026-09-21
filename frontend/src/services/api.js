// Dual-Mode API Client with Embedded Autonomous Simulation Engine for Vercel & Localhost

class ClientSimulationEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.flow_rate = 42.4;
    this.pressure = 3.82;
    this.target_flow = 42.4;
    this.target_pressure = 3.82;
    this.leak_active = false;
    this.leak_severity = "NONE";
    this.leak_zone = "Zone B";
    this.valves = {
      valve_1: { id: "valve_1", name: "Zone B Primary Inlet Actuator", zone: "Zone B", status: "OPEN", last_command: "INITIALIZE", last_response_time_ms: 120, health: 100 },
      valve_2: { id: "valve_2", name: "Zone B Secondary Isolation Valve", zone: "Zone B", status: "OPEN", last_command: "INITIALIZE", last_response_time_ms: 140, health: 100 },
      valve_main: { id: "valve_main", name: "Central Feeder Valve", zone: "Main Pipeline", status: "OPEN", last_command: "INITIALIZE", last_response_time_ms: 95, health: 100 }
    };
    this.zones = {
      "Zone A": { id: "Zone A", name: "Zone A - Commercial Hub", status: "NORMAL", flow: 12.1, pressure: 3.85, valves: ["valve_main"] },
      "Zone B": { id: "Zone B", name: "Zone B - High-Density Residential", status: "NORMAL", flow: 18.2, pressure: 3.82, valves: ["valve_1", "valve_2"] },
      "Zone C": { id: "Zone C", name: "Zone C - Industrial Sector", status: "NORMAL", flow: 7.5, pressure: 3.80, valves: [] },
      "Zone D": { id: "Zone D", name: "Zone D - Suburban Extension", status: "NORMAL", flow: 4.6, pressure: 3.79, valves: [] }
    };
    this.inject_v1_fault = false;
    this.inject_v2_fault = false;
    this.water_lost_liters = 0.0;
    this.water_saved_liters = 1248.0;
    this.mode = "AUTONOMOUS";
    this.stage = "IDLE";
    this.current_objective = "Continuous baseline monitoring, leak prevention, and pressure stability.";
    this.latest_thought = "System nominal. Monitoring flow (40-45 L/min) and pressure (3.5-4.0 bar) across all 4 zones.";
    this.current_incident_id = null;
    this.incidents = [];
    this.logs = [];
    this.timeline = [];
    this.active_decision_explanation = null;
    this.retries = 0;
    this.target_valve_attempted = "valve_1";
    this.scenario = "NORMAL";
    this.history = [];
    
    const now = Date.now();
    for (let i = 25; i > 0; i--) {
      const d = new Date(now - i * 2000);
      const t = d.toTimeString().split(' ')[0];
      this.history.push({
        timestamp: t,
        flow_rate: Number((42.0 + (Math.random() * 1.2 - 0.6)).toFixed(1)),
        pressure: Number((3.8 + (Math.random() * 0.08 - 0.04)).toFixed(2)),
        expected_flow_min: 40.0,
        expected_flow_max: 45.0,
        expected_pressure_min: 3.5,
        expected_pressure_max: 4.0,
        zone_b_flow: Number((18.0 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
        zone_b_pressure: Number((3.8 + (Math.random() * 0.06 - 0.03)).toFixed(2))
      });
    }

    this.addLog("SYSTEM_BOOT", "INFO", "AGENT_ENGINE", "AquaAgent Autonomous Decision Kernel v2.4 initialized in AUTONOMOUS mode.");
    this.addLog("BASELINE_VERIFIED", "INFO", "SENSOR_MONITOR", "Hydraulic baseline verified: Flow 42.4 L/min, Pressure 3.82 bar. All 4 zones healthy.");
  }

  addLog(event, severity, source, details) {
    const t = new Date().toTimeString().split(' ')[0];
    const log = {
      id: "LOG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      timestamp: t,
      event,
      severity,
      source,
      details
    };
    this.logs.unshift(log);
    if (this.logs.length > 100) this.logs.pop();
    return log;
  }

  addTimelineStep(stage, message) {
    const t = new Date().toTimeString().split(' ')[0];
    this.timeline.push({ timestamp: t, stage, message, details: {} });
    this.latest_thought = message;
  }

  commandValve(valveId, action) {
    if (!this.valves[valveId]) return false;
    const v = this.valves[valveId];
    v.last_command = action;
    if (valveId === "valve_1" && this.inject_v1_fault && action === "CLOSE") {
      v.status = "FAILED";
      v.last_response_time_ms = 3500;
      v.health = 15;
      return false;
    }
    if (valveId === "valve_2" && this.inject_v2_fault && action === "CLOSE") {
      v.status = "FAILED";
      v.last_response_time_ms = 3800;
      v.health = 10;
      return false;
    }
    v.status = action;
    v.last_response_time_ms = Math.floor(Math.random() * 240 + 160);
    v.health = 100;
    if (action === "CLOSE" && (valveId === "valve_1" || valveId === "valve_2")) {
      this.zones["Zone B"].status = "ISOLATED";
      this.leak_active = false;
      this.target_flow = 42.1;
      this.target_pressure = 3.82;
      this.water_saved_liters += 450;
    } else if (action === "OPEN" && (valveId === "valve_1" || valveId === "valve_2")) {
      this.zones["Zone B"].status = this.leak_active ? "LEAK DETECTED" : "NORMAL";
      this.target_flow = this.leak_active ? 82.5 : 42.4;
      this.target_pressure = this.leak_active ? 1.85 : 3.82;
    }
    return true;
  }

  stepAgent() {
    if (this.mode === "HUMAN_OVERRIDE") return;
    const flow = this.flow_rate;
    const pres = this.pressure;

    if (this.stage === "IDLE" || this.stage === "RESOLVED") {
      if (flow > 55.0 || pres < 2.9 || this.leak_active) {
        this.stage = "OBSERVE";
        this.current_objective = "Contain detected hydraulic burst in Zone B and prevent cascading pressure collapse.";
        this.current_incident_id = "INC-001";
        this.timeline = [];
        this.retries = 0;
        this.target_valve_attempted = "valve_1";
        this.addLog("FLOW_ANOMALY_DETECTED", "WARNING", "SENSOR_MONITOR", `Flow surge detected: ${flow} L/min (above baseline).`);
        this.addLog("PRESSURE_DROP_DETECTED", "WARNING", "SENSOR_MONITOR", `Pressure drop: ${pres} bar (below 3.5 bar baseline).`);
        this.addTimelineStep("OBSERVE", `Sensor anomaly detected. Flow=${flow} L/min, Pressure=${pres} bar.`);
        return;
      }
    }
    if (this.stage === "OBSERVE") {
      this.stage = "ANALYZE";
      this.addLog("CROSS_SENSOR_CORRELATION", "ERROR", "AGENT_ENGINE", "Cross-sensor correlation indicates probable pipeline leakage (+82% Flow, -41% Pressure).");
      this.addLog("SEVERITY_CLASSIFIED_HIGH", "ERROR", "AGENT_ENGINE", "Severity classified as HIGH. Affected zone: Zone B.");
      this.addTimelineStep("ANALYZE", "Cross-sensor correlation confirms pipeline leakage in Zone B (+82% Flow, -41% Pressure). Severity: HIGH.");
      return;
    }
    if (this.stage === "ANALYZE") {
      this.stage = "PLAN";
      const target = this.retries === 0 ? "valve_1" : "valve_2";
      this.target_valve_attempted = target;
      const vName = this.valves[target].name;
      this.addLog("ISOLATION_PLAN_SELECTED", "INFO", "AGENT_ENGINE", `Selecting safe isolation action: Command ${vName} (${target}) to CLOSE.`);
      this.addTimelineStep("PLAN", `Selecting safe isolation action: Preparing command for ${vName} (${target}).`);
      return;
    }
    if (this.stage === "ACT") {
      const target = this.target_valve_attempted;
      const vName = this.valves[target].name;
      this.addLog(`${target.toUpperCase()}_COMMAND_SENT`, "INFO", "AGENT_ENGINE", `Command sent to ${vName} (${target}).`);
      this.addTimelineStep("ACT", `Command sent to ${vName} (${target}). Awaiting actuator response.`);
      const success = this.commandValve(target, "CLOSE");
      if (success) {
        this.stage = "VERIFY";
        this.addLog(`${target.toUpperCase()}_CONFIRMED_CLOSED`, "SUCCESS", `ACTUATOR_${target.toUpperCase()}`, `${vName} confirmed closed in ${this.valves[target].last_response_time_ms}ms.`);
        this.addTimelineStep("ACT", `${vName} activated successfully. Initiating verification.`);
      } else {
        this.stage = "ADAPT";
        this.addLog(`${target.toUpperCase()}_RESPONSE_NOT_DETECTED`, "CRITICAL", `ACTUATOR_${target.toUpperCase()}`, `${vName} response not detected (Actuator fault/timeout).`);
        this.addTimelineStep("ADAPT", `${vName} response not detected. Replanning response.`);
      }
      return;
    }
    if (this.stage === "ADAPT") {
      if (this.retries === 0) {
        this.retries++;
        this.stage = "PLAN";
        this.target_valve_attempted = "valve_2";
        this.addLog("AGENT_REPLAN_TRIGGERED", "WARNING", "AGENT_ENGINE", "Primary isolation path unavailable. Replanning response: Selecting Valve 2 as alternate isolation point.");
        this.addTimelineStep("ADAPT", "Primary isolation path unavailable. Valve 2 selected as alternate isolation point.");
      } else {
        this.stage = "ESCALATE";
        this.mode = "ESCALATED";
        this.addLog("AUTONOMOUS_LIMIT_EXCEEDED", "CRITICAL", "AGENT_ENGINE", "Both automated isolation paths (Valve 1 & Valve 2) failed. Human intervention required.");
        this.addTimelineStep("ESCALATE", "Autonomous response exhausted. Both valves unavailable. Emergency escalation to human operator!");
        this.active_decision_explanation = {
          title: "Dual-Actuator Critical Fault - Human Escalation",
          timestamp: new Date().toTimeString().split(' ')[0],
          observations: { flow_rate: `${flow} L/min (Expected: 40-45)`, pressure: `${pres} bar (Expected: 3.5-4.0)`, valve_1: this.valves.valve_1.status, valve_2: this.valves.valve_2.status },
          reasoning: "High flow + severe pressure drop indicates ongoing burst. Both Valve 1 and Valve 2 failed actuation. System cannot safely self-heal without physical technician intervention.",
          selected_action: "EMERGENCY_HUMAN_ESCALATION",
          expected_outcome: "Field technician dispatch alert; audible control-room alarm.",
          verification_status: "UNRESOLVED_AUTONOMOUS_LIMIT",
          decision_result: "HUMAN_INTERVENTION_REQUIRED"
        };
        this.recordIncident("ESCALATED_TO_HUMAN", "Escalated to human operator (Dual Actuator Fault)");
      }
      return;
    }
    if (this.stage === "VERIFY") {
      if (flow <= 46.0 && pres >= 3.5) {
        this.stage = "RESOLVED";
        this.zones["Zone B"].status = "RESOLVED";
        this.addLog("FLOW_RETURNED_TO_NORMAL", "SUCCESS", "SENSOR_MONITOR", `Flow returned to normal range (${flow} L/min).`);
        this.addLog("PRESSURE_STABILIZED", "SUCCESS", "SENSOR_MONITOR", `Pressure stabilized (${pres} bar).`);
        this.addLog("INCIDENT_RESOLVED", "SUCCESS", "AGENT_ENGINE", "Incident successfully resolved autonomously. Network integrity confirmed.");
        this.addTimelineStep("RESOLVED", `Flow returned to normal range (${flow} L/min). Pressure stabilized (${pres} bar). Incident resolved.`);
        const valveLabel = this.retries > 0 ? "Valve 2 (Alternate after Actuator Fault)" : "Valve 1 (Primary)";
        this.active_decision_explanation = {
          title: `Autonomous Closed-Loop Containment (${valveLabel})`,
          timestamp: new Date().toTimeString().split(' ')[0],
          observations: { flow_rate: `${flow} L/min (Expected: 40-45)`, pressure: `${pres} bar (Expected: 3.5-4.0)`, valve_1: this.valves.valve_1.status, valve_2: this.valves.valve_2.status },
          reasoning: `High flow + low pressure indicated a probable leakage event. ${this.retries > 0 ? "Primary isolation attempt failed on Valve 1. Valve 2 was dynamically selected as permitted alternate." : "Valve 1 was commanded to isolate Zone B."}`,
          selected_action: `${this.target_valve_attempted.toUpperCase()} -> CLOSE`,
          expected_outcome: "Zone B isolated, pressure restored to 3.8 bar across network.",
          verification_status: "Flow normalized. Pressure stabilized.",
          decision_result: "Incident resolved."
        };
        this.recordIncident("RESOLVED", `Auto-resolved via ${valveLabel}`);
      }
    }
  }

  recordIncident(status, resolution) {
    const actions = [];
    if (["CLOSED", "FAILED"].includes(this.valves.valve_1.status)) actions.push(`Valve 1 (${this.valves.valve_1.status})`);
    if (["CLOSED", "FAILED"].includes(this.valves.valve_2.status)) actions.push(`Valve 2 (${this.valves.valve_2.status})`);
    if (!actions.length) actions.push("Telemetry Audit");

    const inc = {
      id: this.current_incident_id || "INC-001",
      timestamp: new Date().toTimeString().split(' ')[0],
      zone: "Zone B",
      type: "Pipeline Leakage",
      severity: status === "ESCALATED_TO_HUMAN" ? "CRITICAL" : "HIGH",
      status,
      actions_taken: actions,
      resolution,
      water_lost_liters: this.water_lost_liters,
      water_saved_liters: this.water_saved_liters,
      timeline: [...this.timeline],
      explanation: this.active_decision_explanation
    };
    const idx = this.incidents.findIndex(i => i.id === inc.id);
    if (idx >= 0) this.incidents[idx] = inc;
    else this.incidents.unshift(inc);
  }

  tick() {
    const alpha = 0.35;
    this.flow_rate = Number((this.flow_rate + alpha * (this.target_flow - this.flow_rate) + (Math.random() * 0.7 - 0.35)).toFixed(1));
    this.pressure = Number((this.pressure + alpha * (this.target_pressure - this.pressure) + (Math.random() * 0.04 - 0.02)).toFixed(2));
    if (this.leak_active) {
      const excess = Math.max(0, this.flow_rate - 42.0);
      this.water_lost_liters = Number((this.water_lost_liters + (excess / 60.0) * 1.0).toFixed(1));
    }
    const zb_flow = !(this.valves.valve_1.status === "CLOSED" || this.valves.valve_2.status === "CLOSED") ? Number((this.flow_rate * 0.43).toFixed(1)) : 1.2;
    this.zones["Zone B"].flow = zb_flow;
    this.zones["Zone B"].pressure = this.pressure;
    const t = new Date().toTimeString().split(' ')[0];
    this.history.push({
      timestamp: t,
      flow_rate: this.flow_rate,
      pressure: this.pressure,
      expected_flow_min: 40.0,
      expected_flow_max: 45.0,
      expected_pressure_min: 3.5,
      expected_pressure_max: 4.0,
      zone_b_flow: zb_flow,
      zone_b_pressure: this.pressure
    });
    if (this.history.length > 30) this.history.shift();
  }
}

const clientSim = new ClientSimulationEngine();
setInterval(() => {
  clientSim.tick();
  if (clientSim.mode === "AUTONOMOUS") clientSim.stepAgent();
}, 1200);

let useLocalBackend = true;

async function fetchJson(endpoint, options = {}) {
  if (useLocalBackend) {
    try {
      const res = await fetch(`/api${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });
      if (res.ok) return await res.json();
    } catch (e) {
      useLocalBackend = false;
    }
  }

  // Fallback to client simulation engine
  return handleClientMock(endpoint, options);
}

function handleClientMock(endpoint, options) {
  if (endpoint === '/system/status') {
    let sys_status = "SYSTEM OPERATIONAL";
    if (clientSim.mode === "ESCALATED") sys_status = "CRITICAL ALERT - ESCALATED";
    else if (clientSim.mode === "HUMAN_OVERRIDE") sys_status = "MANUAL OVERRIDE ACTIVE";
    else if (clientSim.leak_active) sys_status = `ANOMALY CONTAINMENT IN PROGRESS (${clientSim.stage})`;
    else if (clientSim.stage === "RESOLVED") sys_status = "SYSTEM OPERATIONAL - RECENTLY CONTAINED";

    return {
      app_name: "AquaAgent",
      subtitle: "Autonomous AI for Smarter Water Networks",
      system_status: sys_status,
      current_flow_rate: clientSim.flow_rate,
      current_pressure: clientSim.pressure,
      active_zones_count: "4 / 4",
      water_saved_liters: clientSim.water_saved_liters,
      water_lost_liters: clientSim.water_lost_liters,
      active_incidents_count: (clientSim.leak_active || !["IDLE", "RESOLVED"].includes(clientSim.stage)) ? 1 : 0,
      agent_status: clientSim.mode,
      current_objective: clientSim.current_objective,
      current_stage: clientSim.stage,
      scenario: clientSim.scenario,
      auto_loop_enabled: true,
      latest_thought: clientSim.latest_thought
    };
  }
  if (endpoint === '/sensors') {
    return {
      current: {
        timestamp: clientSim.history[clientSim.history.length - 1]?.timestamp || "00:00:00",
        flow_rate: clientSim.flow_rate,
        pressure: clientSim.pressure,
        expected_flow_min: 40.0,
        expected_flow_max: 45.0,
        expected_pressure_min: 3.5,
        expected_pressure_max: 4.0,
        zone_b_flow: clientSim.zones["Zone B"].flow,
        zone_b_pressure: clientSim.zones["Zone B"].pressure
      },
      history: clientSim.history
    };
  }
  if (endpoint === '/network') {
    return {
      zones: clientSim.zones,
      valves: clientSim.valves,
      leak_zone: clientSim.leak_active ? clientSim.leak_zone : null,
      leak_active: clientSim.leak_active,
      leak_severity: clientSim.leak_severity
    };
  }
  if (endpoint === '/agent/state') {
    return {
      mode: clientSim.mode,
      stage: clientSim.stage,
      current_objective: clientSim.current_objective,
      latest_thought: clientSim.latest_thought,
      current_incident_id: clientSim.current_incident_id,
      timeline: clientSim.timeline,
      active_decision_explanation: clientSim.active_decision_explanation,
      retries: clientSim.retries,
      target_valve_attempted: clientSim.target_valve_attempted,
      auto_loop: true
    };
  }
  if (endpoint === '/incidents') return clientSim.incidents;
  if (endpoint === '/logs') return clientSim.logs;

  // Scenarios
  if (endpoint === '/simulation/normal') {
    clientSim.reset();
    clientSim.scenario = "NORMAL";
    return { status: "ok", scenario: "NORMAL" };
  }
  if (endpoint === '/simulation/leak') {
    clientSim.scenario = "LEAK";
    clientSim.inject_v1_fault = false;
    clientSim.inject_v2_fault = false;
    clientSim.leak_active = true;
    clientSim.target_flow = 82.5;
    clientSim.target_pressure = 1.85;
    clientSim.zones["Zone B"].status = "LEAK DETECTED";
    clientSim.stepAgent();
    return { status: "ok", scenario: "LEAK" };
  }
  if (endpoint === '/simulation/valve1-failure') {
    clientSim.scenario = "VALVE1_FAILURE";
    clientSim.inject_v1_fault = true;
    clientSim.inject_v2_fault = false;
    clientSim.leak_active = true;
    clientSim.target_flow = 82.5;
    clientSim.target_pressure = 1.85;
    clientSim.stepAgent();
    return { status: "ok", scenario: "VALVE1_FAILURE" };
  }
  if (endpoint === '/simulation/adapt-recover') {
    clientSim.scenario = "ADAPT_RECOVER";
    clientSim.inject_v1_fault = true;
    clientSim.inject_v2_fault = false;
    clientSim.leak_active = true;
    clientSim.stepAgent();
    clientSim.stepAgent();
    clientSim.stepAgent();
    clientSim.stepAgent();
    clientSim.stepAgent();
    return { status: "ok", scenario: "ADAPT_RECOVER" };
  }
  if (endpoint === '/simulation/both-valves-failed') {
    clientSim.scenario = "BOTH_FAILED";
    clientSim.inject_v1_fault = true;
    clientSim.inject_v2_fault = true;
    clientSim.leak_active = true;
    for (let i = 0; i < 7; i++) clientSim.stepAgent();
    return { status: "ok", scenario: "BOTH_FAILED" };
  }
  if (endpoint === '/simulation/reset') {
    clientSim.reset();
    return { status: "ok", scenario: "NORMAL" };
  }
  if (endpoint === '/simulation/step') {
    clientSim.stepAgent();
    return { status: "ok", stage: clientSim.stage };
  }
  if (endpoint.startsWith('/valves/')) {
    const parts = endpoint.split('/');
    const vId = parts[2];
    const act = parts[3].toUpperCase();
    const res = clientSim.commandValve(vId, act);
    return { valve_id: vId, status: clientSim.valves[vId]?.status, success: res };
  }
  if (endpoint === '/agent/replan') {
    clientSim.stage = "ADAPT";
    clientSim.stepAgent();
    return { status: "ok" };
  }
  if (endpoint === '/agent/verify') {
    clientSim.stage = "VERIFY";
    clientSim.stepAgent();
    return { status: "ok" };
  }
  if (endpoint === '/agent/override') {
    const body = options.body ? JSON.parse(options.body) : {};
    clientSim.mode = body.enabled ? "HUMAN_OVERRIDE" : "AUTONOMOUS";
    return { mode: clientSim.mode };
  }
  return { status: "ok" };
}

export const api = {
  getSystemStatus: () => fetchJson('/system/status'),
  getSensors: () => fetchJson('/sensors'),
  getNetwork: () => fetchJson('/network'),
  getAgentState: () => fetchJson('/agent/state'),
  getIncidents: () => fetchJson('/incidents'),
  getIncidentById: (id) => fetchJson(`/incidents/${id}`),
  getLogs: () => fetchJson('/logs'),
  triggerNormal: () => fetchJson('/simulation/normal', { method: 'POST' }),
  triggerLeak: () => fetchJson('/simulation/leak', { method: 'POST' }),
  triggerValve1Failure: () => fetchJson('/simulation/valve1-failure', { method: 'POST' }),
  triggerAdaptRecover: () => fetchJson('/simulation/adapt-recover', { method: 'POST' }),
  triggerBothValvesFailed: () => fetchJson('/simulation/both-valves-failed', { method: 'POST' }),
  resetSimulation: () => fetchJson('/simulation/reset', { method: 'POST' }),
  stepSimulation: () => fetchJson('/simulation/step', { method: 'POST' }),
  openValve: (valveId) => fetchJson(`/valves/${valveId}/open`, { method: 'POST' }),
  closeValve: (valveId) => fetchJson(`/valves/${valveId}/close`, { method: 'POST' }),
  triggerReplan: () => fetchJson('/agent/replan', { method: 'POST' }),
  triggerVerify: () => fetchJson('/agent/verify', { method: 'POST' }),
  toggleOverride: (enabled) => fetchJson('/agent/override', { method: 'POST', body: JSON.stringify({ enabled }) }),
  acknowledgeIncident: () => fetchJson('/agent/acknowledge', { method: 'POST' }),
  toggleAutoLoop: (enabled) => fetchJson('/agent/toggle-auto-loop', { method: 'POST', body: JSON.stringify({ enabled }) }),
};
