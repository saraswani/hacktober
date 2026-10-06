# VERDICT: System Design Specification

> *"When one AI isn't enough, ask a jury."*

An evidence-driven multi-perspective AI reliability engine powered by Google's Gemma 4 (`gemma-4-26b-a4b-it`).

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
A single AI model prompt execution is prone to unspotted hallucinations, blind assumptions, domain-specific oversights, and overconfidence. Lightweight, high-throughput models like Gemma 4 make it viable to approach complex problems from multiple distinct cognitive perspectives simultaneously.

### 1.2 The Solution: VERDICT
VERDICT constructs an adversarial and multi-role "jury" of four independent Gemma 4 instances:
1. **Skeptic**: Probes aggressively for flaws, edge cases, vulnerabilities, and unjustified assumptions.
2. **Domain Expert**: Analyzes technical depth, domain accuracy, formal correctness, and industry standards.
3. **Beginner**: Evaluates comprehensibility, practical usability, and clarity for non-specialists.
4. **Verifier**: Audits factual claims, logical consistency, and evidentiary backing.

A fifth instance acts as the **Consensus Judge**, reconciling disagreements, highlighting tensions, and synthesizing an accountable final verdict.

Crucially, VERDICT includes an **Evidence Lab** benchmark harness running 12 real-world test cases across diverse domains to empirically measure where multi-judge consensus outperforms a single model, where it performs equally, and where it may introduce unwarranted disagreement.

---

## 2. System Architecture

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT (Vite + React)                            |
|                                                                                   |
|  +--------------------+   +------------------------+   +-----------------------+  |
|  |     JUDGE VIEW     |   |     JURY ROOM VIEW     |   |   EVIDENCE LAB VIEW   |  |
|  | Single vs Multi-   |   | 4-Role Cards, Tension  |   | 12 Benchmark Cases,   |  |
|  | Judge Comparison   |   | Matrix, Consensus Bar  |   | Live Stats & Charts   |  |
|  +--------------------+   +------------------------+   +-----------------------+  |
|                                     |                                             |
+-------------------------------------|---------------------------------------------+
                                      | HTTP REST / JSON
+-------------------------------------v---------------------------------------------+
|                                SERVER (Express + Node.js)                         |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Routes: /api/judge/single, /api/judge/multi, /api/judge/both,               |  |
|  |         /api/benchmark/cases, /api/benchmark/run, /api/health              |  |
|  +-----------------------------------------------------------------------------+  |
|  | Controllers & Services:                                                     |  |
|  |  * SingleJudgeService                                                       |  |
|  |  * MultiJudgeService (Parallel isolated dispatch -> Promise.allSettled)     |  |
|  |  * ConsensusReconciler                                                      |  |
|  |  * BenchmarkEngine                                                          |  |
|  |  * Zod Response Validation & Repair Pipeline                                |  |
|  +-----------------------------------------------------------------------------+  |
|                                     |                                             |
|                                     | @google/genai SDK                           |
|                                     v                                             |
|                     Google Gemini API / Gemma 4 Engine                            |
|                     Model: gemma-4-26b-a4b-it                                     |
+-----------------------------------------------------------------------------------+
```

---

## 3. Core AI Engine & Prompts

### 3.1 Model Configuration
- **Primary Model**: `gemma-4-26b-a4b-it`
- **SDK**: Official `@google/genai` (`GoogleGenAI`)
- **Key Safety & Isolation**: `GEMINI_API_KEY` stored exclusively on the server in `.env`.

### 3.2 Single Model Baseline Prompt
Neutral persona instructed to evaluate the given text/image and output strict JSON:
```json
{
  "verdict": "PASS | FAIL | WARNING | INCONCLUSIVE",
  "score": 0-100,
  "confidence": 0-100,
  "reasoning": "string",
  "key_points": ["string"],
  "risks": ["string"]
}
```

### 3.3 The Four Independent Judges
Judges are queried in parallel via `Promise.allSettled`. Under **no circumstances** do judges share state or see each other's outputs.

Each judge produces:
```json
{
  "role": "skeptic | expert | beginner | verifier",
  "verdict": "PASS | FAIL | WARNING | INCONCLUSIVE",
  "score": 0-100,
  "confidence": 0-100,
  "reasoning": "string",
  "key_points": ["string"],
  "concerns": ["string"]
}
```

#### Roles:
1. **Skeptic** (`role: "skeptic"`):
   - *Prompt directive*: "Adopt the mindset of a ruthless critic, security auditor, and devil's advocate. Search relentlessly for unstated assumptions, subtle bugs, edge cases, security hazards, and logical leaps. Give low scores if any vulnerability or assumption exists."
2. **Domain Expert** (`role: "expert"`):
   - *Prompt directive*: "Adopt the mindset of a seasoned principal engineer and domain authority. Evaluate algorithmic correctness, architectural standards, idiomatic practices, and domain-specific precision."
3. **Beginner** (`role: "beginner"`):
   - *Prompt directive*: "Adopt the mindset of an end user or junior engineer. Evaluate whether the concept is intuitive, clear, free of unnecessary jargon, and safe for someone without deep domain knowledge."
4. **Verifier** (`role: "verifier"`):
   - *Prompt directive*: "Adopt the mindset of a formal logic verifier and fact checker. Audit every premise, ensure the conclusion is strictly entailed by the evidence, and verify claims for accuracy."

### 3.4 Consensus / Reconciliation Judge
The consensus prompt receives:
- Original input (and image description if present)
- The structured responses of all available judges (1 to 4)

It returns:
```json
{
  "final_verdict": "PASS | FAIL | WARNING | INCONCLUSIVE",
  "final_score": 0-100,
  "confidence": 0-100,
  "agreement_percent": 0-100,
  "summary": "string",
  "strongest_arguments": ["string"],
  "disagreements": [
    {
      "topic": "string",
      "judges_involved": ["skeptic", "expert"],
      "description": "string",
      "resolution": "string"
    }
  ],
  "decision": "string",
  "reliability_assessment": "improved | unchanged | worse | uncertain"
}
```

Consensus rules:
- No mechanical mathematical averaging. If the Skeptic identifies a critical SQL injection or zero-day that the Beginner missed, the Consensus must prioritize the critical finding over majority headcount.
- Clear identification of tensions: flags when judges diverge and explains why.

---

## 4. Backend Architecture & API Contracts

### 4.1 Server Directory Structure
```
server/
  ├── src/
  │   ├── config.ts              # Env vars & configuration
  │   ├── gemini.ts              # @google/genai client setup
  │   ├── types.ts               # Shared TypeScript interfaces
  │   ├── schemas.ts             # Zod validation schemas
  │   ├── services/
  │   │   ├── singleJudge.ts     # Baseline Gemma 4 execution
  │   │   ├── multiJudge.ts      # 4-role parallel dispatch
  │   │   ├── consensus.ts       # Reconciliation engine
  │   │   └── benchmark.ts       # Benchmark suite & evaluation
  │   ├── data/
  │   │   └── benchmarkCases.ts  # 12 diverse test cases with ground truth
  │   ├── routes/
  │   │   ├── judge.ts           # /api/judge routes
  │   │   ├── benchmark.ts       # /api/benchmark routes
  │   │   └── health.ts          # /api/health
  │   └── index.ts               # Express application entrypoint
  ├── package.json
  └── tsconfig.json
