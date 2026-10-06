export * from './schemas.js';

export interface EvaluateRequest {
  prompt: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface MultiJudgeResponse {
  judges: import('./schemas.js').JudgeRoleResult[];
  consensus: import('./schemas.js').ConsensusResult;
  availableJudgesCount: number;
}

export interface BothRunResponse {
  single: import('./schemas.js').SingleJudgeResult;
  multi: MultiJudgeResponse;
  comparison: import('./schemas.js').ComparisonResult;
}
