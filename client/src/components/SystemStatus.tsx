import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { HealthResponse } from '../types';

interface SystemStatusProps {
  health: HealthResponse | null;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ health }) => {
  if (!health || health.apiKeyConfigured) {
    return null;
  }

  return (
    <div className="bg-amber-950/40 border-b border-amber-800/60 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Server Notice:</strong> <code className="font-mono bg-amber-900/60 px-1 py-0.5 rounded">GEMINI_API_KEY</code> is not yet configured.
            Inference requests will return configuration advice.
          </span>
        </div>
        <div className="flex items-center space-x-3 text-amber-400">
          <span>Add key to <code className="font-mono bg-amber-900/60 px-1 py-0.5 rounded">.env</code></span>
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 underline hover:text-amber-200"
          >
            <span>Get Gemini API Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
