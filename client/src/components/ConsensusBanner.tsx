import React from 'react';
import { ConsensusResult } from '../types';
import { Scale, CheckCircle2 } from 'lucide-react';

interface ConsensusBannerProps {
  consensus: ConsensusResult;
  totalJudges: number;
  agreeingJudgesCount: number;
}

export const ConsensusBanner: React.FC<ConsensusBannerProps> = ({
  consensus,
  totalJudges,
  agreeingJudgesCount
}) => {
  const getVerdictStyle = (v: string) => {
    const val = v.toUpperCase();
    if (val === 'PASS') return { text: 'text-emerald-400', border: 'border-emerald-600', bg: 'bg-emerald-950/40' };
    if (val === 'FAIL') return { text: 'text-rose-400', border: 'border-rose-600', bg: 'bg-rose-950/40' };
    if (val === 'WARNING') return { text: 'text-amber-400', border: 'border-amber-600', bg: 'bg-amber-950/40' };
    return { text: 'text-purple-400', border: 'border-purple-600', bg: 'bg-purple-950/40' };
  };

  const style = getVerdictStyle(consensus.final_verdict);

  return (
    <div className={`card-technical rounded-lg p-6 border ${style.border} ${style.bg} space-y-5 my-6`}>
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-purple-900/60 border border-purple-600 text-purple-300">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 block">
              Consensus Deliberation Stage
            </span>
            <h3 className="text-xl font-black tracking-tight text-white">Consensus Verdict</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="code-tag px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300">
            Reliability: {consensus.reliability_assessment.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Big Metric Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Large Final Verdict & Score */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Final Determination</span>
            <div className={`text-3xl font-black font-mono tracking-tight ${style.text}`}>
              {consensus.final_verdict}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-900 mt-2 flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Synthesized Score:</span>
            <span className="text-xl font-mono font-bold text-white">
              {consensus.final_score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </span>
          </div>
        </div>

        {/* Confidence & Agreeing Judges */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Consensus Confidence</span>
            <div className="text-3xl font-black font-mono tracking-tight text-white">
              {consensus.confidence}%
            </div>
            <span className="text-[11px] text-slate-400">
              {consensus.confidence >= 75
                ? 'HIGH CONFIDENCE'
                : consensus.confidence >= 50
                ? 'MODERATE CONFIDENCE'
                : 'UNCERTAIN'}
            </span>
          </div>
          <div className="pt-3 border-t border-slate-900 mt-2 flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Judge Alignment:</span>
            <span className="text-xs font-mono font-bold text-purple-300">
              {agreeingJudgesCount} / {totalJudges} judges agree
            </span>
          </div>
        </div>

        {/* Agreement Visual Progress Bar */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase font-mono text-slate-400">Jury Agreement</span>
              <span className="text-xs font-mono font-bold text-purple-300">
                {consensus.agreement_percent}%
              </span>
            </div>

            {/* Custom high-contrast progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 my-2">
              <div
                className="bg-purple-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(5, consensus.agreement_percent))}%` }}
              />
            </div>
            
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {'█'.repeat(Math.round(consensus.agreement_percent / 5))}
              {'░'.repeat(20 - Math.round(consensus.agreement_percent / 5))}
            </p>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            {consensus.agreement_percent >= 75
              ? 'Strong unanimous / supermajority consensus.'
              : consensus.agreement_percent >= 50
              ? 'Split jury; consensus resolved via safety/security precedence.'
              : 'Substantial divergence across personas.'}
          </div>
        </div>
      </div>

      {/* Deliberation Summary */}
      <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Synthesized Decision Rationale
        </h5>
        <p className="text-xs text-slate-200 leading-relaxed">
          {consensus.summary || consensus.decision}
        </p>
      </div>

      {/* Strongest Arguments Cards */}
      {consensus.strongest_arguments && consensus.strongest_arguments.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Decisive Deliberation Arguments
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {consensus.strongest_arguments.map((arg, idx) => (
              <div
                key={idx}
                className="p-3 rounded bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{arg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
