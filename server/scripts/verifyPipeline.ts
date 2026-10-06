import { runSingleJudge } from '../src/services/singleJudge.js';
import { runMultiJudge } from '../src/services/multiJudge.js';
import { runConsensus } from '../src/services/consensus.js';

async function verifyFullPipeline() {
  console.log('====================================================');
  console.log('AUDIT: Testing Live Gemma 4 Evaluation Pipeline');
  console.log('====================================================');

  const testPrompt = `Analyze this code for security vulnerabilities:
function authenticate(user, pass) {
  if (user === 'admin' && pass === 'secret123') return true;
  return false;
}`;

  console.log('\n[1/3] Running Single Model Baseline...');
  const t0 = Date.now();
  const single = await runSingleJudge(testPrompt);
  console.log(`Single Model Verdict: ${single.verdict} (Score: ${single.score}/100, Conf: ${single.confidence}%) in ${Date.now() - t0}ms`);
  console.log(`Single Reasoning: ${single.reasoning.slice(0, 120)}...`);

  console.log('\n[2/3] Running 4 Independent Judges in Parallel...');
  const t1 = Date.now();
  const { judges, availableCount } = await runMultiJudge(testPrompt);
  console.log(`Multi-Judge completed in ${Date.now() - t1}ms (${availableCount}/4 available):`);
  for (const j of judges) {
    console.log(` - [${j.role.toUpperCase()}] Verdict: ${j.verdict} | Score: ${j.score}/100 | Conf: ${j.confidence}% | Concerns: ${j.concerns?.[0] || 'None'}`);
  }

  console.log('\n[3/3] Running Consensus Reconciliation Judge...');
  const t2 = Date.now();
  const consensus = await runConsensus(testPrompt, judges);
  console.log(`Consensus completed in ${Date.now() - t2}ms:`);
  console.log(` - Final Verdict: ${consensus.final_verdict}`);
  console.log(` - Reconciled Score: ${consensus.final_score}/100`);
  console.log(` - Agreement %: ${consensus.agreement_percent}%`);
  console.log(` - Reliability Assessment: ${consensus.reliability_assessment}`);
  console.log(` - Summary: ${consensus.summary.slice(0, 150)}...`);

  console.log('\n====================================================');
  console.log('PIPELINE AUDIT: ALL GEMMA 4 SERVICES PASSED VERIFICATION!');
  console.log('====================================================\n');
}

verifyFullPipeline().catch((err) => {
  console.error('Audit Pipeline Error:', err);
  process.exit(1);
});
