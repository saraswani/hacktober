import React from 'react';
import { JudgeRoleResult } from '../types';
import { ShieldAlert, Award, UserCheck, CheckCheck, HelpCircle } from 'lucide-react';

interface JudgeCardProps {
  judge: JudgeRoleResult;
}

export const JudgeCard: React.FC<JudgeCardProps> = ({ judge }) => {
  const getRoleMeta = () => {
    switch (judge.role) {
      case 'skeptic':
        return {
          title: 'SKEPTIC',
          subtitle: 'Adversarial Auditor & Devil\'s Advocate',
          icon: ShieldAlert,
          colorBorder: 'border-rose-900/60',
          colorBadge: 'bg-rose-950/80 border-rose-700 text-rose-300',
          accentText: 'text-rose-400'
        };
      case 'expert':
        return {
          title: 'DOMAIN EXPERT',
          subtitle: 'Technical Standards Authority',
          icon: Award,
          colorBorder: 'border-amber-900/60',
          colorBadge: 'bg-amber-950/80 border-amber-700 text-amber-300',
          accentText: 'text-amber-400'
        };
      case 'beginner':
        return {
          title: 'BEGINNER',
          subtitle: 'Human Usability & Non-Specialist',
          icon: UserCheck,
          colorBorder: 'border-sky-900/60',
          colorBadge: 'bg-sky-950/80 border-sky-700 text-sky-300',
          accentText: 'text-sky-400'
        };
      case 'verifier':
        return {
          title: 'VERIFIER',
          subtitle: 'Formal Logic & Fact Entailment',
          icon: CheckCheck,
          colorBorder: 'border-emerald-900/60',
          colorBadge: 'bg-emerald-950/80 border-emerald-700 text-emerald-300',
          accentText: 'text-emerald-400'
        };
      default:
        return {
          title: 'JUDGE',
          subtitle: 'Independent Perspective',
          icon: HelpCircle,
          colorBorder: 'border-slate-800',
          colorBadge: 'bg-slate-800 text-slate-300',
          accentText: 'text-slate-400'
        };
    }
  };

  const meta = getRoleMeta();
  const Icon = meta.icon;

  const getVerdictStyle = (v: string) => {
    const val = v.toUpperCase();
    if (val === 'PASS') return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    if (val === 'FAIL') return 'text-rose-400 bg-rose-950/60 border-rose-800';
    if (val === 'WARNING') return 'text-amber-400 bg-amber-950/60 border-amber-800';
    return 'text-slate-400 bg-slate-900 border-slate-800';
  };

  return (
    <div className={`card-technical rounded-lg p-5 border ${meta.colorBorder} flex flex-col justify-between space-y-4`}>
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className={`p-1.5 rounded bg-slate-900 border border-slate-800 ${meta.accentText}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-wider text-white uppercase">{meta.title}</h4>
              <p className="text-[10px] text-slate-400">{meta.subtitle}</p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold border ${getVerdictStyle(
              judge.verdict
            )}`}
          >
            {judge.verdict}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 font-mono block">Score</span>
            <span className="text-xl font-mono font-bold text-white">{judge.score}</span>
            <span className="text-[10px] text-slate-500"> / 100</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 font-mono block">Confidence</span>
            <span className="text-xl font-mono font-bold text-slate-200">{judge.confidence}%</span>
          </div>
        </div>

        {/* Key Concern highlight */}
        {judge.concerns && judge.concerns.length > 0 && (
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/90 my-2">
            <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block mb-1">
              Primary Concern
            </span>
            <p className="text-xs text-rose-300/90 leading-tight">
              {judge.concerns[0]}
            </p>
          </div>
        )}

        {/* Short Reasoning */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Deliberation Reasoning
          </span>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded border border-slate-800/60">
            {judge.reasoning}
          </p>
        </div>
      </div>

      {/* Key Points */}
      {judge.key_points && judge.key_points.length > 0 && (
        <div className="pt-2 border-t border-slate-800/60">
          <span className="text-[10px] text-slate-400 block mb-1">Key Points:</span>
          <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc list-inside">
            {judge.key_points.slice(0, 2).map((kp, idx) => (
              <li key={idx} className="truncate">{kp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
