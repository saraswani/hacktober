import { BenchmarkCase } from '../schemas.js';

export const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: 'CASE-01',
    category: 'Security',
    title: 'Timing Attack in String Comparison',
    input: `Review this authentication code for vulnerabilities:
function verifyToken(userToken, secretToken) {
  if (userToken.length !== secretToken.length) return false;
  for (let i = 0; i < userToken.length; i++) {
    if (userToken[i] !== secretToken[i]) return false;
  }
  return true;
}`,
    expectedEvaluation: 'Contains a timing attack side-channel vulnerability because comparison exits early on first mismatch instead of using crypto.timingSafeEqual.',
    groundTruthVerdict: 'FAIL',
    expectedBenefit: 'improved',
    explanation: 'Single models often see basic byte-by-byte equality and rate it PASS. The Skeptic role specifically detects side-channel timing attacks.'
  },
  {
    id: 'CASE-02',
    category: 'Code Review',
    title: 'React useEffect Event Listener Leak',
    input: `Is this React hook implementation correct?
function useWindowResize(callback) {
  useEffect(() => {
    window.addEventListener('resize', callback);
  }, [callback]);
}`,
    expectedEvaluation: 'Missing cleanup function in useEffect. Every time callback changes, a new listener is added without removing the previous listener, leaking memory.',
    groundTruthVerdict: 'FAIL',
    expectedBenefit: 'improved',
    explanation: 'Single model may assume the hook is clean; the Skeptic and Domain Expert identify missing return cleanup.'
  },
  {
    id: 'CASE-03',
    category: 'Ambiguous Reasoning',
    title: 'Autonomous Vehicle Sensor Failure Dilemma',
    input: `An autonomous delivery drone loses lidar sensor calibration in dense fog with 15% battery left. The nearest emergency pad is 2 km east through restricted airspace, while the depot is 4 km north over a public highway. Should the drone immediately land in place on the highway shoulder or attempt flight to the pad?`,
    expectedEvaluation: 'Landing in place on a highway shoulder poses immediate collision risks to road traffic, while flying through restricted airspace violates aviation regulations with failing sensors. Protocol requires controlled descent into an unpopulated buffer zone or hovering fail-safe.',
    groundTruthVerdict: 'WARNING',
    expectedBenefit: 'improved',
    explanation: 'Single models frequently pick one option without auditing both hazards. A multi-judge panel highlights regulatory vs immediate life-safety trade-offs.'
  },
  {
    id: 'CASE-04',
    category: 'Hidden Assumptions',
    title: 'Financial Interest Calculation with Static Days',
    input: `Evaluate this financial calculation logic:
function calculateDailyAccrual(principal, annualRate) {
  // Calculates daily interest accrual
  const dailyRate = annualRate / 365;
  return principal * dailyRate;
}`,
    expectedEvaluation: 'Hides assumption of 365-day standard year. Fails in leap years (366 days) and ignores financial day-count conventions (such as Actual/360 or Actual/Actual ICMA), leading to accounting reconciliation discrepancies.',
    groundTruthVerdict: 'WARNING',
    expectedBenefit: 'improved',
    explanation: 'Baseline easily overlooks day-count convention assumptions. Skeptic flags leap year / 360-day bond convention variance.'
  },
  {
    id: 'CASE-05',
    category: 'Accessibility',
    title: 'Low Contrast Icon Button Without Accessible Name',
    input: `Is this button component fully accessible?
<button style={{ backgroundColor: '#94a3b8', color: '#cbd5e1' }} onClick={handleDelete}>
  <TrashIcon />
</button>`,
    expectedEvaluation: 'Fails WCAG 2.1 AA on two counts: 1) Contrast ratio between #94a3b8 and #cbd5e1 is under 2:1 (minimum 4.5:1 required). 2) Icon-only button has no aria-label or accessible text for screen readers.',
    groundTruthVerdict: 'FAIL',
    expectedBenefit: 'improved',
    explanation: 'The Beginner role checks screen reader usability and the Verifier audits WCAG contrast thresholds.'
  },
  {
    id: 'CASE-06',
    category: 'Factual Reasoning',
    title: 'Correlation vs Causation in Marketing Claim',
    input: `Analyze the validity of this assertion:
"Our analytics show that users who enable dark mode spend 42% more money on our e-commerce platform. Therefore, defaulting all users to dark mode will increase company revenue by approximately 40%."`,
    expectedEvaluation: 'Flawed logic: confuses correlation with causation. Power users and frequent shoppers may be more likely to customize preferences, but forcing dark mode does not create shopping intent.',
    groundTruthVerdict: 'FAIL',
    expectedBenefit: 'improved',
    explanation: 'Single model might accept the data premise. Verifier role isolates the causal fallacy.'
  },
  {
    id: 'CASE-07',
    category: 'Contradictory Information',
    title: 'Conflicting Log Timestamps in Incident Report',
    input: `Audit this post-mortem snippet:
"Database service crashed at 14:02:15 UTC due to out-of-memory. The automated watchdog successfully restarted the instance at 14:01:50 UTC, and all transactions recovered by 14:02:00 UTC."`,
    expectedEvaluation: 'Chronological impossibility: watchdog restart (14:01:50) and recovery (14:02:00) cannot precede the crash event (14:02:15 UTC). Timestamps indicate unsynchronized clocks or fabricated timeline.',
    groundTruthVerdict: 'FAIL',
    expectedBenefit: 'improved',
    explanation: 'Verifier role systematically checks chronological ordering and flags temporal contradiction.'
  },
  {
    id: 'CASE-08',
    category: 'Edge Cases',
    title: 'ISO 8601 UTC Leap Second Parsing',
    input: `Does this parser handle valid ISO-8601 timestamps reliably?
function parseTimestamp(ts) {
  const match = ts.match(/^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})Z$/);
  if (!match) return null;
  const [_, y, m, d, hh, mm, ss] = match;
  if (+hh > 23 || +mm > 59 || +ss > 59) return null;
  return new Date(ts);
}`,
    expectedEvaluation: 'Rejects valid leap second timestamps (e.g. 23:59:60Z) where second value 60 is strictly valid in ISO 8601 and UTC standards.',
    groundTruthVerdict: 'WARNING',
    expectedBenefit: 'improved',
    explanation: 'Domain expert and Skeptic identify standard compliance edge case missed by quick baseline check.'
  },
  {
    id: 'CASE-09',
    category: 'Simple Factual',
    title: 'Celsius to Fahrenheit Formula Conversion',
    input: `Is this formula correct for temperature conversion?
Fahrenheit = (Celsius * 9/5) + 32`,
    expectedEvaluation: 'Mathematically and scientifically correct standard conversion formula.',
    groundTruthVerdict: 'PASS',
    expectedBenefit: 'unchanged',
    explanation: 'Straightforward math task. Single model answers correctly; multi-judge provides no additional accuracy benefit and only consumes extra tokens.'
  },
  {
    id: 'CASE-10',
    category: 'Straightforward Task',
    title: 'Reverse Words in a String',
    input: `Is this JavaScript function correctly reversing words in a sentence?
function reverseWords(str) {
  return str.trim().split(/\\s+/).reverse().join(' ');
}`,
    expectedEvaluation: 'Correct and handles multi-space delimiters cleanly via regular expression.',
    groundTruthVerdict: 'PASS',
    expectedBenefit: 'unchanged',
    explanation: 'Simple unambiguous task. Single model produces correct assessment; multi-judge jury concurs with zero improvement.'
  },
  {
    id: 'CASE-11',
    category: 'Hidden Assumptions',
    title: 'Standard TypeScript Discriminated Union',
    input: `Review this TypeScript state pattern for defects:
type State = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

function render(state: State) {
  switch (state.status) {
    case 'idle': return 'Ready';
    case 'loading': return 'Working...';
    case 'success': return state.data;
    case 'error': return state.error.message;
  }
}`,
    expectedEvaluation: 'Exhaustive and idiomatic TypeScript discriminated union pattern.',
    groundTruthVerdict: 'PASS',
    expectedBenefit: 'worse',
    explanation: 'Over-zealous Skeptic may search for flaws where none exist (e.g. demanding exhaustive default assertNever or internationalization), causing consensus hesitation or spurious WARNING on perfectly sound code.'
  },
  {
    id: 'CASE-12',
    category: 'Security',
    title: 'Parametric SQL Query with Prepared Statement',
    input: `Is this database query vulnerable to SQL injection?
const query = 'SELECT id, email FROM users WHERE organization_id = ? AND status = ?';
const [rows] = await db.execute(query, [orgId, 'active']);`,
    expectedEvaluation: 'Secure: Uses parameterized placeholders (?) and prepared statement execution, preventing SQL injection.',
    groundTruthVerdict: 'PASS',
    expectedBenefit: 'unchanged',
    explanation: 'Standard secure pattern. Baseline correctly identifies parameterization. Multi-judge confirms without changing outcome.'
  }
];
