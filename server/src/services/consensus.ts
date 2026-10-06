import { generateGemmaContent, extractAndValidateJson } from '../gemini.js';
import { CONSENSUS_RECONCILER_SYSTEM_PROMPT } from '../prompts.js';
import {
  ConsensusResult,
  ConsensusResultSchema,
  JudgeRoleResult
} from '../schemas.js';

export async function runConsensus(
  prompt: string,
  judges: JudgeRoleResult[]
): Promise<ConsensusResult> {
  const availableJudges = judges.filter((j) => j.available);

  if (availableJudges.length === 0) {
    return {
      final_verdict: 'INCONCLUSIVE',
      final_score: 50,
      confidence: 0,
      agreement_percent: 0,
      summary: 'All judges were unavailable to evaluate the prompt.',
      strongest_arguments: ['No jury members could complete analysis'],
      disagreements: [],
      decision: 'Unable to deliberate due to jury unavailability.',
      reliability_assessment: 'uncertain'
    };
  }

  // Format the structured inputs cleanly for the consensus judge
  const deliberationPackage = {
    original_problem: prompt,
    available_jury_size: `${availableJudges.length} of ${judges.length}`,
    judge_findings: availableJudges.map((j) => ({
      role: j.role.toUpperCase(),
      verdict: j.verdict,
      score: j.score,
      confidence: j.confidence,
      reasoning: j.reasoning,
      key_points: j.key_points,
      concerns: j.concerns
    }))
  };

  const userMessage = `Deliberate on these independent jury findings and reconcile any disagreements:\n\n${JSON.stringify(
    deliberationPackage,
    null,
    2
  )}`;

  try {
    const rawResponse = await generateGemmaContent(
      CONSENSUS_RECONCILER_SYSTEM_PROMPT,
      userMessage
    );

    return extractAndValidateJson(rawResponse, ConsensusResultSchema);
  } catch (error: any) {
    // If the consensus API call fails, construct an honest algorithmic fallback
    const scores = availableJudges.map((j) => j.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const verdicts = availableJudges.map((j) => j.verdict);
    const hasFail = verdicts.includes('FAIL');
    const hasWarning = verdicts.includes('WARNING');
    const finalVerdict = hasFail ? 'FAIL' : hasWarning ? 'WARNING' : 'PASS';

    return {
      final_verdict: finalVerdict,
      final_score: avgScore,
      confidence: 50,
      agreement_percent: Math.round(
        (verdicts.filter((v) => v === finalVerdict).length / verdicts.length) * 100
      ),
      summary: `Consensus synthesis completed via fallback reconciliation (${availableJudges.length} judges available).`,
      strongest_arguments: availableJudges.flatMap((j) => j.key_points).slice(0, 3),
      disagreements: [
        {
          topic: 'Consensus Parsing Notice',
          judges_involved: availableJudges.map((j) => j.role),
          description: `Consensus model output failed: ${error?.message || 'Formatting error'}. Aggregated from individual judges.`,
          resolution: 'Conservative synthesis applied.'
        }
      ],
      decision: `Adopted ${finalVerdict} based on majority/critical threshold.`,
      reliability_assessment: 'uncertain'
    };
  }
}
