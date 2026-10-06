import React from 'react';
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';

export interface PipelineStage {
  id: number;
  label: string;
  sublabel: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 1, label: 'Single Baseline', sublabel: 'Neutral Gemma 4 pass' },
  { id: 2, label: 'Skeptic Analyzing', sublabel: 'Hunting flaws & assumptions' },
  { id: 3, label: 'Domain Expert Analyzing', sublabel: 'Auditing standards & depth' },
  { id: 4, label: 'Beginner Analyzing', sublabel: 'Testing clarity & usability' },
  { id: 5, label: 'Verifier Analyzing', sublabel: 'Validating logic & claims' },
  { id: 6, label: 'Reconciling Disagreements', sublabel: 'Consensus judge deliberation' },
  { id: 7, label: 'Final Verdict', sublabel: 'Synthesized determination' }
];

interface ExecutionPipelineStepperProps {
  currentStage: number; // 1 to 7 (or 8 when complete)
  isRunning: boolean;
  failedStage?: number;
}

export const ExecutionPipelineStepper: React.FC<ExecutionPipelineStepperProps> = ({
  currentStage,
  isRunning,
  failedStage
}) => {
  if (!isRunning && currentStage === 0) {
    return null;
  }

  return (
    <div className="card-technical p-4 rounded-lg my-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Deliberation Pipeline
        </span>
        <span className="code-tag text-purple-400 text-xs">
          {currentStage > 7 ? 'Complete' : `Stage ${currentStage} of 7`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const isDone = currentStage > stage.id;
          const isCurrent = currentStage === stage.id && isRunning;
          const isPending = currentStage < stage.id;
          const isFailed = failedStage === stage.id;

          let badgeColor = 'bg-slate-900 border-slate-800 text-slate-500';
          if (isDone) badgeColor = 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400';
          if (isCurrent) badgeColor = 'bg-purple-950/60 border-purple-600 text-purple-300 shadow-sm';
          if (isFailed) badgeColor = 'bg-rose-950/50 border-rose-800 text-rose-400';

          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded border transition-all text-left flex flex-col justify-between ${badgeColor}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="code-tag font-bold text-[11px]">S{stage.id}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isCurrent && <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />}
                {isPending && <Circle className="w-3 h-3 text-slate-600" />}
                {isFailed && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 truncate">{stage.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{stage.sublabel}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
