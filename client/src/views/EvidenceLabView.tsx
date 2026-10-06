import React, { useState } from 'react';
import { BenchmarkCase, BenchmarkSummary } from '../types';
import { BenchmarkKpiCards } from '../components/BenchmarkKpiCards';
import { BenchmarkCharts } from '../components/BenchmarkCharts';
import { CaseStudySections } from '../components/CaseStudyCard';
import { BenchmarkTable } from '../components/BenchmarkTable';
import { Play, Loader2, FlaskConical, AlertCircle } from 'lucide-react';

interface EvidenceLabViewProps {
  cases: BenchmarkCase[];
  summary: BenchmarkSummary | null;
  onRunBenchmark: () => Promise<BenchmarkSummary>;
  isRunning: boolean;
}

export const EvidenceLabView: React.FC<EvidenceLabViewProps> = ({
  cases,
  summary,
  onRunBenchmark,
  isRunning
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRun = async () => {
    setErrorMsg(null);
    try {
      await onRunBenchmark();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to execute benchmark suite.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="code-tag text-purple-400 uppercase text-[11px] font-semibold">
              Section 3: Empirical Science
            </span>
            <span className="code-tag px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              12 Cases
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">The Evidence Lab</h2>
          <p className="text-xs text-slate-400">
            Scientifically proving whether multi-perspective Gemma 4 jury instances improve reliability over a single model call.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Benchmark Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{summary ? 'Re-Run Benchmark' : 'RUN BENCHMARK'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* When benchmark has not been run yet */}
      {!summary && !isRunning && (
        <div className="card-technical p-10 rounded-lg text-center space-y-4 my-6">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-purple-400">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Benchmark Not Run</h3>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed">
            In accordance with the hackathon rules, performance claims must come from actual benchmark execution rather than hardcoded mock figures.
          </p>
          <div className="pt-2">
            <button
              onClick={handleRun}
              className="px-5 py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-sm inline-flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RUN BENCHMARK (12 CASES)</span>
            </button>
          </div>
        </div>
      )}

      {/* Running State Indicator */}
      {isRunning && (
        <div className="card-technical p-8 rounded-lg text-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-white">Executing 12 Benchmark Scenarios</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Dispatching each case to single baseline Gemma 4 and 4-role independent jury with consensus reconciliation...
          </p>
        </div>
      )}

      {/* Active Results Display */}
      {summary && (
        <>
          {/* Top KPI Cards */}
          <BenchmarkKpiCards summary={summary} />

          {/* Visualizations (Recharts) */}
          <BenchmarkCharts summary={summary} />

          {/* Qualitative Deep Dives: Where Helped / Unchanged / Worse */}
          <CaseStudySections />

          {/* Filterable 12-Case Table */}
          <BenchmarkTable cases={cases} results={summary.caseResults} />
        </>
      )}

      {/* Always show the test case suite table below */}
      {!summary && cases.length > 0 && (
        <BenchmarkTable cases={cases} />
      )}
    </div>
  );
};
