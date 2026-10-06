import { describe, it, expect } from 'vitest';
import { extractAndValidateJson } from '../src/gemini.js';
import { SingleJudgeResultSchema, JudgeRoleResultSchema } from '../src/schemas.js';

describe('extractAndValidateJson', () => {
  it('extracts JSON wrapped in markdown code fence', () => {
    const raw = '```json\n{\n  "verdict": "PASS",\n  "score": 90,\n  "confidence": 95,\n  "reasoning": "Looks solid",\n  "key_points": ["Clean"],\n  "risks": []\n}\n```';
    const result = extractAndValidateJson(raw, SingleJudgeResultSchema);
    expect(result.verdict).toBe('PASS');
    expect(result.score).toBe(90);
    expect(result.confidence).toBe(95);
  });

  it('extracts JSON surrounded by conversational prose', () => {
    const raw = 'Here is the requested output:\n{\n  "role": "skeptic",\n  "verdict": "FAIL",\n  "score": 20,\n  "confidence": 80,\n  "reasoning": "Bad syntax",\n  "key_points": [],\n  "concerns": ["Syntax error"]\n}\nHope this helps you with your analysis!';
    const result = extractAndValidateJson(raw, JudgeRoleResultSchema);
    expect(result.role).toBe('skeptic');
    expect(result.verdict).toBe('FAIL');
    expect(result.score).toBe(20);
  });

  it('tolerates string numbers and normalizes them', () => {
    const raw = '{\n  "verdict": "WARNING",\n  "score": "65",\n  "confidence": "70",\n  "reasoning": "Borderline",\n  "key_points": [],\n  "risks": []\n}';
    const result = extractAndValidateJson(raw, SingleJudgeResultSchema);
    expect(result.score).toBe(65);
    expect(result.confidence).toBe(70);
  });

  it('throws descriptive error on malformed unparseable text', () => {
    const raw = 'This is completely non-JSON text with no braces at all.';
    expect(() => extractAndValidateJson(raw, SingleJudgeResultSchema)).toThrow();
  });
});
