import React, { useState } from 'react';
import { BenchmarkCase, BenchmarkCaseResult } from '../types';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

interface BenchmarkTableProps {
  cases: BenchmarkCase[];
  results?: BenchmarkCaseResult[];
}

export const BenchmarkTable: React.FC<BenchmarkTableProps> = ({ cases, results }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(cases.map((c) => c.category)))];

  const filteredCases = cases.filter(
    (c) => categoryFilter === 'ALL' || c.category === categoryFilter
  );

  const getResultForCase = (id: string) => results?.find((r) => r.id === id);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="card-technical rounded-lg border border-slate-800 p-4 sm:p-5 my-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            The 12-Case Benchmark Suite
          </h4>
          <p className="text-xs text-slate-400">
            Empirical test battery comparing single prompt vs. multi-perspective jury against ground truth.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-[11px] text-slate-400 font-mono">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-600"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Test Scenario</th>
              <th className="py-2.5 px-3">Ground Truth</th>
              <th className="py-2.5 px-3">Single Gemma</th>
              <th className="py-2.5 px-3">Multi-Judge</th>
              <th className="py-2.5 px-3">Delta Impact</th>
              <th className="py-2.5 px-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {filteredCases.map((c) => {
              const res = getResultForCase(c.id);
              const isExpanded = expandedId === c.id;

              return (
                <React.Fragment key={c.id}>
                  <tr
                    onClick={() => toggleExpand(c.id)}
                    className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-300">{c.id}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-purple-400">
                        {c.groundTruthVerdict}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {res ? (
                        <div className="flex items-center space-x-1.5">
                          {res.singleCorrect ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>{res.singleVerdict}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Not run</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {res ? (
                        <div className="flex items-center space-x-1.5">
                          {res.multiCorrect ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span className="font-semibold text-purple-300">{res.multiVerdict}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Not run</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {res ? (
                        res.outcome === 'improved' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[10px] font-bold">
                            + IMPROVED
                          </span>
                        ) : res.outcome === 'worse' ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[10px] font-bold">
                            - WORSE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">
                            = UNCHANGED
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          Expected: {c.expectedBenefit}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-slate-950/80">
                      <td colSpan={8} className="p-4 space-y-3 border-b border-slate-800">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">
                            Prompt Snippet:
                          </span>
                          <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono whitespace-pre-wrap">
                            {c.input}
                          </pre>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded bg-slate-900 border border-slate-800">
                            <span className="font-semibold text-purple-400 block mb-1">
                              Ground Truth Reference:
                            </span>
                            <p className="text-slate-300">{c.expectedEvaluation}</p>
                          </div>
                          <div className="p-3 rounded bg-slate-900 border border-slate-800">
                            <span className="font-semibold text-slate-300 block mb-1">
                              Hypothesis & Mechanism:
                            </span>
                            <p className="text-slate-400">{c.explanation}</p>
                          </div>
                        </div>

                        {res && (
                          <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-xs">
                            <span className="font-semibold text-slate-300 block mb-1">
                              Actual Execution Analysis:
                            </span>
                            <p className="text-slate-400">{res.analysis}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
