# VERDICT: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-grade, open-source multi-perspective AI reliability engine ("VERDICT") powered by Gemma 4 (`gemma-4-26b-a4b-it`), featuring an independent 4-judge jury, a consensus reconciliation engine, a 12-case empirical Evidence Lab benchmark dashboard, and side-by-side comparison.

**Architecture:** A decoupled monorepo containing a Node.js + Express + TypeScript backend (calling `@google/genai` with strict Zod validation, prompt isolation, and consensus arbitration) and a Vite + React + Tailwind CSS + Recharts dark-mode research workstation frontend.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Express, Node.js, `@google/genai`, Zod, Vitest / Supertest.

**Spec:** `docs/superpowers/specs/2026-10-06-verdict-design.md`

## Global Constraints
- Primary Model: `gemma-4-26b-a4b-it` via official `@google/genai` SDK.
- Security: `GEMINI_API_KEY` MUST exist on the server only (`process.env.GEMINI_API_KEY`). Never expose to client-side.
- The 4 judges must run independently in parallel with zero information sharing before consensus.
- Graceful degradation if an individual judge fails or if `GEMINI_API_KEY` is missing.
- No fake benchmark claims: Evidence Lab stats must be computed from actual runs against ground truth.
- Dark technical scientific aesthetic: Minimal, high contrast, subtle borders, no generic AI-slop gradients.

---

### Task 1: Project Scaffolding, Security Configuration, and Shared Schemas

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `server/src/types.ts`
- Create: `server/src/schemas.ts`
- Test: `server/tests/schemas.test.ts`

**Interfaces:**
- Produces: `SingleJudgeResultSchema`, `JudgeRoleResultSchema`, `ConsensusResultSchema`, `BenchmarkCaseSchema`, `BenchmarkRunResultSchema` and TypeScript types in `server/src/types.ts`.

- [ ] **Step 1: Write schema validation test**
```typescript
// server/tests/schemas.test.ts
import { describe, it, expect } from 'vitest';
import { SingleJudgeResultSchema, JudgeRoleResultSchema, ConsensusResultSchema } from '../src/schemas';

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
});
```

- [ ] **Step 2: Run test to verify it fails (files do not exist yet)**
Run: `npm test`
Expected: FAIL (missing files)

- [ ] **Step 3: Create root configs, `.gitignore`, `.env.example`, server/client scaffolding, and schemas**
Implement `package.json`, `.gitignore`, `.env.example`, `server/tsconfig.json`, `server/src/types.ts`, `server/src/schemas.ts`.

- [ ] **Step 4: Install dependencies and run tests to verify they pass**
Run: `cd server && npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: scaffold project, setup security configs, and define Zod schemas"
```

---

### Task 2: Gemini / Gemma 4 Service, JSON Repair, and Judge Prompts

**Files:**
- Create: `server/src/config.ts`
- Create: `server/src/gemini.ts`
- Create: `server/src/prompts.ts`
- Create: `server/src/services/singleJudge.ts`
- Create: `server/src/services/multiJudge.ts`
- Create: `server/src/services/consensus.ts`
- Test: `server/tests/geminiExtraction.test.ts`

**Interfaces:**
- Consumes: `SingleJudgeResultSchema`, `JudgeRoleResultSchema`, `ConsensusResultSchema`
- Produces:
  - `runSingleJudge(prompt: string, imageBase64?: string): Promise<SingleJudgeResult>`
  - `runMultiJudge(prompt: string, imageBase64?: string): Promise<MultiJudgeRun>`
  - `runConsensus(prompt: string, judges: JudgeRoleResult[]): Promise<ConsensusResult>`

- [ ] **Step 1: Write test for JSON extraction and resilience**
```typescript
// server/tests/geminiExtraction.test.ts
import { describe, it, expect } from 'vitest';
import { extractAndValidateJson } from '../src/gemini';
import { SingleJudgeResultSchema } from '../src/schemas';

describe('extractAndValidateJson', () => {
  it('extracts JSON wrapped in markdown code fence', () => {
    const raw = '```json\n{"verdict":"PASS","score":90,"confidence":95,"reasoning":"Looks solid","key_points":[],"risks":[]}\n```';
    const result = extractAndValidateJson(raw, SingleJudgeResultSchema);
    expect(result.verdict).toBe('PASS');
    expect(result.score).toBe(90);
  });

  it('extracts JSON surrounded by conversational prose', () => {
    const raw = 'Here is the requested output:\n{"verdict":"FAIL","score":20,"confidence":80,"reasoning":"Bad syntax","key_points":[],"risks":[]}\nHope this helps!';
    const result = extractAndValidateJson(raw, SingleJudgeResultSchema);
    expect(result.verdict).toBe('FAIL');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd server && npm test geminiExtraction.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `config.ts`, `gemini.ts`, `prompts.ts`, `singleJudge.ts`, `multiJudge.ts`, `consensus.ts`**
Implement the Gemma 4 client wrapper, prompt strings for the 4 distinct roles (Skeptic, Domain Expert, Beginner, Verifier) ensuring prompt isolation, and the Consensus Judge prompt. Ensure `extractAndValidateJson` handles Markdown fences, whitespace, and Zod parsing.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd server && npm test geminiExtraction.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/
git commit -m "feat: implement Gemma 4 service, prompts, and resilient JSON extraction"
```