```

### 4.2 Endpoints
- `GET /api/health`: Returns `{ status: "ok", apiKeyConfigured: boolean, model: "gemma-4-26b-a4b-it" }`.
- `POST /api/judge/single`: Accepts `{ prompt: string, imageBase64?: string }`, returns `SingleJudgeResult`.
- `POST /api/judge/multi`: Accepts `{ prompt: string, imageBase64?: string }`, returns `{ judges: JudgeResult[], consensus: ConsensusResult }`.
- `POST /api/judge/both`: Accepts `{ prompt: string, imageBase64?: string }`, runs baseline and multi-judge in parallel, computes comparative delta and explanation.
- `GET /api/benchmark/cases`: Returns the 12 benchmark cases.
- `POST /api/benchmark/run`: Accepts `{ caseIds?: string[] }`, executes single and multi-judge for each case against reference ground truth, calculates empirical metrics, returns comprehensive report.

### 4.3 Resilience & Fallbacks
- **Zod Validation**: Validates all JSON model outputs.
- **Markdown / JSON Extraction**: Extracts JSON if wrapped in markdown code blocks (` ```json ... ``` `) or raw strings.
- **Graceful Judge Failure**: If 1 judge fails (e.g. rate limit), the pipeline aggregates the remaining 3 judges, marks the failed judge as `status: "unavailable"`, and informs consensus.
- **Missing API Key Mode**: If `GEMINI_API_KEY` is not set, API returns a 503 with a structured config guidance payload, which frontend renders cleanly with setup instructions.

---

## 5. Frontend Architecture & Design Specification

### 5.1 Design System & Aesthetic
- **Theme**: Dark Technical Research Workstation.
- **Palette**:
  - Background: `#080b11` (Deep Obsidian), `#0d131f` (Card Surface)
  - Borders: `#1e293b` (Subtle Slate Slate-800)
  - Text: `#f8fafc` (Primary White), `#94a3b8` (Muted Slate-400)
  - Roles:
    - Skeptic: Rose/Crimson (`#f43f5e`)
    - Domain Expert: Amber/Gold (`#f59e0b`)
    - Beginner: Sky/Cyan (`#0ea5e9`)
    - Verifier: Emerald (`#10b981`)
    - Consensus: Violet (`#8b5cf6`)
- **Typography**: Inter / Outfit sans-serif with monospace accents for code and verdicts.
- **No AI-slop**: No generic neon purple gradients, no random 3D canvas blobs; clean, dense, high-signal UI.

### 5.2 Key Views
1. **Header / Navigation**:
   - Branding: VERDICT with tagline *"When one AI isn't enough, ask a jury."*
   - Nav links: `[ Judge ]`, `[ Jury Room ]`, `[ Evidence Lab ]`
   - System Status: Live pill indicator showing API connection & Gemma 4 status.
