import math
import random
import time
from datetime import datetime
from typing import Dict, List, Any

class SimulationEngine:
    def __init__(self):
        self.reset()

    def reset(self):
        self.flow_rate = 42.4
        self.pressure = 3.82
        self.target_flow = 42.4
        self.target_pressure = 3.82
        self.leak_active = False
        self.leak_severity = "NONE" # NONE, LOW, MEDIUM, HIGH, CRITICAL
        self.leak_zone = "Zone B"
        
        # Valve states
        self.valves: Dict[str, Dict[str, Any]] = {
            "valve_1": {
                "id": "valve_1",
                "name": "Zone B Primary Inlet Actuator",
                "zone": "Zone B",
                "status": "OPEN", # OPEN, CLOSED, FAILED, CLOSING
                "last_command": "INITIALIZE",
                "last_response_time_ms": 120,
                "health": 100
            },
            "valve_2": {
                "id": "valve_2",
                "name": "Zone B Secondary Isolation Valve",
                "zone": "Zone B",
                "status": "OPEN",
                "last_command": "INITIALIZE",
                "last_response_time_ms": 140,
                "health": 100
            },
            "valve_main": {
                "id": "valve_main",
                "name": "Central Feeder Valve",
                "zone": "Main Pipeline",
                "status": "OPEN",
                "last_command": "INITIALIZE",
                "last_response_time_ms": 95,
                "health": 100
            }
        }
        
        # Fault injection flags
        self.inject_valve_1_fault = False
        self.inject_valve_2_fault = False
        
        # Zones
        self.zones: Dict[str, Dict[str, Any]] = {
            "Zone A": {"id": "Zone A", "name": "Zone A - Commercial Hub", "status": "NORMAL", "flow": 12.1, "pressure": 3.85, "valves": ["valve_main"]},
            "Zone B": {"id": "Zone B", "name": "Zone B - High-Density Residential", "status": "NORMAL", "flow": 18.2, "pressure": 3.82, "valves": ["valve_1", "valve_2"]},
            "Zone C": {"id": "Zone C", "name": "Zone C - Industrial Sector", "status": "NORMAL", "flow": 7.5, "pressure": 3.80, "valves": []},
            "Zone D": {"id": "Zone D", "name": "Zone D - Suburban Extension", "status": "NORMAL", "flow": 4.6, "pressure": 3.79, "valves": []}
        }
        
        # Water loss & savings calculation
        self.water_lost_liters = 0.0
        self.water_saved_liters = 1248.0 # Base simulation benchmark
        self.last_tick_time = time.time()
        
        # History for charts (last 30 points)
        self.history: List[Dict[str, Any]] = []
        now = datetime.now()
        for i in range(25, 0, -1):
            t_str = datetime.fromtimestamp(now.timestamp() - i * 2).strftime("%H:%M:%S")
            self.history.append({
                "timestamp": t_str,
                "flow_rate": round(42.0 + random.uniform(-0.6, 0.6), 1),
                "pressure": round(3.8 + random.uniform(-0.04, 0.04), 2),
                "expected_flow_min": 40.0,
                "expected_flow_max": 45.0,
                "expected_pressure_min": 3.5,
                "expected_pressure_max": 4.0,
                "zone_b_flow": round(18.0 + random.uniform(-0.3, 0.3), 1),
                "zone_b_pressure": round(3.8 + random.uniform(-0.03, 0.03), 2)
            })

    def trigger_leak(self, severity="HIGH"):
        self.leak_active = True
        self.leak_severity = severity
        self.zones["Zone B"]["status"] = "LEAK DETECTED"
        self.target_flow = 82.5 if severity == "HIGH" else 92.0
        self.target_pressure = 1.85 if severity == "HIGH" else 1.45

    def set_valve_1_fault(self, is_faulty=True):
        self.inject_valve_1_fault = is_faulty

    def set_valve_2_fault(self, is_faulty=True):
        self.inject_valve_2_fault = is_faulty

    def command_valve(self, valve_id: str, action: str) -> bool:
        """Executes a valve action (OPEN or CLOSE). Returns True if action succeeded, False if failed."""
        if valve_id not in self.valves:
            return False
        
        valve = self.valves[valve_id]
        valve["last_command"] = action
        
        # Check simulated faults
        if valve_id == "valve_1" and self.inject_valve_1_fault and action == "CLOSE":
            valve["status"] = "FAILED"
            valve["last_response_time_ms"] = 3500
            valve["health"] = 15
            return False
            
        if valve_id == "valve_2" and self.inject_valve_2_fault and action == "CLOSE":
            valve["status"] = "FAILED"
            valve["last_response_time_ms"] = 3800
            valve["health"] = 10
            return False
            
        # Success
        valve["status"] = action
        valve["last_response_time_ms"] = random.randint(180, 420)
        valve["health"] = 100
        
        # If either Valve 1 or Valve 2 successfully closes, Zone B is isolated!
        if action == "CLOSE" and (valve_id in ["valve_1", "valve_2"]):
            self.zones["Zone B"]["status"] = "ISOLATED"
            self.leak_active = False
            self.target_flow = 42.1
            self.target_pressure = 3.82
            self.water_saved_liters += 450.0
            
        elif action == "OPEN" and (valve_id in ["valve_1", "valve_2"]):
            if self.leak_active:
                self.zones["Zone B"]["status"] = "LEAK DETECTED"
                self.target_flow = 82.5
                self.target_pressure = 1.85
            else:
                self.zones["Zone B"]["status"] = "NORMAL"
                self.target_flow = 42.4
                self.target_pressure = 3.82
                
        return True

    def mark_zone_resolved(self, zone_name="Zone B"):
        if zone_name in self.zones:
            self.zones[zone_name]["status"] = "RESOLVED"
            self.leak_active = False

    def tick(self):
        """Advance simulation physics by one step"""
        dt = time.time() - self.last_tick_time
        self.last_tick_time = time.time()
        
        alpha = 0.35
        self.flow_rate = round(self.flow_rate + alpha * (self.target_flow - self.flow_rate) + random.uniform(-0.35, 0.35), 1)
        self.pressure = round(self.pressure + alpha * (self.target_pressure - self.pressure) + random.uniform(-0.02, 0.02), 2)
        
        if self.leak_active:
            excess_flow = max(0.0, self.flow_rate - 42.0)
            self.water_lost_liters = round(self.water_lost_liters + (excess_flow / 60.0) * max(0.2, dt), 1)
            
        zb_flow = round(self.flow_rate * 0.43, 1) if not (self.valves["valve_1"]["status"] == "CLOSED" or self.valves["valve_2"]["status"] == "CLOSED") else round(1.2 + random.uniform(-0.1, 0.1), 1)
        self.zones["Zone B"]["flow"] = zb_flow
        self.zones["Zone B"]["pressure"] = self.pressure
        
        t_str = datetime.now().strftime("%H:%M:%S")
        self.history.append({
            "timestamp": t_str,
            "flow_rate": self.flow_rate,
            "pressure": self.pressure,
            "expected_flow_min": 40.0,
            "expected_flow_max": 45.0,
            "expected_pressure_min": 3.5,
            "expected_pressure_max": 4.0,
            "zone_b_flow": zb_flow,
            "zone_b_pressure": self.pressure
        })
        if len(self.history) > 30:
            self.history.pop(0)

    def get_status_payload(self) -> Dict[str, Any]:
        return {
            "flow_rate": self.flow_rate,
            "pressure": self.pressure,
            "leak_active": self.leak_active,
            "leak_severity": self.leak_severity,
            "leak_zone": self.leak_zone,
            "valves": self.valves,
            "zones": self.zones,
            "water_lost_liters": self.water_lost_liters,
            "water_saved_liters": self.water_saved_liters,
            "history": self.history
        }
