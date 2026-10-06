import { generateGemmaContent, extractAndValidateJson } from '../gemini.js';
import { SINGLE_BASE_SYSTEM_PROMPT } from '../prompts.js';
import { SingleJudgeResult, SingleJudgeResultSchema } from '../schemas.js';

export async function runSingleJudge(
  prompt: string,
  imageBase64?: string,
  mimeType?: string
): Promise<SingleJudgeResult> {
  const userMessage = `Please evaluate the following problem/input:\n\n${prompt}`;
  const rawResponse = await generateGemmaContent(
    SINGLE_BASE_SYSTEM_PROMPT,
    userMessage,
    imageBase64,
    mimeType
  );

  return extractAndValidateJson(rawResponse, SingleJudgeResultSchema);
}
