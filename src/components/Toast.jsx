import React, { memo } from 'react';
import { X, TrendingUp, TrendingDown, Info, CheckCircle, AlertTriangle } from 'lucide-react';

const ICONS = {
  success: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
  error:   <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />,
  up:      <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />,
  down:    <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />,
  info:    <Info className="w-4 h-4 text-violet-500 shrink-0" />,
};

const BORDERS = {
  success: 'border-emerald-200 dark:border-emerald-800/60',
  error:   'border-red-200 dark:border-red-800/60',
  up:      'border-emerald-200 dark:border-emerald-800/60',
  down:    'border-red-200 dark:border-red-800/60',
  info:    'border-violet-200 dark:border-violet-800/60',
};

const ToastItem = memo(({ toast, onDismiss }) => (
  <div
    className={`flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] px-4 py-3.5 rounded-2xl shadow-xl
      bg-white dark:bg-slate-900 border ${BORDERS[toast.type] ?? BORDERS.info}
      animate-toastSlide`}
    role="alert"
  >
    {ICONS[toast.type] ?? ICONS.info}
    <div className="flex-1 min-w-0">
      {toast.title && (
        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{toast.title}</p>
      )}
      {toast.message && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{toast.message}</p>
      )}
    </div>
    <button
      onClick={() => onDismiss(toast.id)}
      aria-label="Dismiss notification"
      className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
));
ToastItem.displayName = 'ToastItem';

const ToastContainer = ({ toasts, dismiss }) => {
  if (!toasts.length) return null;
  return (
    <div
      className="fixed bottom-6 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
};

export default memo(ToastContainer);
