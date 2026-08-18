import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="glass-panel p-10 rounded-2xl border border-rose-500/30 text-center max-w-md mx-auto my-12 bg-rose-950/20">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-white mb-2">Unable to connect to Ingestion API</h3>
      <p className="text-xs text-rose-200/70 mb-6 leading-relaxed">
        {message || 'The ingestion backend is currently unreachable. Please check if the FastAPI server is running.'}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Retry Connection</span>
      </button>
    </div>
  );
};
