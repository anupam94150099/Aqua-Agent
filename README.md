# AquaAgent
### Autonomous AI Agent for Smart Water Leakage Detection and Response

> **Agentic AI Hackathon Entry** • Tech Zephyr 4.0 (IIT Bhubaneswar)

AquaAgent is a goal-driven, closed-loop cyber-physical autonomous agent system engineered to detect, quantify, isolate, and adaptively resolve pipeline water leaks in smart municipal, industrial, and campus water distribution networks.

---

## Problem Statement

Water distribution infrastructure worldwide suffers significant loss (often 20% to 45% non-revenue water) due to concealed subterranean ruptures, joint slippages, and abnormal pressure surges.

Traditional water monitoring systems follow a passive paradigm:
Sensor -> Detect Anomaly -> Issue Alert -> Wait for Human Response

This latency causes immense water loss, localized flooding, and pipeline cavitation. Furthermore, when automated actuators experience mechanical jams or solenoid failures, conventional rule systems stall or crash.

AquaAgent transforms this process into an **active autonomous agent loop**:
Observe -> Analyze -> Decide -> Act -> Evaluate -> Adapt / Replan

---

## Target Users

1. **Municipal Water Supply Authorities & Utility Districts**: Autonomous district metered area (DMA) sector management.
2. **Housing Societies & Residential High-Rises**: Real-time riser leak isolation preventing water damage.
3. **Large University & Corporate Campuses**: Automated distribution monitoring across multi-building networks.
4. **Industrial Plants & Facility Operators**: High-reliability process cooling and wastewater management.

---

## Why Agentic AI?

Traditional automated systems are rigid and brittle: if an actuator command fails to execute, hardcoded scripts fail silently or trigger repeated fruitless retries.

An **Agentic AI** approach provides:
- **Goal-Driven Autonomy**: Pursues the objective (*"minimize water loss and isolate leakage safely"*) rather than blindly executing fixed sequences.
- **Closed-Loop Verification**: Verifies physical state changes using fresh telemetry after every action.
- **Dynamic Replanning & Adaptation**: Upon detecting an actuator jam ($V_1 \rightarrow \text{FAILED}$), the agent dynamically evaluates pipeline topology, selects alternative auxiliary isolation points ($V_2$), and verifies stabilization.
- **Graceful Escalation**: If all automated tools fail, it dispatches emergency escalation with complete diagnostic context.

---

## Proposed Solution

AquaAgent combines an autonomous controller with a controlled tool ecosystem and real-time telemetry ingestion (compatible with ESP32 microcontrollers and simulated pipeline physics):
1. **Continuous Telemetry Sampling**: Measures inflow ($Q_{in}$), outflow ($Q_{out}$), and pressure ($P$).
2. **Differential Loss & Severity Engine**: Quantifies $\Delta Q$ and pressure drops to classify incident severity (NORMAL, MEDIUM, HIGH, CRITICAL).
3. **Multi-Step Execution Engine**: Dispatches physical actuator commands via controlled tool calls.
4. **Resilient Failure Recovery**: Seamlessly navigates mechanical failures with automated secondary isolation.

---

## Agent Workflow

```
[TELEMETRY INGESTION]
        │
        ▼
   1. OBSERVE   ───> Fetches live sensor telemetry via get_sensor_data()
        │
        ▼
   2. ANALYZE   ───> Computes loss rate, loss %, and severity via analyze_leakage()
        │
        ▼
   3. DECIDE    ───> Selects primary isolation actuator (Valve 1) based on topology
        │
        ▼
   4. ACT       ───> Dispatches control_valve(Valve 1, close)
        │
        ├─────────────────────────────┬─────────────────────────────┐
        │ [Actuator Responds]         │ [Actuator Fails / Jams]      │
        ▼                             ▼                             ▼
   5. EVALUATE / VERIFY          6. ADAPT & REPLAN              7. ESCALATE
   - Checks post-action readings - Detects failure state        (If both fail)
   - Confirms flow normalization - Selects auxiliary (Valve 2)  - Dispatches emergency
   - Status: RESOLVED            - Dispatches control_valve       alert to human crew
                                 - Re-evaluates post-action     - Status: ESCALATED
                                 - Status: ADAPTED_AND_RESOLVED
```
## Architecture

