import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { config } from './config.js';

let genAIClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set it in .env');
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return genAIClient;
}

/**
 * Robust JSON extraction from raw model text.
 * Handles Markdown code fences, conversational prose, trailing commas,
 * and minor formatting deviations.
 */
export function extractAndValidateJson<T>(rawText: string, schema: z.ZodType<T, any, any>): T {
  let cleaned = rawText.trim();

  // 1. Remove markdown fences if present
  const markdownFenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(markdownFenceRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // 2. If text still contains non-JSON wrapper, extract the outermost {...} block
  if (!cleaned.startsWith('{') || !cleaned.endsWith('}')) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1).trim();
    }
  }

  // 3. Attempt JSON parse
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch (err) {
    // Attempt minor recovery: fix trailing commas in objects/arrays
    const repaired = cleaned
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');
    try {
      parsedJson = JSON.parse(repaired);
    } catch {
      throw new Error(`Failed to parse model output as JSON: ${rawText.slice(0, 200)}...`);
    }
  }

  // 4. Validate with Zod
  const result = schema.safeParse(parsedJson);
  if (result.success) {
    return result.data;
  }

  // If Zod validation failed, attempt type normalization (e.g. string numbers to numbers)
  if (typeof parsedJson === 'object' && parsedJson !== null) {
    const candidate = { ...(parsedJson as Record<string, unknown>) };
    for (const key of Object.keys(candidate)) {
      if (typeof candidate[key] === 'string' && !isNaN(Number(candidate[key]))) {
        candidate[key] = Number(candidate[key]);
      }
    }
    const retry = schema.safeParse(candidate);
    if (retry.success) {
      return retry.data;
    }
  }

  throw new Error(`Model response failed schema validation: ${result.error.message}`);
}

/**
 * Generate content using Gemma 4 model
 */
export async function generateGemmaContent(
  systemInstruction: string,
  userPrompt: string,
  imageBase64?: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const ai = getGenAIClient();

  const contents: Array<Record<string, unknown> | string> = [];

  if (imageBase64) {
    contents.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    });
  }

  contents.push(userPrompt);

  const response = await ai.models.generateContent({
    model: config.modelName,
    contents: contents as any,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2 // Low temperature for high analytical consistency
    }
  });

  const text = response.text || '';
  if (!text) {
    throw new Error('Gemma model returned an empty response.');
  }

  return text;
}
