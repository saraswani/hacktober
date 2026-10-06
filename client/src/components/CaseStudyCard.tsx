import React from 'react';
import { CheckCircle2, MinusCircle, AlertTriangle } from 'lucide-react';

export const CaseStudySections: React.FC = () => {
  return (
    <div className="space-y-4 my-6">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          Empirical Case Studies: An Honest Scientific Evaluation
        </h3>
        <p className="text-xs text-slate-400">
          Multi-agent architectures are not a silver bullet. Below is an unvarnished audit of where multiple Gemma 4 perspectives succeed, where they add zero value, and where they degrade performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Where Multi-Judge Helped */}
        <div className="card-technical p-4 rounded-lg border border-emerald-900/60 bg-emerald-950/10 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="code-tag text-[10px] text-emerald-400 font-bold uppercase">
                WHERE MULTI-JUDGE HELPED
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="my-2">
              <h4 className="text-xs font-bold text-white">Case #01 & #04: Side-Channels & Assumptions</h4>
              <div className="flex items-center space-x-2 text-[11px] font-mono mt-1 text-slate-300">
                <span className="text-rose-400">Single: Incorrect (PASS)</span>
                <span>→</span>
                <span className="text-emerald-400">Multi: Correct (FAIL)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
              <strong>Observation:</strong> Single model baseline evaluated the token string comparison as clean code. The <strong>Skeptic</strong> role probed aggressively for timing side-channels and flagged early-exit vulnerabilities, leading the Consensus judge to overturn the baseline.
            </p>
          </div>

          <div className="text-[11px] text-emerald-400/90 font-mono pt-2 border-t border-emerald-950">
            Domain: Security & Hidden Assumptions
          </div>
        </div>

        {/* Card 2: Where Multi-Judge Did Not Help */}
        <div className="card-technical p-4 rounded-lg border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="code-tag text-[10px] text-slate-400 font-bold uppercase">
                WHERE MULTI-JUDGE DID NOT HELP
              </span>
              <MinusCircle className="w-4 h-4 text-slate-400" />
            </div>

            <div className="my-2">
              <h4 className="text-xs font-bold text-white">Case #09 & #10: Deterministic Math & Formatting</h4>
              <div className="flex items-center space-x-2 text-[11px] font-mono mt-1 text-slate-300">
                <span className="text-emerald-400">Single: Correct (PASS)</span>
                <span>=</span>
                <span className="text-emerald-400">Multi: Correct (PASS)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
              <strong>Observation:</strong> For straightforward, unambiguous tasks (like Celsius to Fahrenheit conversion or string reversal), a single prompt solves the problem accurately. Multi-judge instances simply corroborated the answer at 4x the token cost without improving accuracy.
            </p>
          </div>

          <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-900">
            Domain: Simple Factual & Direct Computation
          </div>
        </div>

        {/* Card 3: Where Multi-Judge Was Worse */}
        <div className="card-technical p-4 rounded-lg border border-rose-900/60 bg-rose-950/10 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="code-tag text-[10px] text-rose-400 font-bold uppercase">
                WHERE MULTI-JUDGE WAS WORSE
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>

            <div className="my-2">
              <h4 className="text-xs font-bold text-white">Case #11: Over-Skepticism & Spurious Warnings</h4>
              <div className="flex items-center space-x-2 text-[11px] font-mono mt-1 text-slate-300">
                <span className="text-emerald-400">Single: Correct (PASS)</span>
                <span>→</span>
                <span className="text-rose-400">Multi: Incorrect (WARNING)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
              <strong>Observation:</strong> On standard, idiomatic TypeScript discriminated unions, the <strong>Skeptic</strong> role over-analyzed the snippet, raising hyper-critical demands for non-idiomatic assertions. This introduced unwarranted hesitation into consensus, degrading an otherwise clean PASS into a WARNING.
            </p>
          </div>

          <div className="text-[11px] text-rose-400/90 font-mono pt-2 border-t border-rose-950">
            Domain: Hyper-Critical Edge Cases
          </div>
        </div>
      </div>
    </div>
  );
};
