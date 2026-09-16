import { Router } from 'express';
import { globalAgentState } from '../agent/AgentState.js';
import { simulationEngine } from '../simulation/SimulationEngine.js';

const router = Router();

router.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const initialPayload = {
    type: 'INIT',
    state: globalAgentState.getState(),
    simulation: simulationEngine.getState(),
  };
  res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);

  const unsubscribe = globalAgentState.subscribe((event, state) => {
    const payload = {
      type: 'EVENT',
      event,
      state,
      simulation: simulationEngine.getState(),
    };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });

  // Continuous real-time SCADA sensor pulse every 1.5 seconds
  const sensorInterval = setInterval(() => {
    const currentSensor = simulationEngine.getSensorData();
    globalAgentState.updateSensorData(currentSensor);
    const payload = {
      type: 'TELEMETRY_TICK',
      sensorData: currentSensor,
      state: globalAgentState.getState(),
      simulation: simulationEngine.getState(),
    };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }, 1500);

  const heartbeatInterval = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 5000);

  req.on('close', () => {
    clearInterval(sensorInterval);
    clearInterval(heartbeatInterval);
    unsubscribe();
    res.end();
  });
});

export default router;
