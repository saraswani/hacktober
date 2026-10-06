import React from 'react';
import { BothRunResponse } from '../types';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface SideBySideComparisonProps {
  data: BothRunResponse;
  onViewJuryRoom: () => void;
}

export const SideBySideComparison: React.FC<SideBySideComparisonProps> = ({
  data,
  onViewJuryRoom
}) => {
  const { single, multi, comparison } = data;

  const getVerdictBadge = (verdict: string) => {
    const v = verdict.toUpperCase();
    if (v === 'PASS') {
      return (
        <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-mono text-xs font-bold">
          PASS
        </span>
      );
    }
    if (v === 'FAIL') {
      return (
        <span className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-700 text-rose-300 font-mono text-xs font-bold">
          FAIL
        </span>
      );
    }
    if (v === 'WARNING') {
      return (
        <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-700 text-amber-300 font-mono text-xs font-bold">
          WARNING
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold">
        {verdict}
      </span>
    );
  };

  return (
    <div className="space-y-4 my-6">
      {/* Divergence Banner */}
      <div
        className={`p-4 rounded-lg border ${
          comparison.decisionChanged
            ? 'bg-amber-950/30 border-amber-700/80 text-amber-200'
            : 'bg-emerald-950/30 border-emerald-700/80 text-emerald-200'
        }`}
      >
        <div className="flex items-start space-x-3">
          {comparison.decisionChanged ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h4 className="text-sm font-bold tracking-tight">
              {comparison.decisionChanged
                ? '⚠️ Multi-Judge Changed the Decision'
                : '✓ Single Model and Jury Concurred'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {comparison.explanation}
            </p>
            <div className="pt-1 flex items-center space-x-4 text-xs font-mono">
              <span>Verdict Shift: {comparison.verdictComparison}</span>
              <span>Score Δ: {comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Single Gemma Result Card */}
        <div className="card-technical p-5 rounded-lg border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Baseline (Single Call)
              </span>
              <h3 className="text-base font-bold text-white">Single Gemma Result</h3>
            </div>
            {getVerdictBadge(single.verdict)}
          </div>

          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Score</span>
              <span className="text-2xl font-mono font-bold text-slate-200">{single.score}</span>
              <span className="text-[10px] text-slate-500"> / 100</span>
            </div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Confidence</span>
              <span className="text-2xl font-mono font-bold text-slate-200">{single.confidence}%</span>
              <span className="text-[10px] text-slate-500"> certainty</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-300 mb-1">Reasoning</h5>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded border border-slate-800">
              {single.reasoning || 'No reasoning supplied.'}
            </p>
          </div>

          {single.key_points && single.key_points.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-300 mb-1">Key Findings</h5>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                {single.key_points.map((pt, i) => (
                  <li key={i} className="truncate">{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {single.risks && single.risks.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-rose-400 mb-1">Risks Identified</h5>
              <ul className="text-xs text-rose-300/80 space-y-1 list-disc list-inside">
                {single.risks.map((risk, i) => (
                  <li key={i} className="truncate">{risk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Multi-Judge Jury Result Card */}
        <div className="card-technical p-5 rounded-lg border border-purple-900/50 space-y-4 bg-gradient-to-b from-purple-950/10 to-slate-950">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
                4-Judge Jury & Consensus
              </span>
              <h3 className="text-base font-bold text-white">Multi-Judge Result</h3>
            </div>
            {getVerdictBadge(multi.consensus.final_verdict)}
          </div>

          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-3 rounded bg-slate-900 border border-purple-900/30">
              <span className="text-[11px] text-purple-300 block mb-1">Reconciled Score</span>
              <span className="text-2xl font-mono font-bold text-white">{multi.consensus.final_score}</span>
              <span className="text-[10px] text-slate-500"> / 100</span>
            </div>
            <div className="p-3 rounded bg-slate-900 border border-purple-900/30">
              <span className="text-[11px] text-purple-300 block mb-1">Jury Agreement</span>
              <span className="text-2xl font-mono font-bold text-purple-300">
                {multi.consensus.agreement_percent}%
              </span>
              <span className="text-[10px] text-slate-500"> consensus</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-300 mb-1">Consensus Synthesis</h5>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded border border-purple-900/30">
              {multi.consensus.summary || 'Deliberation in progress.'}
            </p>
          </div>

          {multi.consensus.strongest_arguments && multi.consensus.strongest_arguments.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-purple-300 mb-1">Decisive Arguments</h5>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {multi.consensus.strongest_arguments.map((arg, i) => (
                  <li key={i} className="truncate">{arg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Active Judges: {multi.availableJudgesCount} of {multi.judges.length}
            </span>
            <button
              onClick={onViewJuryRoom}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-purple-900/60 hover:bg-purple-800/80 border border-purple-600 text-purple-200 text-xs font-medium transition-colors"
            >
              <span>Examine Jury Deliberation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
