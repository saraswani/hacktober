import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { healthRouter } from './routes/health.js';
import { judgeRouter } from './routes/judge.js';
import { benchmarkRouter } from './routes/benchmark.js';

export const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/judge', judgeRouter);
app.use('/api/benchmark', benchmarkRouter);

// Basic root route
app.get('/', (_req, res) => {
  res.json({
    name: 'VERDICT API',
    tagline: "When one AI isn't enough, ask a jury.",
    status: 'online',
    model: config.modelName
  });
});

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`[VERDICT Server] Listening on http://localhost:${config.port}`);
    console.log(`[VERDICT Server] Gemma Model: ${config.modelName}`);
    console.log(
      `[VERDICT Server] GEMINI_API_KEY Configured: ${
        config.isApiKeyConfigured ? 'YES' : 'NO (Set in .env for live inference)'
      }`
    );
  });
}
