import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/15 mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {message || 'Failed to fetch cryptocurrency data. Please check your connection and try again.'}
      </p>
      <button
        onClick={onRetry}
        className="
          flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
          bg-violet-600 hover:bg-violet-700 active:bg-violet-800
          text-white shadow-lg shadow-violet-500/30
          transition-all duration-200
        "
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
};

export default ErrorMessage;
