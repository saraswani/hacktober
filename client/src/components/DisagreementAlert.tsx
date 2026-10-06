import React from 'react';
import { JudgeRoleResult, DisagreementItem } from '../types';
import { AlertTriangle } from 'lucide-react';

interface DisagreementAlertProps {
  judges: JudgeRoleResult[];
  disagreements: DisagreementItem[];
}

export const DisagreementAlert: React.FC<DisagreementAlertProps> = ({ judges, disagreements }) => {
  // Check if judges have divergent verdicts
  const verdicts = judges.filter((j) => j.available).map((j) => j.verdict);
  const uniqueVerdicts = Array.from(new Set(verdicts));
  const hasDisagreement = uniqueVerdicts.length > 1 || disagreements.length > 0;

  if (!hasDisagreement) {
    return (
      <div className="card-technical p-4 rounded-lg border border-slate-800 bg-slate-900/30">
        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
          <span>✓ Unanimous Alignment:</span>
          <span className="text-slate-300">All active jury roles independently arrived at {verdicts[0] || 'agreement'}.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-lg border border-amber-600/80 bg-amber-950/25 space-y-3">
      {/* Alert Header */}
      <div className="flex items-center space-x-2 text-amber-300">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <h3 className="text-sm font-bold tracking-tight">⚠ Disagreement Detected Among Jury</h3>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        The independent Gemma 4 instances diverged on this evaluation. Disagreement reveals implicit assumptions and edge cases that a single model call routinely conceals.
      </p>

      {/* Breakdown of stances */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
        {judges.map((j) => {
          const isFail = j.verdict.toUpperCase() === 'FAIL';
          const isWarning = j.verdict.toUpperCase() === 'WARNING';
          const isPass = j.verdict.toUpperCase() === 'PASS';

          let badgeColor = 'bg-slate-900 text-slate-400 border-slate-800';
          if (isFail) badgeColor = 'bg-rose-950/70 border-rose-700 text-rose-300 font-bold';
          if (isWarning) badgeColor = 'bg-amber-950/70 border-amber-700 text-amber-300 font-bold';
          if (isPass) badgeColor = 'bg-emerald-950/70 border-emerald-700 text-emerald-300 font-bold';

          return (
            <div key={j.role} className={`p-2.5 rounded border ${badgeColor} text-center`}>
              <div className="text-[10px] uppercase font-mono tracking-wider opacity-80">{j.role}</div>
              <div className="text-xs font-mono">{j.verdict}</div>
              <div className="text-[10px] opacity-70 font-mono mt-0.5">{j.score}/100</div>
            </div>
          );
        })}
      </div>

      {/* Specific Disagreements analyzed by consensus */}
      {disagreements && disagreements.length > 0 && (
        <div className="pt-2 border-t border-amber-900/60 space-y-2">
          <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block">
            Reconciliation Analysis:
          </span>
          {disagreements.map((d, idx) => (
            <div key={idx} className="p-2.5 rounded bg-slate-950/80 border border-amber-900/40 text-xs space-y-1">
              <div className="flex items-center justify-between text-amber-300 font-semibold">
                <span>{d.topic}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  Judges: {d.judges_involved.join(' vs ')}
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">{d.description}</p>
              <div className="text-purple-300 text-[11px] font-medium pt-1">
                <strong>Arbitration:</strong> {d.resolution}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
