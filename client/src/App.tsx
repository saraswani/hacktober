import React, { useState, useEffect } from 'react';
import { Header, HeroBanner } from './components/Header';
import { SystemStatus } from './components/SystemStatus';
import { JudgeView } from './views/JudgeView';
import { JuryRoomView } from './views/JuryRoomView';
import { EvidenceLabView } from './views/EvidenceLabView';
import {
  HealthResponse,
  BothRunResponse,
  SingleJudgeResult,
  MultiJudgeResponse,
  BenchmarkCase,
  BenchmarkSummary
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'judge' | 'jury' | 'evidence'>('judge');
  const [health, setHealth] = useState<HealthResponse | null>(null);

  // Evaluation states
  const [lastBothResult, setLastBothResult] = useState<BothRunResponse | null>(null);
  const [lastSingleResult, setLastSingleResult] = useState<SingleJudgeResult | null>(null);
  const [lastMultiResult, setLastMultiResult] = useState<MultiJudgeResponse | null>(null);

  // Benchmark states
  const [benchmarkCases, setBenchmarkCases] = useState<BenchmarkCase[]>([]);
  const [benchmarkSummary, setBenchmarkSummary] = useState<BenchmarkSummary | null>(null);
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState<boolean>(false);

  // Poll / Check health
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data: HealthResponse = await res.json();
          setHealth(data);
        }
      } catch (err) {
        console.warn('Backend /api/health not yet reachable');
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch benchmark cases and latest benchmark result
  useEffect(() => {
    const fetchBenchmarkData = async () => {
      try {
        const [casesRes, latestRes] = await Promise.all([
          fetch('/api/benchmark/cases'),
          fetch('/api/benchmark/latest')
        ]);

        if (casesRes.ok) {
          const data = await casesRes.json();
          setBenchmarkCases(data.cases || []);
        }

        if (latestRes.ok) {
          const latestData = await latestRes.json();
          if (latestData.hasRun && latestData.run) {
            setBenchmarkSummary(latestData.run);
          }
        }
      } catch (err) {
        console.warn('Failed to load initial benchmark data');
      }
    };

    fetchBenchmarkData();
  }, []);

  // API Call Handlers
  const handleRunBoth = async (prompt: string, imageBase64?: string, mimeType?: string): Promise<BothRunResponse> => {
    const res = await fetch('/api/judge/both', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageBase64, mimeType })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Comparative run failed.');
    }

    setLastBothResult(data);
    setLastSingleResult(data.single);
    setLastMultiResult(data.multi);
    return data;
  };

  const handleRunSingle = async (prompt: string, imageBase64?: string, mimeType?: string): Promise<SingleJudgeResult> => {
    const res = await fetch('/api/judge/single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageBase64, mimeType })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Single baseline run failed.');
    }

    setLastSingleResult(data);
    return data;
  };

  const handleRunMulti = async (prompt: string, imageBase64?: string, mimeType?: string): Promise<MultiJudgeResponse> => {
    const res = await fetch('/api/judge/multi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageBase64, mimeType })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Multi-judge run failed.');
    }

    setLastMultiResult(data);
    return data;
  };

  const handleRunBenchmark = async (): Promise<BenchmarkSummary> => {
    setIsBenchmarkRunning(true);
    try {
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Benchmark run failed.');
      }

      setBenchmarkSummary(data);
      return data;
    } finally {
      setIsBenchmarkRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top System Status Banner */}
      <SystemStatus health={health} />

      {/* Persistent Navigation Header */}
      <Header
        health={health}
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Hero Banner on Initial Landing / Judge Tab */}
      {activeTab === 'judge' && !lastBothResult && (
        <HeroBanner
          onStart={() => {
            const promptEl = document.getElementById('promptInput');
            promptEl?.focus();
          }}
          onViewEvidence={() => setActiveTab('evidence')}
        />
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'judge' && (
          <JudgeView
            onRunBoth={handleRunBoth}
            onRunSingle={handleRunSingle}
            onRunMulti={handleRunMulti}
            onViewJuryRoom={() => setActiveTab('jury')}
            lastBothResult={lastBothResult}
            lastSingleResult={lastSingleResult}
            lastMultiResult={lastMultiResult}
          />
        )}

        {activeTab === 'jury' && (
          <JuryRoomView
            judges={lastMultiResult?.judges || lastBothResult?.multi.judges || null}
            consensus={lastMultiResult?.consensus || lastBothResult?.multi.consensus || null}
            onNavigateToJudge={() => setActiveTab('judge')}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceLabView
            cases={benchmarkCases}
            summary={benchmarkSummary}
            onRunBenchmark={handleRunBenchmark}
            isRunning={isBenchmarkRunning}
          />
        )}
      </main>

      {/* Technical Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">VERDICT</span>
            <span>—</span>
            <span>Evidence-driven multi-perspective AI reliability engine</span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>Model: gemma-4-26b-a4b-it</span>
            <span>•</span>
            <span>Open Source Hackathon Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