---

### Task 3: Express Backend API Routes and Fault Tolerance

**Files:**
- Create: `server/src/routes/health.ts`
- Create: `server/src/routes/judge.ts`
- Create: `server/src/index.ts`
- Test: `server/tests/api.test.ts`

**Interfaces:**
- Consumes: `runSingleJudge`, `runMultiJudge`, `runConsensus`
- Produces:
  - `GET /api/health` -> `{ status: "ok", apiKeyConfigured: boolean, model: string }`
  - `POST /api/judge/single` -> `SingleJudgeResult`
  - `POST /api/judge/multi` -> `{ judges: JudgeRoleResult[], consensus: ConsensusResult }`
  - `POST /api/judge/both` -> `{ single: SingleJudgeResult, multi: { judges: JudgeRoleResult[], consensus: ConsensusResult }, comparison: ComparisonResult }`

- [ ] **Step 1: Write integration tests for API routes**
```typescript
// server/tests/api.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

describe('Express API Routes', () => {
  it('GET /api/health returns health status and model info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('model', 'gemma-4-26b-a4b-it');
    expect(res.body).toHaveProperty('apiKeyConfigured');
  });

  it('POST /api/judge/single rejects missing prompt', async () => {
    const res = await request(app).post('/api/judge/single').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd server && npm test api.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Express app and routes**
Implement `routes/health.ts`, `routes/judge.ts`, and `index.ts`. Add graceful degradation: if `GEMINI_API_KEY` is missing, return HTTP 503 with clean configuration instructions instead of an unhandled crash. If 1 judge fails during multi-judge execution, aggregate the remaining judges and report `status: "unavailable"` for the failed judge.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd server && npm test api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/
git commit -m "feat: implement Express routes, health check, and error resilience"
```

---

### Task 4: Evidence Lab Benchmark Dataset and Evaluation Engine

**Files:**
- Create: `server/src/data/benchmarkCases.ts`
- Create: `server/src/services/benchmark.ts`
- Create: `server/src/routes/benchmark.ts`
- Test: `server/tests/benchmark.test.ts`

**Interfaces:**
- Produces:
  - `BENCHMARK_CASES`: Array of 12 structured cases with IDs, categories, inputs, expected evaluations, and ground truths.
  - `calculateBenchmarkMetrics(results)`: Computes single accuracy, multi accuracy, net improvement delta, improved/unchanged/worse breakdown.
  - `GET /api/benchmark/cases`
  - `POST /api/benchmark/run`

