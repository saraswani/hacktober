import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt to load .env from current directory, parent directory, and server directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
const isPlaceholder = apiKey === 'PASTE_MY_GOOGLE_AI_STUDIO_API_KEY_HERE' || apiKey.length === 0;

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  geminiApiKey: apiKey,
  // Primary model as specified by hackathon: gemma-4-26b-a4b-it
  modelName: process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it',
  isApiKeyConfigured: Boolean(apiKey && !isPlaceholder)
};
