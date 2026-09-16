import { Router } from 'express';
import { globalAgentState } from '../agent/AgentState.js';
import { simulationEngine } from '../simulation/SimulationEngine.js';
import { dbManager } from '../db/database.js';
import { ToolRegistry } from '../tools/ToolRegistry.js';
import { globalAgentController } from '../agent/AgentController.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AquaAgent Backend API',
    uptimeSeconds: process.uptime(),
    planner: process.env.OPENAI_API_KEY ? 'LLM-Augmented (OpenAI)' : 'Deterministic-Engine (Offline)',
  });
});

router.get('/state', (req, res) => {
  res.json({
    success: true,
    state: globalAgentState.getState(),
  });
});

router.get('/logs', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  const events = dbManager.getEvents(limit);
  res.json({
    success: true,
    count: events.length,
    events,
  });
});

router.get('/simulation', (req, res) => {
  res.json({
    success: true,
    simulation: simulationEngine.getState(),
    sensorData: simulationEngine.getSensorData(),
  });
});

router.get('/incidents', (req, res) => {
  const incidents = dbManager.getIncidents();
  res.json({
    success: true,
    incidents,
  });
});

router.get('/telemetry', (req, res) => {
  const telemetry = dbManager.getTelemetryHistory();
  res.json({
    success: true,
    telemetry,
  });
});

router.get('/tools', (req, res) => {
  res.json({
    success: true,
    tools: ToolRegistry.getRegisteredTools(),
  });
});

router.post('/telemetry', async (req, res) => {
  try {
    const { flow_in, flow_out, pressure, zone } = req.body;
    if (flow_in === undefined || flow_out === undefined || pressure === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required sensor telemetry fields (flow_in, flow_out, pressure)' });
    }

    const updatedSensor = simulationEngine.injectSensorReading(
      Number(flow_in),
      Number(flow_out),
      Number(pressure),
      zone || 'Zone 4 - ESP32 Node'
    );

    globalAgentController.runCycle({ stepDelayMs: 200, injectedSensorData: updatedSensor }).catch(err => {
      console.error('Error handling IoT telemetry cycle:', err);
    });

    res.json({
      success: true,
      message: 'IoT sensor telemetry ingested successfully. Autonomous agent cycle triggered.',
      sensorData: updatedSensor,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to ingest telemetry' });
  }
});

export default router;