- [ ] **Step 1: Write test for benchmark metrics calculation**
```typescript
// server/tests/benchmark.test.ts
import { describe, it, expect } from 'vitest';
import { calculateBenchmarkMetrics, BenchmarkCaseResult } from '../src/services/benchmark';

describe('calculateBenchmarkMetrics', () => {
  it('computes correct accuracy and delta across cases', () => {
    const mockResults: BenchmarkCaseResult[] = [
      { id: 'CASE-01', singleCorrect: false, multiCorrect: true, category: 'Security' },
      { id: 'CASE-02', singleCorrect: true, multiCorrect: true, category: 'Code Review' },
      { id: 'CASE-03', singleCorrect: true, multiCorrect: false, category: 'Edge Cases' }
    ];
    const metrics = calculateBenchmarkMetrics(mockResults);
    expect(metrics.singleAccuracy).toBe(66.7);
    expect(metrics.multiAccuracy).toBe(66.7);
    expect(metrics.casesImproved).toBe(1);
    expect(metrics.casesUnchanged).toBe(1);
    expect(metrics.casesWorse).toBe(1);
    expect(metrics.improvementDelta).toBe(0.0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd server && npm test benchmark.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement 12 benchmark cases, runner, metrics calculation, and route**
Implement `data/benchmarkCases.ts` with 12 rigorous test cases spanning Ambiguous reasoning, Security, Code review, Accessibility, Factual reasoning, Hidden assumptions, Contradictory information, Edge cases, Simple factual questions, Straightforward tasks, and Image/Multimodal analysis. Implement `benchmark.ts` and `routes/benchmark.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd server && npm test benchmark.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/
git commit -m "feat: implement 12-case benchmark suite and metrics engine"
```

---

### Task 5: Frontend Design System, Navigation, and System Status

**Files:**
- Create: `client/src/index.css`
- Create: `client/src/types.ts`
- Create: `client/src/components/Header.tsx`
- Create: `client/src/components/Navigation.tsx`
- Create: `client/src/components/SystemStatus.tsx`
- Create: `client/src/App.tsx`
- Test: `client/src/App.test.tsx`

**Interfaces:**
- Produces: Main responsive dark layout shell, navigation switching between `Judge`, `Jury Room`, and `Evidence Lab`, live system health indicator.

- [ ] **Step 1: Write test for navigation and layout rendering**
```typescript
// client/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Layout', () => {
  it('renders title, tagline, and navigation tabs', () => {
    render(<App />);
    expect(screen.getByText(/VERDICT/i)).toBeDefined();
    expect(screen.getByText(/When one AI isn't enough, ask a jury/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Judge/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Jury Room/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Evidence Lab/i })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd client && npm test`
Expected: FAIL

- [ ] **Step 3: Implement CSS styling tokens, Header, Navigation, and App shell**
Set up Tailwind with Slate/Obsidian dark palette (`#080b11`, `#0d131f`, `#1e293b`), role colors, Inter font, header branding, tagline, health status banner (showing API status & Gemma 4 readiness).

- [ ] **Step 4: Run test to verify it passes**
Run: `cd client && npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add client/
git commit -m "feat: implement dark technical UI design system and navigation"
```

---

### Task 6: Frontend Judge View with Side-by-Side Comparison and Demo Loader

**Files:**
- Create: `client/src/components/JudgeInput.tsx`
- Create: `client/src/components/ExecutionPipelineStepper.tsx`
- Create: `client/src/components/SideBySideComparison.tsx`
- Create: `client/src/views/JudgeView.tsx`
- Create: `client/src/data/demoPresets.ts`

**Interfaces:**
- Produces:
  - Textarea + image upload input.
  - 3 instant demo presets: (1) Security/SQL injection, (2) Ambiguous autonomous dilemma, (3) Simple factual question.
  - Buttons: `[ Run Single Model ]`, `[ Run Multi-Judge ]`, `[ Run Both ]` (highlighted primary CTA).
  - 7-stage live execution stepper (`Baseline` -> `Skeptic` -> `Expert` -> `Beginner` -> `Verifier` -> `Consensus` -> `Verdict`).
  - Side-by-side comparison highlighting score delta, verdict divergence, and reliability analysis.

- [ ] **Step 1: Write component unit test for JudgeView**
```typescript
// client/src/views/JudgeView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import JudgeView from './JudgeView';
import { describe, it, expect, vi } from 'vitest';

describe('JudgeView', () => {
  it('renders action buttons and demo selector', () => {
    render(<JudgeView onRunBoth={vi.fn()} onRunSingle={vi.fn()} onRunMulti={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Run Both/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Run Single Model/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Run Multi-Judge/i })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd client && npm test JudgeView.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement JudgeView, DemoPresets, Stepper, and SideBySideComparison**
Write components with clean feedback, error handling for missing API keys or network errors, and animated stepper.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd client && npm test JudgeView.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add client/
git commit -m "feat: implement Judge view, demo presets, execution stepper, and side-by-side comparison"
```

---

### Task 7: Frontend Jury Room View with Disagreement Matrix and Consensus Banner

**Files:**
- Create: `client/src/components/JudgeCard.tsx`
- Create: `client/src/components/DisagreementAlert.tsx`
- Create: `client/src/components/ConsensusBanner.tsx`
- Create: `client/src/views/JuryRoomView.tsx`

**Interfaces:**
- Produces:
  - 4 cards representing Skeptic, Domain Expert, Beginner, Verifier with individual scores, confidence, verdicts, key concerns, and reasoning.
  - Disagreement Alert callout box highlighting exact splits (e.g., 2 FAIL vs 2 PASS) and explaining the tension.
  - Large Consensus Banner with final synthesized score, confidence, agreement progress bar (`████████░░ 75%`), and strongest arguments.

- [ ] **Step 1: Write test for JuryRoomView and DisagreementAlert**
```typescript
// client/src/views/JuryRoomView.test.tsx
import { render, screen } from '@testing-library/react';
import JuryRoomView from './JuryRoomView';
import { describe, it, expect } from 'vitest';

describe('JuryRoomView', () => {
  it('displays disagreement alert when judges split on verdict', () => {
    const mockJudges = [
      { role: 'skeptic', verdict: 'FAIL', score: 30, confidence: 90, reasoning: 'Security flaw', key_points: [], concerns: ['SQL injection'] },
      { role: 'expert', verdict: 'PASS', score: 85, confidence: 85, reasoning: 'Clean code', key_points: [], concerns: [] },
      { role: 'beginner', verdict: 'PASS', score: 90, confidence: 80, reasoning: 'Clear code', key_points: [], concerns: [] },
      { role: 'verifier', verdict: 'FAIL', score: 40, confidence: 95, reasoning: 'Unsanitized input', key_points: [], concerns: ['Vuln exists'] }
    ];
    const mockConsensus = {
      final_verdict: 'FAIL',
      final_score: 45,
      confidence: 90,
      agreement_percent: 50,
      summary: 'Security vulnerability flagged.',
      strongest_arguments: ['SQL injection risk'],
      disagreements: [{ topic: 'Security', judges_involved: ['skeptic', 'verifier'], description: 'Split on safety', resolution: 'Prioritize security' }],
      decision: 'Reject',
      reliability_assessment: 'improved'
    };
    render(<JuryRoomView judges={mockJudges} consensus={mockConsensus} />);
    expect(screen.getByText(/Disagreement Detected/i)).toBeDefined();
    expect(screen.getByText(/Skeptic/i)).toBeDefined();
    expect(screen.getByText(/Domain Expert/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd client && npm test JuryRoomView.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement JudgeCard, DisagreementAlert, ConsensusBanner, and JuryRoomView**
Build high-contrast role-specific cards with animated agreement bar and explicit tension highlights.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd client && npm test JuryRoomView.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add client/
git commit -m "feat: implement Jury Room view, judge cards, disagreement alert, and consensus banner"
```

---

### Task 8: Frontend Evidence Lab Dashboard with Recharts Visualizations & Case Studies

**Files:**
- Create: `client/src/components/BenchmarkKpiCards.tsx`
- Create: `client/src/components/BenchmarkCharts.tsx`
- Create: `client/src/components/CaseStudyCard.tsx`
- Create: `client/src/components/BenchmarkTable.tsx`
- Create: `client/src/views/EvidenceLabView.tsx`

**Interfaces:**
- Produces:
  - Top KPI cards: Single Accuracy, Multi-Judge Accuracy, Net Improvement Delta, Improved / Unchanged / Worse count.
  - Recharts visualizations: Accuracy comparison bar chart, category breakdown bar chart.
  - Qualitative Deep Dives:
    - *Where Multi-Judge Helped*
    - *Where Multi-Judge Did Not Help*
    - *Where Multi-Judge Was Worse*
  - Filterable 12-case table with ground truth comparison.
  - `[ Run Benchmark ]` live trigger with progress indicator.

- [ ] **Step 1: Write test for EvidenceLabView**
```typescript
// client/src/views/EvidenceLabView.test.tsx
import { render, screen } from '@testing-library/react';
import EvidenceLabView from './EvidenceLabView';
import { describe, it, expect } from 'vitest';

describe('EvidenceLabView', () => {
  it('renders benchmark execution prompt or results', () => {
    render(<EvidenceLabView benchmarkData={null} onRunBenchmark={() => {}} isRunning={false} />);
    expect(screen.getByText(/Evidence Lab/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Run Benchmark/i })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd client && npm test EvidenceLabView.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement EvidenceLabView, KPI cards, Recharts visualizations, CaseStudyCard, and BenchmarkTable**
Build rich interactive dashboard with realistic mock fallback preview when benchmark has not been run, live runner, and honest deep-dive sections.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd client && npm test EvidenceLabView.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add client/
git commit -m "feat: implement Evidence Lab dashboard, Recharts charts, and honest case studies"
```

---

### Task 9: Comprehensive Open-Source Documentation, AI Disclosure, and Verification

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Modify: `package.json` (root build & dev scripts)

**Interfaces:**
- Produces: Full documentation matching all hackathon requirements, clear AI tools disclosure, reproduction commands, and clean build.

- [ ] **Step 1: Write comprehensive `README.md`**
Include:
- Project Title & Tagline
- Problem Statement & Why Single Models Fail
- The Multi-Judge & Consensus Architecture
- The 4 Judges and their Cognitive Functions
- Evidence Lab Benchmark Methodology
- Where Multi-Judge Helps vs Where It Does Not Help vs Where It Was Worse
- Development Tools & AI Assistance Disclosure (Antigravity IDE & Gemma 4)
- Setup instructions, `.env` guide, and running commands
- Screenshots / UI Walkthrough

- [ ] **Step 2: Execute root build and typecheck**
Run: `npm run build`
Expected: Clean build with zero TypeScript or bundler errors in both server and client.

- [ ] **Step 3: Verify `.env` is ignored and no API keys leaked in client bundles**
Run: `git status --ignored` and check client bundle for `GEMINI_API_KEY`.
Expected: `.env` ignored, client bundle contains zero references to private API keys.

- [ ] **Step 4: Commit**
```bash
git add README.md LICENSE package.json
git commit -m "docs: complete open-source documentation, AI tools disclosure, and build verification"
```
