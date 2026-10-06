import { BENCHMARK_CASES } from '../data/benchmarkCases.js';
import {
  BenchmarkCase,
  BenchmarkCaseResult,
  BenchmarkSummary
} from '../schemas.js';
import { runSingleJudge } from './singleJudge.js';
import { runMultiJudge } from './multiJudge.js';
import { runConsensus } from './consensus.js';

let latestBenchmarkRun: BenchmarkSummary | null = null;

export function getLatestBenchmarkRun(): BenchmarkSummary | null {
  return latestBenchmarkRun;
}

export function setLatestBenchmarkRun(run: BenchmarkSummary) {
  latestBenchmarkRun = run;
}

/**
 * Calculates empirical summary statistics from benchmark case execution results
 */
export function calculateBenchmarkMetrics(caseResults: BenchmarkCaseResult[]): BenchmarkSummary {
  const totalCases = caseResults.length;
  if (totalCases === 0) {
    return {
      totalCases: 0,
      singleAccuracy: 0,
      multiAccuracy: 0,
      improvementDelta: 0,
      casesImproved: 0,
      casesUnchanged: 0,
      casesWorse: 0,
      categoryBreakdown: {},
      caseResults: [],
      executionDate: new Date().toISOString()
    };
  }

  const singleCorrectCount = caseResults.filter((r) => r.singleCorrect).length;
  const multiCorrectCount = caseResults.filter((r) => r.multiCorrect).length;

  const singleAccuracy = Math.round((singleCorrectCount / totalCases) * 1000) / 10;
  const multiAccuracy = Math.round((multiCorrectCount / totalCases) * 1000) / 10;
  const improvementDelta = Math.round((multiAccuracy - singleAccuracy) * 10) / 10;

  const casesImproved = caseResults.filter((r) => r.outcome === 'improved').length;
  const casesUnchanged = caseResults.filter((r) => r.outcome === 'unchanged').length;
  const casesWorse = caseResults.filter((r) => r.outcome === 'worse').length;

  // Compute breakdown by category
  const categoryBreakdown: BenchmarkSummary['categoryBreakdown'] = {};

  for (const item of caseResults) {
    if (!categoryBreakdown[item.category]) {
      categoryBreakdown[item.category] = {
        total: 0,
        singleCorrect: 0,
        multiCorrect: 0,
        singleAccuracy: 0,
        multiAccuracy: 0
      };
    }
    const cat = categoryBreakdown[item.category];
    cat.total += 1;
    if (item.singleCorrect) cat.singleCorrect += 1;
    if (item.multiCorrect) cat.multiCorrect += 1;
  }

  for (const catName of Object.keys(categoryBreakdown)) {
    const cat = categoryBreakdown[catName];
    cat.singleAccuracy = Math.round((cat.singleCorrect / cat.total) * 1000) / 10;
    cat.multiAccuracy = Math.round((cat.multiCorrect / cat.total) * 1000) / 10;
  }

  return {
    totalCases,
    singleAccuracy,
    multiAccuracy,
    improvementDelta,
    casesImproved,
    casesUnchanged,
    casesWorse,
    categoryBreakdown,
    caseResults,
    executionDate: new Date().toISOString()
  };
}

/**
 * Normalizes verdict strings for robust comparison with ground truth
 */
function normalizeVerdict(verdict: string): string {
  const v = verdict.toUpperCase().trim();
  if (v.includes('FAIL') || v.includes('REJECT') || v.includes('VULNERABLE')) return 'FAIL';
  if (v.includes('WARN')) return 'WARNING';
  if (v.includes('PASS') || v.includes('ACCEPT') || v.includes('CORRECT')) return 'PASS';
  return 'INCONCLUSIVE';
}

/**
 * Executes the benchmark suite across selected or all test cases
 */
export async function executeBenchmarkSuite(
  selectedIds?: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<BenchmarkSummary> {
  const casesToRun = selectedIds && selectedIds.length > 0
    ? BENCHMARK_CASES.filter((c) => selectedIds.includes(c.id))
    : BENCHMARK_CASES;

  const results: BenchmarkCaseResult[] = [];

  for (let i = 0; i < casesToRun.length; i++) {
    const c = casesToRun[i];

    // 1. Run single baseline
    const singleResult = await runSingleJudge(c.input);
    const normSingleVerdict = normalizeVerdict(singleResult.verdict);
    const normGroundTruth = normalizeVerdict(c.groundTruthVerdict);
    const singleCorrect = normSingleVerdict === normGroundTruth;

    // 2. Run multi-judge jury + consensus
    const { judges } = await runMultiJudge(c.input);
    const consensus = await runConsensus(c.input, judges);
    const normMultiVerdict = normalizeVerdict(consensus.final_verdict);
    const multiCorrect = normMultiVerdict === normGroundTruth;

    // 3. Determine outcome
    let outcome: 'improved' | 'unchanged' | 'worse' = 'unchanged';
    if (multiCorrect && !singleCorrect) {
      outcome = 'improved';
    } else if (!multiCorrect && singleCorrect) {
      outcome = 'worse';
    }

    let analysis = '';
    if (outcome === 'improved') {
      analysis = `Multi-judge caught critical factors (${consensus.summary}) where baseline failed.`;
    } else if (outcome === 'worse') {
      analysis = `Multi-judge over-analyzed or diverged on a sound input, deviating from reference.`;
    } else {
      analysis = `Both methods agreed with reference (${c.groundTruthVerdict}). Multi-agent added corroboration.`;
    }

    results.push({
      id: c.id,
      category: c.category,
      title: c.title,
      singleVerdict: singleResult.verdict,
      singleScore: singleResult.score,
      singleCorrect,
      singleReasoning: singleResult.reasoning,
      multiVerdict: consensus.final_verdict,
      multiScore: consensus.final_score,
      multiCorrect,
      multiReasoning: consensus.summary,
      groundTruthVerdict: c.groundTruthVerdict,
      outcome,
      analysis
    });

    if (onProgress) {
      onProgress(i + 1, casesToRun.length);
    }
  }

  const summary = calculateBenchmarkMetrics(results);
  latestBenchmarkRun = summary;
  return summary;
}
