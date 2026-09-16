# AquaAgent: System Architecture & Agentic Workflow

## 1. Executive Summary

AquaAgent is an autonomous, goal-driven AI agent designed to mitigate municipal, industrial, and campus water infrastructure leakage. Unlike legacy monitoring setups (which only detect anomalies and passively page humans), AquaAgent implements an autonomous closed-loop control system:

$$\text{OBSERVE} \longrightarrow \text{ANALYZE} \longrightarrow \text{DECIDE} \longrightarrow \text{ACT} \longrightarrow \text{EVALUATE} \longrightarrow \text{ADAPT}$$

When pipeline actuators experience mechanical jams or network dropouts, AquaAgent does not crash or stall—it actively verifies post-action telemetry, diagnoses the failure, replans an alternative isolation path, executes auxiliary actuators, and verifies stabilization.

---

## 2. High-Level Architecture

```
                      +------------------------------------------+
                      |         Water Pipeline Network           |
                      |   (Main Line, Zone-A, Zone-B Sections)   |
                      +------------------------------------------+
                                    |               |
               Inflow / Outflow Flow Rate       Pipeline Pressure
                     (YF-S201 Sensors)          (0-1.2 MPa Transducer)
                                    |               |
                                    v               v
                      +------------------------------------------+
                      |         ESP32 / IoT Gateway Node         |
                      |  - 2-Second Periodic Interrupt Sampling  |
                      |  - Calibrated Signal Normalization       |
                      |  - JSON Serialization via HTTP POST      |
                      +------------------------------------------+
                                           |
                                           v
+=====================================================================================+
|                             AquaAgent FastAPI Backend                               |
|                                                                                     |
|   [Telemetry Ingestion / Simulation Engine]                                         |
|       |                                                                             |
|       v                                                                             |
|   [AquaAgent Autonomous Controller] <========================> [Agent State Memory] |
|       |                                                        - Goal & Active Phase|
|       | 1. OBSERVE (Telemetry Tool)                            - Decision & Rationale
|       | 2. ANALYZE (Leakage Analysis Engine)                   - Attempted/Failed Valves
|       | 3. DECIDE  (Deterministic Policy / LLM Explainer)      - Event Log History  |
|       | 4. ACT     (Actuator Valve Tool)                                            |
|       | 5. EVALUATE(Post-Action Verification Tool)                                  |
|       | 6. ADAPT   (Dynamic Re-Planner on Failure)                                  |
|       |                                                                             |
|       +----------> [Controlled Tools Ecosystem]                                     |
|                        |-- get_sensor_data()                                        |
|                        |-- analyze_leakage(sensor_data)                             |
|                        |-- control_valve(valve_id, action)                          |
|                        |-- verify_recovery()                                        |
|                        |-- send_alert(message, severity)                            |
|                        +-- get_zone_status(zone)                                    |
|                                                                                     |
+=====================================================================================+
                                           |
                                           v  (REST / WebSocket Polling)
                      +------------------------------------------+
                      |     Interactive Web Dashboard (React)    |
                      |  - Real-Time Sensor Telemetry Cards      |
                      |  - Live Agent Phase & Decision Tracker   |
                      |  - Time-Series Telemetry Flow Chart      |
                      |  - Event Activity Log & Step Visualizer  |
                      |  - Scenario Trigger & Failure Demo Panel |
                      +------------------------------------------+
```

---

## 3. The Core Agentic Loop

```mermaid
flowchart TD
    Start([Pipeline Telemetry Arrives]) --> Observe[1. OBSERVE: get_sensor_data]
    Observe --> Analyze[2. ANALYZE: analyze_leakage]
    
    Analyze --> CheckLeak{Loss > 10% or Pressure < 2.5 bar?}
    CheckLeak -- No --> Safe[RESOLVED: Pipeline Nominal]
    CheckLeak -- Yes --> Decide[3. DECIDE: Select Target Valve 1]
    
    Decide --> Act1[4. ACT: Close Valve 1]
    Act1 --> CheckV1{Valve 1 Responded?}
    
    CheckV1 -- Success --> Verify1[5. EVALUATE: verify_recovery]
    Verify1 --> Recovered1{Flow Normalized?}
    Recovered1 -- Yes --> Resolved1([RESOLVED: Leak Isolated])
    Recovered1 -- No --> Adapt
    
    CheckV1 -- FAILED --> Adapt[6. ADAPT: Detect Jam & Replan]
    Adapt --> DecideV2[DECIDE: Switch to Auxiliary Valve 2]
    DecideV2 --> Act2[ACT: Close Valve 2]
    
    Act2 --> CheckV2{Valve 2 Responded?}
    CheckV2 -- Success --> Verify2[5. EVALUATE: verify_recovery]
    Verify2 --> Recovered2{Flow Normalized?}
    Recovered2 -- Yes --> Resolved2([ADAPTED & RESOLVED])
    Recovered2 -- No --> Escalate
    
    CheckV2 -- FAILED --> Escalate[7. ESCALATE: Multi-Actuator Lockout]
    Escalate --> Alert[send_alert: Dispatch Emergency Human Crew]
    Alert --> End([STATUS: ESCALATED_TO_HUMAN])
```

---

## 4. Failure Handling & Closed-Loop Verification

AquaAgent implements robust industrial fail-safes:
1. **Hardware / Actuator Verification**: Unlike simple systems that assume a relay switched, AquaAgent verifies downstream pressure drop and flow balance.
2. **Dynamic Alternative Routing**: Primary sector isolation ($\text{Valve 1}$) falls back automatically to the auxiliary sector bypass ($\text{Valve 2}$).
3. **Emergency Escalation Gate**: If multiple mechanical failures prevent automatic containment, the agent escalates to on-call maintenance teams with full diagnostic context.
