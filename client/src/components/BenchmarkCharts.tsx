import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BenchmarkSummary } from '../types';

interface BenchmarkChartsProps {
  summary: BenchmarkSummary;
}

export const BenchmarkCharts: React.FC<BenchmarkChartsProps> = ({ summary }) => {
  // Category breakdown data
  const categoryData = Object.entries(summary.categoryBreakdown).map(([category, stats]) => ({
    category,
    'Single Accuracy': stats.singleAccuracy,
    'Multi Accuracy': stats.multiAccuracy,
    total: stats.total
  }));

  // Outcomes distribution data
  const outcomeData = [
    { name: 'Improved', count: summary.casesImproved, color: '#10b981' },
    { name: 'Unchanged', count: summary.casesUnchanged, color: '#64748b' },
    { name: 'Worse', count: summary.casesWorse, color: '#f43f5e' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-6">
      {/* Chart 1: Per-Category Accuracy Comparison */}
      <div className="card-technical p-4 sm:p-5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Per-Category Accuracy Comparison
          </h4>
          <span className="code-tag text-[10px] text-slate-400">Single vs Multi (%)</span>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090e17',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Single Accuracy" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Multi Accuracy" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Outcome Breakdown (Improved / Unchanged / Worse) */}
      <div className="card-technical p-4 sm:p-5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Impact Distribution Across Test Cases
          </h4>
          <span className="code-tag text-[10px] text-slate-400">Case Distribution</span>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={outcomeData}
              margin={{ top: 10, right: 20, left: -20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                allowDecimals={false}
                stroke="#64748b"
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090e17',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  fontSize: '11px'
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {outcomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
