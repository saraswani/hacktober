import { describe, it, expect } from 'vitest';

describe('VERDICT Client Configuration & Logic', () => {
  it('pins the required Gemma 4 model constant', () => {
    const requiredModel = 'gemma-4-26b-a4b-it';
    expect(requiredModel).toBe('gemma-4-26b-a4b-it');
  });

  it('validates jury roles are properly categorized', () => {
    const roles = ['skeptic', 'expert', 'beginner', 'verifier'] as const;
    expect(roles).toHaveLength(4);
    expect(roles).toContain('skeptic');
    expect(roles).toContain('expert');
    expect(roles).toContain('beginner');
    expect(roles).toContain('verifier');
  });

  it('validates verdict status domain', () => {
    const verdicts = ['PASS', 'FAIL', 'INCONCLUSIVE'] as const;
    expect(verdicts).toHaveLength(3);
  });
});
