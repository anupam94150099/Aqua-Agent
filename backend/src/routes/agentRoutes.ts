import { Router } from 'express';
import { simulationEngine } from '../simulation/SimulationEngine.js';
import { globalAgentState } from '../agent/AgentState.js';
import { globalAgentController } from '../agent/AgentController.js';
import { ScenarioType, ValveId, ValveAction } from '../types/index.js';
import { ToolRegistry } from '../tools/ToolRegistry.js';

const router = Router();

router.post('/run', async (req, res) => {
  try {
    const delayMs = req.body.stepDelayMs !== undefined ? Number(req.body.stepDelayMs) : 400;
    const outcome = await globalAgentController.runCycle({ stepDelayMs: delayMs });
    res.json({
      success: true,
      outcome,
      state: globalAgentState.getState(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Agent cycle execution error' });
  }
});

router.post('/reset', (req, res) => {
  try {
    simulationEngine.reset();
    globalAgentState.reset();
    globalAgentState.emitEvent('IDLE', 'System Reset', 'All distribution sectors reset to nominal baseline state.');
    res.json({
      success: true,
      message: 'AquaAgent grid simulation successfully reset to nominal conditions.',
      state: globalAgentState.getState(),
      simulation: simulationEngine.getState(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Reset failed' });
  }
});

// Direct manual valve control from dashboard
router.post('/valve/control', async (req, res) => {
  try {
    const { valveId, action } = req.body;
    if (!valveId || !action) {
      return res.status(400).json({ success: false, error: 'Missing valveId or action' });
    }
    const result = await ToolRegistry.controlValve(valveId as ValveId, action as ValveAction);
    globalAgentState.updateSensorData(simulationEngine.getSensorData());
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Valve control failed' });
  }
});

function handleScenario(scenario: ScenarioType) {
  return async (req: any, res: any) => {
    try {
      globalAgentState.reset();
      simulationEngine.setScenario(scenario);
      const simState = simulationEngine.getState();
      const delayMs = req.body?.stepDelayMs !== undefined ? Number(req.body.stepDelayMs) : 400;
      
      res.json({
        success: true,
        scenario,
        message: `Scenario '${scenario}' initiated. Agent cycle running across distribution grid.`,
        initialSimulation: simState,
      });

      globalAgentController.runCycle({ stepDelayMs: delayMs }).catch(err => {
        console.error(`Error running cycle for scenario ${scenario}:`, err);
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Failed to set scenario' });
    }
  };
}

router.post('/scenario/normal', handleScenario('normal'));
router.post('/scenario/medium-leak', handleScenario('medium-leak'));
router.post('/scenario/high-leak', handleScenario('high-leak'));
router.post('/scenario/water-theft', handleScenario('water-theft'));
router.post('/scenario/failure', handleScenario('failure'));
router.post('/scenario/both-failed', handleScenario('both-failed'));

export default router;
