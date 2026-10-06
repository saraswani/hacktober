import React, { useState } from 'react';
import { DEMO_PRESETS } from '../data/demoPresets';
import { ExecutionPipelineStepper } from '../components/ExecutionPipelineStepper';
import { SideBySideComparison } from '../components/SideBySideComparison';
import { BothRunResponse, SingleJudgeResult, MultiJudgeResponse } from '../types';
import { Sparkles, Image, X, Play, AlertCircle } from 'lucide-react';

interface JudgeViewProps {
  onRunBoth: (prompt: string, imageBase64?: string, mimeType?: string) => Promise<BothRunResponse>;
  onRunSingle: (prompt: string, imageBase64?: string, mimeType?: string) => Promise<SingleJudgeResult>;
  onRunMulti: (prompt: string, imageBase64?: string, mimeType?: string) => Promise<MultiJudgeResponse>;
  onViewJuryRoom: () => void;
  lastBothResult: BothRunResponse | null;
  lastSingleResult: SingleJudgeResult | null;
  lastMultiResult: MultiJudgeResponse | null;
}

export const JudgeView: React.FC<JudgeViewProps> = ({
  onRunBoth,
  onRunSingle,
  onRunMulti,
  onViewJuryRoom,
  lastBothResult,
  lastSingleResult,
  lastMultiResult
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [selectedDemo, setSelectedDemo] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Demo preset selection
  const handleLoadDemo = (presetId: string) => {
    setSelectedDemo(presetId);
    const found = DEMO_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setPrompt(found.prompt);
      setImageBase64(undefined);
      setImagePreview(null);
      setErrorMsg(null);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPEG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 8MB limit.');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Strip data:image/...;base64, prefix
      const base64Data = result.split(',')[1];
      setImageBase64(base64Data);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageBase64(undefined);
    setImagePreview(null);
  };

  // Execution Handlers with simulated stage animation for realistic feedback
  const handleExecuteBoth = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Please enter a problem or text to evaluate.');
      return;
    }
    setErrorMsg(null);
    setIsRunning(true);
    setCurrentStage(1);

    // Progression timer to advance stages visually while API resolves
    const stageInterval = setInterval(() => {
      setCurrentStage((prev: number) => (prev < 6 ? prev + 1 : prev));
    }, 900);

    try {
      await onRunBoth(prompt, imageBase64, mimeType);
      clearInterval(stageInterval);
      setCurrentStage(8); // Completed
    } catch (err: any) {
      clearInterval(stageInterval);
      setErrorMsg(err?.message || 'Execution failed.');
      setCurrentStage(0);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExecuteSingle = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Please enter a problem or text to evaluate.');
      return;
    }
    setErrorMsg(null);
    setIsRunning(true);
    setCurrentStage(1);

    try {
      await onRunSingle(prompt, imageBase64, mimeType);
      setCurrentStage(8);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Single baseline execution failed.');
      setCurrentStage(0);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExecuteMulti = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Please enter a problem or text to evaluate.');
      return;
    }
    setErrorMsg(null);
    setIsRunning(true);
    setCurrentStage(2);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev: number) => (prev < 6 ? prev + 1 : prev));
    }, 1000);

    try {
      await onRunMulti(prompt, imageBase64, mimeType);
      clearInterval(stageInterval);
      setCurrentStage(8);
    } catch (err: any) {
      clearInterval(stageInterval);
      setErrorMsg(err?.message || 'Multi-judge execution failed.');
      setCurrentStage(0);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Demo Bar */}
      <div className="card-technical p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-semibold">Curated Demonstrations:</span>
          <span className="text-slate-400">Preloaded real-world scenarios</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {DEMO_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleLoadDemo(p.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                selectedDemo === p.id
                  ? 'bg-purple-900/60 border-purple-500 text-white font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Workstation */}
      <div className="card-technical p-5 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="promptInput" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Problem / Query / Code Input
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {prompt.length} characters
          </span>
        </div>

        <textarea
          id="promptInput"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a problem statement, code snippet, architectural decision, or policy dilemma to submit to the Gemma 4 jury..."
          rows={7}
          className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-600 transition-colors"
        />

        {/* Optional Image Upload Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-3">
            <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-300 transition-colors">
              <Image className="w-3.5 h-3.5 text-slate-400" />
              <span>Attach Image / UI Screenshot</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <div className="flex items-center space-x-2 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-xs">
                <img src={imagePreview} alt="Preview" className="w-6 h-6 object-cover rounded" />
                <span className="text-[11px] text-slate-300 font-mono">Image Loaded</span>
                <button onClick={clearImage} className="text-slate-500 hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Action Button Bar */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleExecuteSingle}
              disabled={isRunning || !prompt.trim()}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
            >
              Run Single Model
            </button>
            <button
              onClick={handleExecuteMulti}
              disabled={isRunning || !prompt.trim()}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
            >
              Run Multi-Judge
            </button>
            <button
              onClick={handleExecuteBoth}
              disabled={isRunning || !prompt.trim()}
              className="flex-1 sm:flex-initial px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Both (Compare)</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Deliberation Pipeline Stepper */}
      <ExecutionPipelineStepper currentStage={currentStage} isRunning={isRunning} />

      {/* Results Display */}
      {lastBothResult && (
        <SideBySideComparison data={lastBothResult} onViewJuryRoom={onViewJuryRoom} />
      )}

      {/* When only Single Model was run */}
      {!lastBothResult && lastSingleResult && (
        <div className="card-technical p-5 rounded-lg border border-slate-800 space-y-4 my-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Baseline (Single Call)
              </span>
              <h3 className="text-base font-bold text-white">Single Gemma Result</h3>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-850 border border-slate-700 text-slate-200 font-mono text-xs font-bold">
              {lastSingleResult.verdict}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Score</span>
              <span className="text-2xl font-mono font-bold text-slate-200">{lastSingleResult.score}</span>
              <span className="text-[10px] text-slate-500"> / 100</span>
            </div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Confidence</span>
              <span className="text-2xl font-mono font-bold text-slate-200">{lastSingleResult.confidence}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded border border-slate-800">
            {lastSingleResult.reasoning}
          </p>
        </div>
      )}

      {/* When only Multi-Judge was run */}
      {!lastBothResult && lastMultiResult && (
        <div className="card-technical p-5 rounded-lg border border-purple-900/60 space-y-4 my-6 bg-purple-950/10">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
                4-Judge Jury & Consensus
              </span>
              <h3 className="text-base font-bold text-white">Multi-Judge Deliberation</h3>
            </div>
            <span className="px-2.5 py-1 rounded bg-purple-950 border border-purple-700 text-purple-300 font-mono text-xs font-bold">
              {lastMultiResult.consensus.final_verdict}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-3 rounded bg-slate-900 border border-purple-900/40">
              <span className="text-[11px] text-purple-300 block mb-1">Consensus Score</span>
              <span className="text-2xl font-mono font-bold text-white">{lastMultiResult.consensus.final_score}</span>
            </div>
            <div className="p-3 rounded bg-slate-900 border border-purple-900/40">
              <span className="text-[11px] text-purple-300 block mb-1">Jury Agreement</span>
              <span className="text-2xl font-mono font-bold text-purple-300">{lastMultiResult.consensus.agreement_percent}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded border border-purple-900/40">
            {lastMultiResult.consensus.summary}
          </p>
          <div className="pt-2 text-right">
            <button
              onClick={onViewJuryRoom}
              className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Examine Full Jury Room →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