```
                      +------------------------------------------+
                      |         Water Pipeline Network           |
                      |   (Main Line, Zone-A, Zone-B Sections)   |
                      +------------------------------------------+
                                    │               │
                               Flow Sensors      Pressure Transducer
                                    │               │
                                    ▼               ▼
                      +------------------------------------------+
                      |         ESP32 / IoT Gateway Node         |
                      |  - Periodic Interrupt Sampling (2s)      |
                      |  - JSON Serialization via HTTP POST      |
                      +------------------------------------------+
                                           │
                                           ▼
+=====================================================================================+
|                             AquaAgent FastAPI Backend                               |
|                                                                                     |
|   [Telemetry Ingestion / Simulation Engine]                                         |
|       │                                                                             |
|       ▼                                                                             |
|   [AquaAgent Autonomous Controller] <========================> [Agent State Memory] |
|       │                                                        - Goal & Active Phase|
|       │ 1. OBSERVE (Telemetry Tool)                            - Decision & Reason  |
|       │ 2. ANALYZE (Leakage Analysis Engine)                   - Attempted/Failed   |
|       │ 3. DECIDE  (Deterministic Policy / Explainer)          - Event Log History  |
|       │ 4. ACT     (Actuator Valve Tool)                                            |
|       │ 5. EVALUATE(Post-Action Verification Tool)                                  |
|       │ 6. ADAPT   (Dynamic Re-Planner on Failure)                                  |
|       │                                                                             |
|       +----------> [Controlled Tools Ecosystem]                                     |
|                        ├── get_sensor_data()                                        |
|                        ├── analyze_leakage(sensor_data)                             |
|                        ├── control_valve(valve_id, action)                          |
|                        ├── verify_recovery()                                        |
|                        ├── send_alert(message, severity)                            |
|                        └── get_zone_status(zone)                                    |
|                                                                                     |
+=====================================================================================+
                                           │
                                           ▼
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

## Features

- **100% Zero-Dependency Offline Mode**: Core agentic loop is fully deterministic and does not rely on external API keys.
- **Physics-Accurate Pipeline Simulator**: Simulates fluid flow, pressure drop dynamics, and actuator mechanical states.
- **Dedicated Failure + Adaptation Scenario**: Live visual proof of agent resilience when primary actuators jam.
- **Closed-Loop Telemetry Verification**: Re-reads physical sensors before declaring an incident resolved.
- **Real-Time Interactive Dashboard**: Modern dark-mode React interface with live telemetry graphs, phase progression tracker, and event timeline.
- **Production-Ready ESP32 Firmware**: Ready-to-flash Arduino C++ sketch for physical IoT deployment.

---

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Uvicorn, Pytest
- **Frontend**: React 18, Vite 5, Tailwind CSS v4, Lucide Icons, Chart.js, React-Chartjs-2
- **IoT Firmware**: C++ / Arduino for ESP32 (HTTP Client, ArduinoJson, Hardware Interrupts)
- **Architecture & Modeling**: RESTful JSON API, In-Memory State Manager

---

## Project Structure

```
AquaAgent/
├── backend/
│   ├── main.py                     # FastAPI application & REST endpoints
│   ├── requirements.txt            # Python dependencies
│   ├── models/
│   │   └── schemas.py              # Pydantic schemas (Readings, Phases, Decisions)
│   ├── simulation/
│   │   └── pipeline.py             # Pipeline fluid dynamics & failure simulator
│   ├── tools/
│   │   ├── base.py                 # Abstract tool interface
│   │   └── pipeline_tools.py       # Controlled tools (Sensor, Valve, Alert, Verify)
│   ├── agent/
│   │   ├── state.py                # Agent state & memory manager
│   │   ├── controller.py           # Autonomous Observe-Decide-Act-Adapt cycle
│   │   └── llm_explainer.py        # Natural language summary provider
│   └── tests/
│       └── test_scenarios.py       # Pytest suite covering all 9 scenarios
├── frontend/
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite server & proxy configuration
│   ├── index.html                  # HTML entrypoint
│   └── src/
│       ├── main.jsx                # React root mount
│       ├── App.jsx                 # Dashboard UI, Telemetry, Controls & Timeline
│       └── index.css               # Tailwind & styles
├── iot/
│   └── esp32_sensor.ino            # ESP32 firmware for real hardware sensors
├── docs/
│   ├── architecture.md             # Detailed architecture documentation
│   └── ...
├── .env.example                    # Sample environment variables
├── .gitignore                      # Git ignore rules
├── LICENSE                         # MIT License
└── README.md                       # Documentation & Hackathon Mapping
```

---

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/AquaAgent.git
cd AquaAgent
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# On Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

---

## Environment Variables

Copy `.env.example` to `.env` (optional):
```bash
cp .env.example .env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `HOST` | `0.0.0.0` | Backend bind host |
| `PORT` | `8000` | Backend port |
| `OPENAI_API_KEY` | *(Optional)* | Optional key for natural language explanations (System works 100% offline without it) |

---

## Running Backend

```bash
# From the project root with venv activated:
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API will be live at: `http://localhost:8000`  
Swagger Documentation at: `http://localhost:8000/docs`

---

## Running Frontend

```bash
# In a new terminal:
cd frontend
npm run dev
```
Dashboard will open at: `http://localhost:5173`

---

## Demo Instructions

1. Open `http://localhost:5173` in your browser.
2. Ensure the top-right indicator displays **Backend Live (Green)**.
3. Test the built-in scenarios using the **Scenario Control Panel**:
   - **Scenario 1: Normal Operation**: Flow balance is nominal ($100 \rightarrow 97 \text{ L/min}$). Click *Run Agent Cycle* $\rightarrow$ Agent observes, confirms healthy state, and maintains flow.
   - **Scenario 2: Leak Detected**: Introduces a leak ($100 \rightarrow 58 \text{ L/min}$). Primary Valve 1 closes successfully $\rightarrow$ verified resolved.
   - **⭐ Scenario 3: Failure + Adaptation (Main Demo)**: Simulates a primary actuator failure.
   - **Scenario 4: Double Valve Failure**: Both valves fail $\rightarrow$ Autonomous emergency escalation alert dispatched to maintenance crew.
   - **Reset**: Cleans memory and resets pipeline baseline.

