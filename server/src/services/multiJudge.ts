import { generateGemmaContent, extractAndValidateJson } from '../gemini.js';
import {
  SKEPTIC_SYSTEM_PROMPT,
  EXPERT_SYSTEM_PROMPT,
  BEGINNER_SYSTEM_PROMPT,
  VERIFIER_SYSTEM_PROMPT
} from '../prompts.js';
import { JudgeRole, JudgeRoleResult, JudgeRoleResultSchema } from '../schemas.js';

interface RoleDefinition {
  role: JudgeRole;
  systemPrompt: string;
}

const ROLES: RoleDefinition[] = [
  { role: 'skeptic', systemPrompt: SKEPTIC_SYSTEM_PROMPT },
  { role: 'expert', systemPrompt: EXPERT_SYSTEM_PROMPT },
  { role: 'beginner', systemPrompt: BEGINNER_SYSTEM_PROMPT },
  { role: 'verifier', systemPrompt: VERIFIER_SYSTEM_PROMPT }
];

export async function runSingleRoleJudge(
  roleDef: RoleDefinition,
  prompt: string,
  imageBase64?: string,
  mimeType?: string
): Promise<JudgeRoleResult> {
  const userMessage = `Independently evaluate this input according to your designated role:\n\n${prompt}`;
  try {
    const rawResponse = await generateGemmaContent(
      roleDef.systemPrompt,
      userMessage,
      imageBase64,
      mimeType
    );
    const parsed = extractAndValidateJson(rawResponse, JudgeRoleResultSchema);
    return {
      ...parsed,
      role: roleDef.role,
      available: true
    };
  } catch (error: any) {
    // Graceful degradation: mark unavailable without fabricating response
    return {
      role: roleDef.role,
      verdict: 'INCONCLUSIVE',
      score: 50,
      confidence: 0,
      reasoning: `Judge role encountered execution failure: ${error?.message || 'Unknown error'}`,
      key_points: [],
      concerns: ['Judge unavailable due to API error or rate limitation'],
      available: false,
      error: error?.message || 'Execution error'
    };
  }
}

/**
 * Runs all four Gemma 4 judge roles in STRICT PARALLEL INDEPENDENCE.
 * No judge sees or communicates with any other judge.
 */
export async function runMultiJudge(
  prompt: string,
  imageBase64?: string,
  mimeType?: string
): Promise<{ judges: JudgeRoleResult[]; availableCount: number }> {
  // Fire all 4 requests concurrently in complete isolation
  const rolePromises = ROLES.map((r) => runSingleRoleJudge(r, prompt, imageBase64, mimeType));
  const settled = await Promise.allSettled(rolePromises);

  const judges: JudgeRoleResult[] = settled.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      role: ROLES[idx].role,
      verdict: 'INCONCLUSIVE',
      score: 50,
      confidence: 0,
      reasoning: 'Judge failed to settle promise.',
      key_points: [],
      concerns: ['Promise rejected'],
      available: false,
      error: 'Promise rejected'
    };
  });

  const availableCount = judges.filter((j) => j.available).length;

  return { judges, availableCount };
}
