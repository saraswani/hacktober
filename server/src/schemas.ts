import { z } from 'zod';

export const SingleJudgeResultSchema = z.object({
  verdict: z.string().default('INCONCLUSIVE'),
  score: z.number().min(0).max(100).default(50),
  confidence: z.number().min(0).max(100).default(50),
  reasoning: z.string().default(''),
  key_points: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([])
});

export type SingleJudgeResult = z.output<typeof SingleJudgeResultSchema>;

export const JudgeRoleEnum = z.enum(['skeptic', 'expert', 'beginner', 'verifier']);
export type JudgeRole = z.output<typeof JudgeRoleEnum>;

export const JudgeRoleResultSchema = z.object({
  role: JudgeRoleEnum,
  verdict: z.string().default('INCONCLUSIVE'),
  score: z.number().min(0).max(100).default(50),
  confidence: z.number().min(0).max(100).default(50),
  reasoning: z.string().default(''),
  key_points: z.array(z.string()).default([]),
  concerns: z.array(z.string()).default([]),
  available: z.boolean().default(true),
  error: z.string().optional()
});

export type JudgeRoleResult = z.output<typeof JudgeRoleResultSchema>;

export const DisagreementItemSchema = z.object({
  topic: z.string().default('Disagreement'),
  judges_involved: z.array(z.string()).default([]),
  description: z.string().default(''),
  resolution: z.string().default('')
});

export type DisagreementItem = z.output<typeof DisagreementItemSchema>;

export const ReliabilityAssessmentEnum = z.enum(['improved', 'unchanged', 'worse', 'uncertain']);
export type ReliabilityAssessment = z.output<typeof ReliabilityAssessmentEnum>;

export const ConsensusResultSchema = z.object({
  final_verdict: z.string().default('INCONCLUSIVE'),
  final_score: z.number().min(0).max(100).default(50),
  confidence: z.number().min(0).max(100).default(50),
  agreement_percent: z.number().min(0).max(100).default(0),
  summary: z.string().default(''),
  strongest_arguments: z.array(z.string()).default([]),
  disagreements: z.array(DisagreementItemSchema).default([]),
  decision: z.string().default(''),
  reliability_assessment: ReliabilityAssessmentEnum.default('uncertain')
});

export type ConsensusResult = z.output<typeof ConsensusResultSchema>;

export const ComparisonResultSchema = z.object({
  decisionChanged: z.boolean(),
  verdictComparison: z.string(),
  scoreDelta: z.number(),
  confidenceDelta: z.number(),
  explanation: z.string()
});

export type ComparisonResult = z.output<typeof ComparisonResultSchema>;

export const BenchmarkCaseSchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  input: z.string(),
  expectedEvaluation: z.string(),
  groundTruthVerdict: z.string(),
  expectedBenefit: z.enum(['improved', 'unchanged', 'worse']),
  explanation: z.string()
});

export type BenchmarkCase = z.output<typeof BenchmarkCaseSchema>;

export const BenchmarkCaseResultSchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  singleVerdict: z.string(),
  singleScore: z.number(),
  singleCorrect: z.boolean(),
  singleReasoning: z.string(),
  multiVerdict: z.string(),
  multiScore: z.number(),
  multiCorrect: z.boolean(),
  multiReasoning: z.string(),
  groundTruthVerdict: z.string(),
  outcome: z.enum(['improved', 'unchanged', 'worse']),
  analysis: z.string()
});

export type BenchmarkCaseResult = z.output<typeof BenchmarkCaseResultSchema>;

export const BenchmarkSummarySchema = z.object({
  totalCases: z.number(),
  singleAccuracy: z.number(),
  multiAccuracy: z.number(),
  improvementDelta: z.number(),
  casesImproved: z.number(),
  casesUnchanged: z.number(),
  casesWorse: z.number(),
  categoryBreakdown: z.record(z.object({
    total: z.number(),
    singleCorrect: z.number(),
    multiCorrect: z.number(),
    singleAccuracy: z.number(),
    multiAccuracy: z.number()
  })),
  caseResults: z.array(BenchmarkCaseResultSchema),
  executionDate: z.string()
});

export type BenchmarkSummary = z.output<typeof BenchmarkSummarySchema>;
