import React from 'react';
import { Scale, Cpu, Sparkles } from 'lucide-react';
import { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  onNavigate: (tab: 'judge' | 'jury' | 'evidence') => void;
  activeTab: 'judge' | 'jury' | 'evidence';
}

export const Header: React.FC<HeaderProps> = ({ health, onNavigate, activeTab }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('judge')}>
            <div className="w-9 h-9 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-purple-400 shadow-sm">
              <Scale className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wider text-white">VERDICT</span>
                <span className="code-tag px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[10px]">
                  Gemma 4
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-tight hidden sm:block">
                "When one AI isn't enough, ask a jury."
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => onNavigate('judge')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'judge'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              1. Judge
            </button>
            <button
              onClick={() => onNavigate('jury')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'jury'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              2. Jury Room
            </button>
            <button
              onClick={() => onNavigate('evidence')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'evidence'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              3. Evidence Lab
            </button>
          </nav>

          {/* Model Status Pill */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-mono text-[11px]">gemma-4-26b-a4b-it</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  health?.apiKeyConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
                title={health?.apiKeyConfigured ? 'API Key Active' : 'API Key Unconfigured'}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const HeroBanner: React.FC<{ onStart: () => void; onViewEvidence: () => void }> = ({
  onStart,
  onViewEvidence
}) => {
  return (
    <div className="border-b border-slate-800/60 bg-gradient-to-b from-slate-950 to-slate-900/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Evidence-Driven Multi-Perspective AI Reliability Engine</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
          When one AI isn't enough, <span className="text-purple-400">ask a jury.</span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
          Compare a single Gemma 4 response against four independent perspectives — Skeptic, Domain Expert, Beginner, and Verifier — and measure experimentally whether disagreement makes AI decisions more reliable.
        </p>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-2xl mx-auto">
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-mono font-bold text-white">4</div>
            <div className="text-xs text-slate-400">Independent Judges</div>
          </div>
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-mono font-bold text-purple-400">1</div>
            <div className="text-xs text-slate-400">Consensus Engine</div>
          </div>
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-mono font-bold text-emerald-400">1</div>
            <div className="text-xs text-slate-400">Evidence Lab (12 Cases)</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center space-x-3 pt-3">
          <button
            onClick={onStart}
            className="px-5 py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs sm:text-sm tracking-wide transition-colors shadow-sm"
          >
            START EVALUATION
          </button>
          <button
            onClick={onViewEvidence}
            className="px-5 py-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm tracking-wide transition-colors"
          >
            VIEW EVIDENCE LAB
          </button>
        </div>
      </div>
    </div>
  );
};
