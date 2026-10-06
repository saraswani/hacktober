import React from 'react';
import { JudgeRoleResult, ConsensusResult } from '../types';
import { JudgeCard } from '../components/JudgeCard';
import { DisagreementAlert } from '../components/DisagreementAlert';
import { ConsensusBanner } from '../components/ConsensusBanner';
import { Users, ArrowLeft } from 'lucide-react';

interface JuryRoomViewProps {
  judges: JudgeRoleResult[] | null;
  consensus: ConsensusResult | null;
  onNavigateToJudge: () => void;
}

export const JuryRoomView: React.FC<JuryRoomViewProps> = ({
  judges,
  consensus,
  onNavigateToJudge
}) => {
  if (!judges || !consensus) {
    return (
      <div className="card-technical p-10 rounded-lg text-center space-y-4 my-8">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-purple-400">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Jury Room Awaiting Deliberation</h3>
        <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed">
          The four Gemma 4 jury instances (Skeptic, Domain Expert, Beginner, Verifier) have not yet deliberated on an input.
          Submit a problem in the <strong>Judge</strong> tab to convene the jury.
        </p>
        <button
          onClick={onNavigateToJudge}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go to Judge & Convene Jury</span>
        </button>
      </div>
    );
  }

  // Count agreeing judges with final verdict
  const agreeingJudgesCount = judges.filter(
    (j) => j.available && j.verdict.toUpperCase() === consensus.final_verdict.toUpperCase()
  ).length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="code-tag text-purple-400 uppercase text-[11px] font-semibold">
            Section 2: Multi-Agent Deliberation
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">The Jury Room</h2>
          <p className="text-xs text-slate-400">
            Four independent Gemma 4 personas independently auditing the problem from adversarial, expert, usability, and verification angles.
          </p>
        </div>

        <button
          onClick={onNavigateToJudge}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs text-slate-300 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Evaluate Another Input</span>
        </button>
      </div>

      {/* Disagreement Callout Alert */}
      <DisagreementAlert judges={judges} disagreements={consensus.disagreements || []} />

      {/* Four Independent Persona Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Independent Jury Stances (No Cross-Contamination)
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            4 Isolated Prompts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {judges.map((j) => (
            <JudgeCard key={j.role} judge={j} />
          ))}
        </div>
      </div>

      {/* Consensus Verdict Banner */}
      <ConsensusBanner
        consensus={consensus}
        totalJudges={judges.filter((j) => j.available).length}
        agreeingJudgesCount={agreeingJudgesCount}
      />
    </div>
  );
};
