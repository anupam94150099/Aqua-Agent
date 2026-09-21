from simulation.engine import SimulationEngine
from agent.decision_engine import AgentDecisionEngine

class GlobalState:
    def __init__(self):
        self.sim = SimulationEngine()
        self.agent = AgentDecisionEngine(self.sim)
        self.auto_loop = True
        self.tick_count = 0
        self.scenario_name = "NORMAL"

    def reset_all(self):
        self.sim.reset()
        self.agent.reset()
        self.scenario_name = "NORMAL"
        self.auto_loop = True

    def set_scenario(self, scenario: str):
        self.scenario_name = scenario
        if scenario == "NORMAL":
            self.sim.reset()
            self.agent.reset()
        elif scenario == "LEAK":
            self.sim.set_valve_1_fault(False)
            self.sim.set_valve_2_fault(False)
            self.sim.trigger_leak("HIGH")
        elif scenario == "VALVE1_FAILURE":
            self.sim.set_valve_1_fault(True)
            self.sim.set_valve_2_fault(False)
            self.sim.trigger_leak("HIGH")
        elif scenario == "ADAPT_RECOVER":
            self.sim.set_valve_1_fault(True)
            self.sim.set_valve_2_fault(False)
            self.sim.trigger_leak("HIGH")
            # Force advance agent into replan & close valve 2
            self.agent.autonomous_step() # OBSERVE
            self.agent.autonomous_step() # ANALYZE
            self.agent.autonomous_step() # PLAN V1
            self.agent.autonomous_step() # ACT V1 -> FAILS
            self.agent.autonomous_step() # ADAPT -> PLAN V2
            self.agent.autonomous_step() # ACT V2 -> SUCCEEDS
        elif scenario == "BOTH_FAILED":
            self.sim.set_valve_1_fault(True)
            self.sim.set_valve_2_fault(True)
            self.sim.trigger_leak("HIGH")
            # Advance until escalation
            self.agent.autonomous_step()
            self.agent.autonomous_step()
            self.agent.autonomous_step()
            self.agent.autonomous_step()
            self.agent.autonomous_step()
            self.agent.autonomous_step()
            self.agent.autonomous_step()

state = GlobalState()
