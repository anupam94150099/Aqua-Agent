# AquaAgent
## Autonomous AI Agent for Smart Water Leakage Detection & Response
### Global Innovation Hackathon 2026 Submission Prototype

---

## 1. Core Problem
Municipal water distribution networks globally lose **30% to 45% of treated drinking water** to physical pipeline bursts, fractures, and joint leaks.
Traditional SCADA and smart meter systems follow a passive paradigm:
```
Sensor Anomaly -> Human Alert -> Dispatch Team -> Manual Inspection -> Physical Valve Turn
(Average Latency: 45 to 60 Minutes | Massive Water Loss & Street Damage)
```

## 2. Solution: AquaAgent Autonomous Closed Loop
AquaAgent eliminates response latency through an **autonomous, self-healing closed loop**:
```
Sensors (Flow + Pressure + Valve Telemetry)
    |
    v
[1. OBSERVE] Continuous telemetry ingestion across DMA pipeline zones
    |
    v
[2. ANALYZE] Cross-sensor gradient correlation (eliminates false alarms)
    |
    v
[3. PLAN] Safe Isolation Policy evaluation (P-04 / Policy Engine)
    |
    v
[4. ACT] Wireless solenoid actuation command dispatched to Valve 1
    |
    v
[5. VERIFY] Real-time hydraulic stabilization check (Flow & Pressure)
    |
    +---> If Successful -> [RESOLVED] (Incident closed & logged)
    |
    +---> If Actuator Jammed / Timeout -> [ADAPT & REPLAN]
             |
             v
         Select Secondary Isolation Ring (Valve 2) -> ACT -> VERIFY
             |
             +---> If Successful -> [RESOLVED] (Auto-recovered after fault)
             |
             +---> If Dual Failure -> [RESPONSIBLE ESCALATION] -> Human Operator
```

---

## 3. Technology Stack

- **Frontend**:
  - React 18
  - Vite 6
  - Tailwind CSS
  - Lucide React Icons
  - Recharts (Real-time telemetry, baseline bands, comparison bar charts)
  - Interactive SVG Pipeline Topology with animated flow particles

- **Backend**:
  - Python 3.12
  - FastAPI
  - Uvicorn (Asynchronous ASGI server)
  - Pydantic v2 schemas
  - Physics-correlated Sensor Simulation Engine (Flow, Pressure, Valve Conductance)
  - Autonomous Agent Decision State Machine Kernel

---

## 4. How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python 3.10+

### Step 1: Start the FastAPI Backend
```bash
cd backend
python -m pip install fastapi uvicorn pydantic
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will run at `http://127.0.0.1:8000` with interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.

### Step 2: Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend UI will be live at `http://localhost:5173`.

---

## 5. Hackathon Demo Scenarios

The **Demo Control Center** at the top of the dashboard provides 1-click test scenarios:

1. **[ NORMAL ]**: Grid in equilibrium (Flow 42.4 L/min, Pressure 3.82 bar across Zones A, B, C, D).
2. **[ SIMULATE LEAK ]**: Triggers a major pipe rupture in Zone B (Flow surges to ~82 L/min, Pressure plunges to ~1.9 bar). Agent detects and attempts Valve 1.
3. **[ VALVE 1 FAILURE ]**: Simulates an actuator fault/timeout on primary Valve 1. Agent enters **ADAPT & REPLAN**, dynamically selecting secondary Valve 2.
4. **[ ADAPT & RECOVER ]**: Valve 2 closes successfully, flow normalizes, verification passes, and incident is marked **RESOLVED**.
5. **[ BOTH VALVES FAILED ]**: Simulates a catastrophic dual-actuator failure. Agent recognizes its operational boundary and safely triggers **HUMAN ESCALATION**.
6. **[ RESET SYSTEM ]**: Restores baseline parameters and clears fault flags.

### ⚡ 8-Step Pitch Demo Mode
Click **Pitch Demo Mode** in the header to run an interactive 2-minute presenter wizard with adjustable speed (Fast, Normal, Detailed) and step-by-step narration.

---

## 6. Hardware Integration Roadmap (ESP32 / LoRaWAN / Modbus)
AquaAgent's simulation engine outputs standardized JSON payloads that match physical hardware deployments:
- **Microcontroller**: ESP32-WROOM-32 with FreeRTOS
- **Flow Sensor**: YF-S201 Hall-Effect turbine (0.5–30 L/min)
- **Pressure Sensor**: DFRobot SEN0257 Piezoresistive Transducer (0–1.2 MPa)
- **Actuators**: 12V DC Latching Brass Solenoid Valves with optocoupled current feedback
- **Protocol**: MQTT / WebSocket / Modbus RTU telemetry ingest
