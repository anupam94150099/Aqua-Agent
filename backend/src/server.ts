import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import agentRoutes from './routes/agentRoutes.js';
import stateRoutes from './routes/stateRoutes.js';
import sseRoutes from './routes/sseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api', sseRoutes);
app.use('/api', stateRoutes);
app.use('/api', agentRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'AquaAgent API',
    description: 'Autonomous AI Agent for Smart Water Leakage Detection and Response',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      state: 'GET /api/state',
      logs: 'GET /api/logs',
      simulation: 'GET /api/simulation',
      telemetry: 'GET /api/telemetry',
      stream: 'GET /api/stream (SSE)',
      scenarios: {
        normal: 'POST /api/scenario/normal',
        mediumLeak: 'POST /api/scenario/medium-leak',
        highLeak: 'POST /api/scenario/high-leak',
        failureDemo: 'POST /api/scenario/failure',
        bothFailed: 'POST /api/scenario/both-failed',
        reset: 'POST /api/reset',
        runAgent: 'POST /api/agent/run',
      },
    },
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AquaAgent Backend running on http://localhost:${PORT}`);
    console.log(`🌊 Loop: OBSERVE → DECIDE → ACT → EVALUATE → ADAPT`);
    console.log(`📡 SSE Stream: http://localhost:${PORT}/api/stream`);
    console.log(`🤖 Planner: ${process.env.OPENAI_API_KEY ? 'LLM Augmented' : 'Deterministic Core (No Key Required)'}`);
    console.log(`====================================================`);
  });
}

export default app;
