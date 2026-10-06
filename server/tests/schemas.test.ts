import { describe, it, expect } from 'vitest';
import {
  SingleJudgeResultSchema,
  JudgeRoleResultSchema,
  ConsensusResultSchema,
  ComparisonResultSchema
} from '../src/schemas.js';

describe('Zod Schemas', () => {
  it('validates a valid SingleJudgeResult', () => {
    const valid = {
      verdict: 'PASS',
      score: 85,
      confidence: 90,
      reasoning: 'Code meets security guidelines.',
      key_points: ['No injection vulnerability found'],
      risks: ['Edge case on large payloads']
    };
    const parsed = SingleJudgeResultSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.score).toBe(85);
      expect(parsed.data.verdict).toBe('PASS');
    }
  });

  it('validates a valid JudgeRoleResult for Skeptic', () => {
    const valid = {
      role: 'skeptic',
      verdict: 'FAIL',
      score: 35,
      confidence: 88,
      reasoning: 'Missing input sanitization.',
      key_points: ['Direct string concatenation in query'],
      concerns: ['SQL injection hazard']
    };
    const parsed = JudgeRoleResultSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.role).toBe('skeptic');
      expect(parsed.data.verdict).toBe('FAIL');
    }
  });

  it('validates ConsensusResult', () => {
    const valid = {
      final_verdict: 'FAIL',
      final_score: 40,
      confidence: 92,
      agreement_percent: 75,
      summary: 'Skeptic revealed critical SQL vulnerability.',
      strongest_arguments: ['Direct SQL query injection unmitigated'],
      disagreements: [{
        topic: 'Sanitization',
        judges_involved: ['skeptic', 'expert'],
        description: 'Skeptic flagged injection, expert focused on index usage.',
        resolution: 'Skeptic security flaw takes precedence.'
      }],
      decision: 'Reject pull request.',
      reliability_assessment: 'improved'
    };
    const parsed = ConsensusResultSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('validates ComparisonResult', () => {
    const comparison = {
      decisionChanged: true,
      verdictComparison: 'Single: PASS -> Multi: FAIL',
      scoreDelta: -45,
      confidenceDelta: 12,
      explanation: 'Consensus overturned single model pass due to uncovered security flaw.'
    };
    const parsed = ComparisonResultSchema.safeParse(comparison);
    expect(parsed.success).toBe(true);
  });
});
