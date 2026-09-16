import { describe, it, expect, beforeEach } from 'vitest';
import { simulationEngine } from '../src/simulation/SimulationEngine.js';
import { globalAgentState } from '../src/agent/AgentState.js';
import { AgentController } from '../src/agent/AgentController.js';
import { DecisionEngine } from '../src/agent/DecisionEngine.js';
import { ToolRegistry } from '../src/tools/ToolRegistry.js';
import { dbManager } from '../src/db/database.js';

describe('AquaAgent Full Suite Tests', () => {
  let controller: AgentController;

  beforeEach(() => {
    simulationEngine.reset();
    globalAgentState.reset();
    controller = new AgentController(globalAgentState);
  });

  it('1. Normal Scenario: Detects safe baseline flow and continues monitoring', async () => {
    simulationEngine.setScenario('normal');
    const outcome = await controller.runCycle({ stepDelayMs: 0 });

    expect(outcome).toBe('NORMAL_OPERATION');
    const state = globalAgentState.getState();
    expect(state.finalOutcome).toBe('NORMAL_OPERATION');
    expect(state.sensorData.flow_in).toBe(100);
    expect(state.sensorData.flow_out).toBe(97);
    expect(state.sensorData.pressure).toBe(3.2);
    expect(state.analysis?.severity).toBe('NORMAL');
  });

  it('2. Medium Leakage Scenario: Correctly detects medium deficit and isolates leak', async () => {
    simulationEngine.setScenario('medium-leak');
    const outcome = await controller.runCycle({ stepDelayMs: 0 });

    expect(outcome).toBe('RESOLVED');
    const state = globalAgentState.getState();
    expect(state.finalOutcome).toBe('RESOLVED');
    expect(state.attemptedActions).toContain('Valve 1');
    expect(state.sensorData.valve_status['Valve 1']).toBe('CLOSED');
  });

  it('3. High Leakage Scenario: Correctly detects acute deficit and isolates valve', async () => {
    simulationEngine.setScenario('high-leak');
    const outcome = await controller.runCycle({ stepDelayMs: 0 });

    expect(outcome).toBe('RESOLVED');
    const state = globalAgentState.getState();
    expect(state.finalOutcome).toBe('RESOLVED');
    expect(state.attemptedActions).toContain('Valve 1');
    expect(state.sensorData.valve_status['Valve 1']).toBe('CLOSED');
  });

  it('4. Valve Success & Direct Execution via ToolRegistry', async () => {
    simulationEngine.setScenario('normal');
    const res = await ToolRegistry.controlValve('Valve 1', 'close');

    expect(res.success).toBe(true);
    expect(res.valve).toBe('Valve 1');
    expect(res.action).toBe('close');
    expect(simulationEngine.getState().valves['Valve 1']).toBe('CLOSED');
  });

  it('5. Valve Failure Handling: Detects mechanical fault on actuator', async () => {
    simulationEngine.setScenario('failure');
    const res = await ToolRegistry.controlValve('Valve 1', 'close');

    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(res.error).toContain('Mechanical jam detected');
  });

  it('6. Failure + Adaptation Demo: Valve 1 fails -> Agent adapts to Valve 2 -> Recovers pipeline', async () => {
    simulationEngine.setScenario('failure');
    const outcome = await controller.runCycle({ stepDelayMs: 0 });

    expect(outcome).toBe('ADAPTED_AND_RESOLVED');
    const state = globalAgentState.getState();
    expect(state.finalOutcome).toBe('ADAPTED_AND_RESOLVED');
    expect(state.attemptedActions).toContain('Valve 1');
    expect(state.attemptedActions).toContain('Valve 2');
    expect(state.failures.length).toBeGreaterThanOrEqual(1);
    expect(state.sensorData.valve_status['Valve 2']).toBe('CLOSED');
    expect(state.sensorData.flow_out).toBeGreaterThanOrEqual(95);
    expect(state.sensorData.pressure).toBeGreaterThanOrEqual(2.5);

    const phases = state.eventHistory.map(e => e.phase);
    expect(phases).toContain('OBSERVE');
    expect(phases).toContain('ANALYZE');
    expect(phases).toContain('DECIDE');
    expect(phases).toContain('ACT');
    expect(phases).toContain('FAILURE');
    expect(phases).toContain('ADAPT');
    expect(phases).toContain('EVALUATE');
    expect(phases).toContain('VERIFY');
    expect(phases).toContain('ADAPTED_AND_RESOLVED');
  });

  it('7. Both Valves Failed Scenario: Valve 1 & Valve 2 fail -> Escalates to Human Maintenance', async () => {
    simulationEngine.setScenario('both-failed');
    const outcome = await controller.runCycle({ stepDelayMs: 0 });

    expect(outcome).toBe('ESCALATED');
    const state = globalAgentState.getState();
    expect(state.finalOutcome).toBe('ESCALATED');
    expect(state.attemptedActions).toContain('Valve 1');
    expect(state.attemptedActions).toContain('Valve 2');
    expect(state.failures.length).toBe(2);

    const phases = state.eventHistory.map(e => e.phase);
    expect(phases).toContain('FAILURE');
    expect(phases).toContain('ADAPT');
    expect(phases).toContain('ESCALATED');

    const incidents = dbManager.getIncidents();
    expect(incidents.length).toBeGreaterThan(0);
    expect(incidents[0].outcome).toBe('ESCALATED');
  });

  it('8. Reset Functionality: Restores baseline nominal conditions', async () => {
    simulationEngine.setScenario('high-leak');
    expect(simulationEngine.getState().leakSeverity).toBe('HIGH');

    const resetRes = await ToolRegistry.resetSimulation();
    expect(resetRes.success).toBe(true);

    const sim = simulationEngine.getState();
    expect(sim.flow_in).toBe(100);
    expect(sim.flow_out).toBe(97);
    expect(sim.pressure).toBe(3.2);
    expect(sim.leakActive).toBe(false);
    expect(sim.leakSeverity).toBe('NORMAL');
  });

  it('9. DecisionEngine Unit Calculations', () => {
    const normalData = {
      flow_in: 100,
      flow_out: 98,
      pressure: 3.0,
      zone: 'Zone 1',
      timestamp: new Date().toISOString(),
      valve_status: { 'Valve 1': 'OPEN' as const, 'Valve 2': 'OPEN' as const },
    };
    const analysisNormal = DecisionEngine.analyzeLeakage(normalData);
    expect(analysisNormal.severity).toBe('NORMAL');
    expect(analysisNormal.lossPercentage).toBe(0.02);

    const highData = {
      flow_in: 100,
      flow_out: 50,
      pressure: 1.5,
      zone: 'Zone 1',
      timestamp: new Date().toISOString(),
      valve_status: { 'Valve 1': 'OPEN' as const, 'Valve 2': 'OPEN' as const },
    };
    const analysisHigh = DecisionEngine.analyzeLeakage(highData);
    expect(analysisHigh.severity).toBe('HIGH');
    expect(analysisHigh.lossPercentage).toBe(0.5);
  });
});
