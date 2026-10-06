import { Router, Request, Response } from 'express';
import { config } from '../config.js';
import { runSingleJudge } from '../services/singleJudge.js';
import { runMultiJudge } from '../services/multiJudge.js';
import { runConsensus } from '../services/consensus.js';
import { ComparisonResult } from '../schemas.js';

export const judgeRouter = Router();

function validatePrompt(req: Request, res: Response, next: Function) {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt string is required.' });
  }
  next();
}

function requireApiKey(_req: Request, res: Response, next: Function) {
  if (!config.isApiKeyConfigured) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      code: 'MISSING_API_KEY',
      instructions: 'Create a .env file containing GEMINI_API_KEY=your_key to enable live Gemma 4 inference.'
    });
  }
  next();
}

/**
 * POST /api/judge/single
 * Baseline single-call evaluation with Gemma 4
 */
judgeRouter.post('/single', validatePrompt, requireApiKey, async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType } = req.body;
    const result = await runSingleJudge(prompt.trim(), imageBase64, mimeType);
    res.json(result);
  } catch (error: any) {

    const errorDetail = error?.message || 'Failed to run single model baseline.';
    console.error('Error in /api/judge/single:', errorDetail);
    res.status(500).json({
      error: errorDetail,
      message: errorDetail
    });
  }
});

/**
 * POST /api/judge/multi
 * 4-role independent jury evaluation followed by consensus reconciliation
 */
judgeRouter.post('/multi', validatePrompt, requireApiKey, async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType } = req.body;

    // Step 1: Run all 4 judges in parallel with zero shared state
    const { judges, availableCount } = await runMultiJudge(prompt.trim(), imageBase64, mimeType);

    // Step 2: Run consensus reconciliation stage
    const consensus = await runConsensus(prompt.trim(), judges);

    res.json({
      judges,
      consensus,
      availableJudgesCount: availableCount,
      totalJudgesCount: judges.length
    });
  } catch (error: any) {
    const errorDetail = error?.message || 'Failed to execute multi-judge jury.';
    console.error('Error in /api/judge/multi:', errorDetail);
    res.status(500).json({
      error: errorDetail,
      message: errorDetail
    });
  }
});

/**
 * POST /api/judge/both
 * Recommended action: Runs baseline AND multi-judge side-by-side, computing delta
 */
judgeRouter.post('/both', validatePrompt, requireApiKey, async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType } = req.body;
    const trimmedPrompt = prompt.trim();

    // Run baseline and 4-judge jury in parallel
    const [singleResult, multiRun] = await Promise.all([
      runSingleJudge(trimmedPrompt, imageBase64, mimeType),
      (async () => {
        const { judges, availableCount } = await runMultiJudge(trimmedPrompt, imageBase64, mimeType);
        const consensus = await runConsensus(trimmedPrompt, judges);
        return { judges, consensus, availableCount };
      })()
    ]);

    const decisionChanged = singleResult.verdict !== multiRun.consensus.final_verdict;
    const scoreDelta = multiRun.consensus.final_score - singleResult.score;
    const confidenceDelta = multiRun.consensus.confidence - singleResult.confidence;

    let explanation = '';
    if (decisionChanged) {
      explanation = `Multi-Judge overturned the baseline verdict from ${singleResult.verdict} to ${multiRun.consensus.final_verdict}. The multi-perspective jury uncovered specific nuances (agreement rate: ${multiRun.consensus.agreement_percent}%).`;
    } else {
      explanation = `Both methods agreed on ${singleResult.verdict}. Multi-Judge provided corroboration with ${multiRun.consensus.agreement_percent}% jury agreement.`;
    }

    const comparison: ComparisonResult = {
      decisionChanged,
      verdictComparison: `Single: ${singleResult.verdict} | Multi: ${multiRun.consensus.final_verdict}`,
      scoreDelta,
      confidenceDelta,
      explanation
    };

    res.json({
      single: singleResult,
      multi: {
        judges: multiRun.judges,
        consensus: multiRun.consensus,
        availableJudgesCount: multiRun.availableCount
      },
      comparison
    });
  } catch (error: any) {
    const errorDetail = error?.message || 'Failed to run comparative evaluation.';
    console.error('Error in /api/judge/both:', errorDetail);
    res.status(500).json({
      error: errorDetail,
      message: errorDetail
    });
  }
});