---

## Failure + Adaptation Scenario

This scenario demonstrates the core agentic intelligence of AquaAgent:

1. **Initial Leak Condition**: Flow In = $100\text{ L/min}$, Flow Out = $58\text{ L/min}$, Pressure = $1.6\text{ bar}$ (Loss: 42%).
2. **Observe**: Agent reads abnormal differential and pressure drop.
3. **Decide**: Agent decides to isolate sector via primary actuator (**Valve 1**).
4. **Act**: Issues `control_valve("Valve 1", "close")`.
5. **Actuator Failure Injected**: Valve 1 actuator mechanically jams and fails to close.
6. **Failure Detection & State Update**: Agent captures tool failure, updates state memory (`failed_valves = ["Valve 1"]`), and avoids crashing.
7. **Dynamic Replanning**: Agent selects secondary auxiliary isolation point (**Valve 2**).
8. **Fallback Action**: Issues `control_valve("Valve 2", "close")` $\rightarrow$ Success.
9. **Evaluate / Verify**: Agent queries fresh sensor readings: Flow Out stabilizes to $98\text{ L/min}$, Pressure recovers to $3.0\text{ bar}$.
10. **Final Outcome**: Status updated to **`ADAPTED_AND_RESOLVED`**.

---

## API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health check |
| `GET` | `/api/state` | Full system state, telemetry, decision, and logs |
| `GET` | `/api/logs` | Real-time agent event timeline |
| `POST` | `/api/scenario/normal` | Activates normal baseline scenario |
| `POST` | `/api/scenario/leak` | Activates standard leak scenario |
| `POST` | `/api/scenario/failure` | Activates failure + adaptation demo |
| `POST` | `/api/scenario/both-failed` | Activates double actuator failure scenario |
| `POST` | `/api/agent/run` | Triggers full autonomous agent execution cycle |
| `POST` | `/api/reset` | Resets simulator and agent state |
| `POST` | `/api/telemetry` | Ingests real ESP32 / IoT sensor telemetry |
| `POST` | `/api/tools/valve` | Manual actuator control endpoint |

---

## ESP32 Integration

The `/iot/esp32_sensor.ino` sketch demonstrates how physical microcontrollers connect to AquaAgent:
1. Connects to local WiFi.
2. Measures flow pulses via hardware interrupts on GPIO 18 and 19.
3. Reads 0-1.2 MPa pressure transducer via 12-bit ADC on GPIO 34.
4. Serializes readings into JSON and dispatches periodic HTTP POST requests to `/api/telemetry`.

```json
{
  "flow_in": 100.0,
  "flow_out": 58.0,
  "pressure": 1.6,
  "zone": "Zone-A"
}
```

---

## How AquaAgent satisfies the Agentic AI requirements

| Hackathon Dimension | How AquaAgent Satisfies It |
| :--- | :--- |
| **Goal-Driven Execution** | Maintains explicit objective to minimize water loss and isolate leaks without per-step human micro-management. |
| **Dynamic Action Selection** | Chooses actions dynamically based on telemetry severity, topology, and actuator responsiveness. |
| **Multi-Step Execution** | Executes the full sequence: Observe $\rightarrow$ Analyze $\rightarrow$ Decide $\rightarrow$ Act $\rightarrow$ Evaluate $\rightarrow$ Adapt. |
| **Dynamic Adaptation** | When Valve 1 fails, the agent replans and executes Valve 2 rather than failing. |
| **Robustness** | Catches tool failures, preserves memory state, and prevents system crashes. |
| **Agent / Controller** | Encapsulated within `AquaAgentController` with strict phase management. |
| **Tools Ecosystem** | Structured tools for sensor reading, leak analysis, valve control, verification, and alerting. |
| **External Systems** | Integrates with pipeline physics simulator and real ESP32 IoT endpoints. |
| **Memory / State** | Tracks telemetry history, active goal, attempted actuators, failed actuators, and event logs. |
| **Planning** | Policy-driven action formulation with fallback branching. |
| **Evaluation / Verification** | Post-action verification tool checks fresh sensor readings before declaring resolution. |
| **Human Interaction** | Dispatches structured emergency alerts with diagnostic logs when multi-actuator lockout occurs. |
| **Failure Handling** | End-to-end failure containment, replanning, and escalation workflow. |

---

## Limitations

- Prototype currently models 2-actuator zone topology; expandable to mesh distribution graphs.
- Transient water hammer pressure surges are simplified in the baseline simulator.

---

## Future Scope

- Graph Neural Network (GNN) integration for multi-zone city-scale hydraulic topology.
- LoRaWAN and NB-IoT communication protocols for remote rural pipeline networks.
- Edge impulse acoustic leak detection integration with piezoelectric vibration sensors.

---

## Team Members

Team Members:
1. __________________
2. __________________
3. __________________
4. __________________
