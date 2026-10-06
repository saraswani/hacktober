import { Router, Request, Response } from 'express';
import { BENCHMARK_CASES } from '../data/benchmarkCases.js';
import {
  executeBenchmarkSuite,
  getLatestBenchmarkRun
} from '../services/benchmark.js';
import { config } from '../config.js';

export const benchmarkRouter = Router();

/**
 * GET /api/benchmark/cases
 * Returns all 12 test cases in the benchmark suite
 */
benchmarkRouter.get('/cases', (_req: Request, res: Response) => {
  res.json({
    total: BENCHMARK_CASES.length,
    cases: BENCHMARK_CASES
  });
});

/**
 * GET /api/benchmark/latest
 * Returns the most recent benchmark execution summary (or null if not run yet)
 */
benchmarkRouter.get('/latest', (_req: Request, res: Response) => {
  const latest = getLatestBenchmarkRun();
  res.json({
    hasRun: latest !== null,
    run: latest
  });
});

/**
 * POST /api/benchmark/run
 * Executes live benchmark comparison of Single vs Multi-Judge Gemma 4
 */
benchmarkRouter.post('/run', async (req: Request, res: Response) => {
  if (!config.isApiKeyConfigured) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      code: 'MISSING_API_KEY',
      instructions:
        'To execute the empirical benchmark, please supply a GEMINI_API_KEY in server/.env.'
    });
  }

  try {
    const { caseIds } = req.body;
    const summary = await executeBenchmarkSuite(caseIds);
    res.json(summary);
  } catch (error: any) {
    console.error('Error executing benchmark suite:', error);
    res.status(500).json({
      error: 'Benchmark execution failed.',
      message: error?.message || 'Internal server error'
    });
  }
});
