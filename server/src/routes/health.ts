import { Router, Request, Response } from 'express';
import { config } from '../config.js';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'VERDICT Reliability Engine',
    model: config.modelName,
    apiKeyConfigured: config.isApiKeyConfigured,
    setupGuide: config.isApiKeyConfigured
      ? 'API Key is active.'
      : 'Set GEMINI_API_KEY in server/.env or root .env to enable live Gemma 4 inference.'
  });
});