2. **Page 1: JUDGE**:
   - Input textarea with character count, file upload dropzone for optional images.
   - Demo Quick-Loaders (3 presets):
     1. *Security Audit*: SQL injection / Race condition in auth handler.
     2. *Ambiguous Reasoning*: Autonomous driving safety vs efficiency edge-case.
     3. *Simple Factual*: Standard straightforward conversion / arithmetic.
   - Action controls: `[ Run Single Model ]`, `[ Run Multi-Judge ]`, `[ Run Both (Compare) ]` (accentuated).
   - Real-time 7-stage progress stepper:
     `Baseline` → `Skeptic` → `Expert` → `Beginner` → `Verifier` → `Consensus` → `Verdict`.
   - Side-by-Side Comparison: Single vs Multi-Judge cards highlighting:
     - Score delta (`68` vs `88`)
     - Verdict flip (`PASS` vs `FAIL`)
     - Reliability Assessment banner explaining *why* the jury arrived at a superior conclusion.
3. **Page 2: JURY ROOM**:
   - 4 Role Cards in a 2x2 or 4-column responsive grid:
     - Persona icon + Role tag
     - Verdict badge (PASS / FAIL / WARNING / INCONCLUSIVE)
     - Score gauge & Confidence bar
     - Key Concern highlight callout
     - Full reasoning collapsible
   - **Disagreement Analysis Alert**: High-contrast alert box appearing whenever any judge diverges from the group. Visual breakdown of judge stances (e.g. Skeptic & Verifier: FAIL vs Expert & Beginner: PASS).
   - **Consensus Banner**:
     - Large final verdict and synthesized score.
     - Agreement progress bar (`████████░░ 75% agreement`).
     - Strongest arguments synthesis & reconciliation rationale.
4. **Page 3: EVIDENCE LAB**:
   - Empirical Benchmark Dashboard based on real runs of the 12-case test suite.
   - Top KPI Cards:
     - Baseline Accuracy (`%`)
     - Multi-Judge Accuracy (`%`)
     - Net Reliability Delta (`+X percentage points`)
     - Cases Improved / Cases Unchanged / Cases Worse
   - Interactive Recharts Visualizations:
     - Accuracy comparison by category (Bar chart)
     - Verdict outcome distribution (Single vs Multi)
   - Honest Real-World Case Studies:
     - **Where Multi-Judge Helped**: Case #04 (Skeptic exposed hidden concurrency flaw).
     - **Where Multi-Judge Did Not Help**: Case #09 (Simple query where extra perspectives added latency without benefit).
     - **Where Multi-Judge Was Worse**: Case #11 (Over-skepticism resulted in false warning on valid pattern).
   - Full 12-case filterable interactive table with ground truth comparison.

---

## 6. Benchmark Suite (12 Test Cases)

1. `CASE-01` (Security): Timing attack vulnerability in password comparison.
2. `CASE-02` (Code Review): Memory leak in React `useEffect` without cleanup.
3. `CASE-03` (Ambiguous Reasoning): Self-driving trolley dilemma with incomplete sensor data.
4. `CASE-04` (Hidden Assumptions): Currency exchange calculation assuming static rates.
5. `CASE-05` (Accessibility): Low-contrast button with missing ARIA labels.
6. `CASE-06` (Factual Reasoning): Logical fallacy in marketing claims.
7. `CASE-07` (Contradictory Information): Medical symptom checker with contradictory timeline.
8. `CASE-08` (Edge Cases): Leap second handling in UTC timestamp parser.
9. `CASE-09` (Simple Factual): Converting Celsius to Fahrenheit (Baseline works perfectly).
10. `CASE-10` (Straightforward Task): Reverse words in a string (Baseline works perfectly).
11. `CASE-11` (Excessive Skepticism Vulnerable): Standard idiomatic TypeScript pattern falsely flagged as complex.
12. `CASE-12` (Multimodal/Image Analysis): Chart with truncated Y-axis misleading data interpretation.

---

## 7. Open-Source, Security & AI Disclosure

1. **Security**:
   - `GEMINI_API_KEY` never present in client builds or git commits.
   - `.env.example` created.
   - `.gitignore` includes `.env`, `node_modules`, `dist`.
2. **Open-Source Documentation (`README.md`)**:
   - Comprehensive documentation including architecture, problem statement, instructions, and benchmark methodology.
   - Section on "Development Tools & AI Assistance" detailing Antigravity and Gemma 4 usage.
   - MIT License.

---

## 8. Verification & Acceptance Criteria

1. Backend builds cleanly without TypeScript errors.
2. Frontend builds cleanly without TypeScript or Vite errors.
3. Single judge endpoint returns validated JSON matching schema.
4. Multi-judge endpoint runs 4 independent personas without cross-contamination.
5. Consensus judge synthesizes agreement % and explicit disagreements.
6. Missing API key returns helpful configuration guidance without crash.
7. Evidence Lab executes benchmark cases and calculates real empirical accuracy.
8. Demo mode loads 3 distinct presets seamlessly.
