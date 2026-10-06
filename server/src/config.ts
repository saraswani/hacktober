import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from workspace root or server directory
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  // Primary model as specified: gemma-4-26b-a4b-it
  // With configurable override if needed
  modelName: process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it',
  isApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0)
};
