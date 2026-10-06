export interface SingleJudgeResult {
  verdict: string;
  score: number;
  confidence: number;
  reasoning: string;
  key_points: string[];
  risks: string[];
}

export type JudgeRole = 'skeptic' | 'expert' | 'beginner' | 'verifier';

export interface JudgeRoleResult {
  role: JudgeRole;
  verdict: string;
  score: number;
  confidence: number;
  reasoning: string;
  key_points: string[];
  concerns: string[];
  available: boolean;
  error?: string;
}

export interface DisagreementItem {
  topic: string;
  judges_involved: string[];
  description: string;
  resolution: string;
}

export interface ConsensusResult {
  final_verdict: string;
  final_score: number;
  confidence: number;
  agreement_percent: number;
  summary: string;
  strongest_arguments: string[];
  disagreements: DisagreementItem[];
  decision: string;
  reliability_assessment: 'improved' | 'unchanged' | 'worse' | 'uncertain';
}

export interface ComparisonResult {
  decisionChanged: boolean;
  verdictComparison: string;
  scoreDelta: number;
  confidenceDelta: number;
  explanation: string;
}

export interface MultiJudgeResponse {
  judges: JudgeRoleResult[];
  consensus: ConsensusResult;
  availableJudgesCount: number;
  totalJudgesCount: number;
}

export interface BothRunResponse {
  single: SingleJudgeResult;
  multi: MultiJudgeResponse;
  comparison: ComparisonResult;
}

export interface BenchmarkCase {
  id: string;
  category: string;
  title: string;
  input: string;
  expectedEvaluation: string;
  groundTruthVerdict: string;
  expectedBenefit: 'improved' | 'unchanged' | 'worse';
  explanation: string;
}

export interface BenchmarkCaseResult {
  id: string;
  category: string;
  title: string;
  singleVerdict: string;
  singleScore: number;
  singleCorrect: boolean;
  singleReasoning: string;
  multiVerdict: string;
  multiScore: number;
  multiCorrect: boolean;
  multiReasoning: string;
  groundTruthVerdict: string;
  outcome: 'improved' | 'unchanged' | 'worse';
  analysis: string;
}

export interface BenchmarkSummary {
  totalCases: number;
  singleAccuracy: number;
  multiAccuracy: number;
  improvementDelta: number;
  casesImproved: number;
  casesUnchanged: number;
  casesWorse: number;
  categoryBreakdown: Record<
    string,
    {
      total: number;
      singleCorrect: number;
      multiCorrect: number;
      singleAccuracy: number;
      multiAccuracy: number;
    }
  >;
  caseResults: BenchmarkCaseResult[];
  executionDate: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  model: string;
  apiKeyConfigured: boolean;
  setupGuide: string;
}
