import React from 'react';
import { BenchmarkSummary } from '../types';
import { CheckCircle, MinusCircle, AlertTriangle } from 'lucide-react';

interface BenchmarkKpiCardsProps {
  summary: BenchmarkSummary;
}

export const BenchmarkKpiCards: React.FC<BenchmarkKpiCardsProps> = ({ summary }) => {
  const isPositiveDelta = summary.improvementDelta > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
      {/* Single Gemma Baseline */}
      <div className="card-technical p-4 rounded-lg border border-slate-800">
        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
          Single Gemma 4
        </span>
        <div className="text-2xl font-mono font-bold text-white">
          {summary.singleAccuracy}%
        </div>
        <span className="text-[10px] text-slate-500">Baseline Accuracy</span>
      </div>

      {/* Multi-Judge Jury */}
      <div className="card-technical p-4 rounded-lg border border-purple-900/60 bg-purple-950/20">
        <span className="text-[10px] font-mono uppercase text-purple-400 block mb-1">
          Multi-Judge Jury
        </span>
        <div className="text-2xl font-mono font-bold text-purple-300">
          {summary.multiAccuracy}%
        </div>
        <span className="text-[10px] text-purple-400/80">Reconciled Accuracy</span>
      </div>

      {/* Improvement Delta */}
      <div
        className={`card-technical p-4 rounded-lg border ${
          isPositiveDelta
            ? 'border-emerald-800/80 bg-emerald-950/20'
            : 'border-slate-800'
        }`}
      >
        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
          Net Delta
        </span>
        <div
          className={`text-2xl font-mono font-bold ${
            isPositiveDelta ? 'text-emerald-400' : 'text-slate-300'
          }`}
        >
          {isPositiveDelta ? `+${summary.improvementDelta}` : summary.improvementDelta}%
        </div>
        <span className="text-[10px] text-slate-400">Percentage Points</span>
      </div>

      {/* Cases Improved */}
      <div className="card-technical p-4 rounded-lg border border-emerald-900/40">
        <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px] font-mono uppercase mb-1">
          <CheckCircle className="w-3 h-3" />
          <span>Improved</span>
        </div>
        <div className="text-2xl font-mono font-bold text-emerald-400">
          {summary.casesImproved}
        </div>
        <span className="text-[10px] text-slate-500">Cases ({Math.round((summary.casesImproved / summary.totalCases) * 100)}%)</span>
      </div>

      {/* Cases Unchanged */}
      <div className="card-technical p-4 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-mono uppercase mb-1">
          <MinusCircle className="w-3 h-3" />
          <span>Unchanged</span>
        </div>
        <div className="text-2xl font-mono font-bold text-slate-300">
          {summary.casesUnchanged}
        </div>
        <span className="text-[10px] text-slate-500">Cases ({Math.round((summary.casesUnchanged / summary.totalCases) * 100)}%)</span>
      </div>

      {/* Cases Worse */}
      <div className="card-technical p-4 rounded-lg border border-rose-900/40">
        <div className="flex items-center space-x-1.5 text-rose-400 text-[10px] font-mono uppercase mb-1">
          <AlertTriangle className="w-3 h-3" />
          <span>Worse</span>
        </div>
        <div className="text-2xl font-mono font-bold text-rose-400">
          {summary.casesWorse}
        </div>
        <span className="text-[10px] text-slate-500">Cases ({Math.round((summary.casesWorse / summary.totalCases) * 100)}%)</span>
      </div>
    </div>
  );
};
