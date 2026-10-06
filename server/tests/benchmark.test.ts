import { describe, it, expect } from 'vitest';
import { calculateBenchmarkMetrics } from '../src/services/benchmark.js';
import { BenchmarkCaseResult } from '../src/schemas.js';

describe('calculateBenchmarkMetrics', () => {
  it('computes accurate metrics across mixed outcomes', () => {
    const mockCaseResults: BenchmarkCaseResult[] = [
      {
        id: 'CASE-01',
        category: 'Security',
        title: 'Timing attack',
        singleVerdict: 'PASS',
        singleScore: 85,
        singleCorrect: false,
        singleReasoning: 'Missed timing attack',
        multiVerdict: 'FAIL',
        multiScore: 30,
        multiCorrect: true,
        multiReasoning: 'Skeptic flagged timing attack',
        groundTruthVerdict: 'FAIL',
        outcome: 'improved',
        analysis: 'Multi-judge caught timing vulnerability missed by single model.'
      },
      {
        id: 'CASE-02',
        category: 'Simple Factual',
        title: 'Math conversion',
        singleVerdict: 'PASS',
        singleScore: 100,
        singleCorrect: true,
        singleReasoning: 'Correct math',
        multiVerdict: 'PASS',
        multiScore: 98,
        multiCorrect: true,
        multiReasoning: 'All judges agreed',
        groundTruthVerdict: 'PASS',
        outcome: 'unchanged',
        analysis: 'Both answered correctly; multi-judge added no extra accuracy.'
      },
      {
        id: 'CASE-03',
        category: 'Hidden Assumptions',
        title: 'TypeScript union',
        singleVerdict: 'PASS',
        singleScore: 90,
        singleCorrect: true,
        singleReasoning: 'Exhaustive union',
        multiVerdict: 'WARNING',
        multiScore: 60,
        multiCorrect: false,
        multiReasoning: 'Skeptic over-analyzed pattern',
        groundTruthVerdict: 'PASS',
        outcome: 'worse',
        analysis: 'Over-zealous skeptic introduced false warning.'
      }
    ];

    const summary = calculateBenchmarkMetrics(mockCaseResults);

    expect(summary.totalCases).toBe(3);
    // 2/3 single correct = 66.7%
    expect(summary.singleAccuracy).toBe(66.7);
    // 2/3 multi correct = 66.7%
    expect(summary.multiAccuracy).toBe(66.7);
    expect(summary.improvementDelta).toBe(0.0);
    expect(summary.casesImproved).toBe(1);
    expect(summary.casesUnchanged).toBe(1);
    expect(summary.casesWorse).toBe(1);
    expect(summary.categoryBreakdown['Security'].singleCorrect).toBe(0);
    expect(summary.categoryBreakdown['Security'].multiCorrect).toBe(1);
  });
});
