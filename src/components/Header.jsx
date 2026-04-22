import React, { memo } from 'react';
import { Moon, Sun, RefreshCw, TrendingUp, Briefcase } from 'lucide-react';
import { formatLastUpdated } from '../utils/formatters';

const REFRESH_INTERVAL = 60;

// SVG circular countdown ring — visual indicator of next auto-refresh
const CountdownRing = memo(({ countdown, isRefreshing }) => {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = countdown / REFRESH_INTERVAL;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center w-8 h-8" title={`Refreshing in ${countdown}s`}>
      <svg className="absolute inset-0 -rotate-90" width="32" height="32" viewBox="0 0 32 32">
        {/* Track */}
        <circle
          cx="16" cy="16" r={radius}
          fill="none"
          strokeWidth="2.5"
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        {/* Progress arc */}
        <circle
          cx="16" cy="16" r={radius}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="stroke-violet-500 transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="relative text-[9px] font-bold text-slate-500 dark:text-slate-400 tabular-nums leading-none">
        {isRefreshing ? (
          <RefreshCw className="w-3 h-3 animate-spin text-violet-500" />
        ) : (
          countdown
        )}
      </span>
    </div>
  );
});
CountdownRing.displayName = 'CountdownRing';

// Animated pill theme toggle
const ThemeToggle = memo(({ isDark, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    className={`
      relative flex items-center w-14 h-7 rounded-full p-0.5 transition-all duration-300 focus:outline-none
      focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950
      ${isDark
        ? 'bg-violet-600 shadow-lg shadow-violet-500/40'
        : 'bg-slate-200 hover:bg-slate-300'
      }
    `}
  >
    {/* Pill knob */}
    <span
      className={`
        flex items-center justify-center w-6 h-6 rounded-full shadow-md transition-all duration-300
        ${isDark ? 'translate-x-7 bg-white' : 'translate-x-0 bg-white'}
      `}
    >
      {isDark
        ? <Moon className="w-3.5 h-3.5 text-violet-600" />
        : <Sun className="w-3.5 h-3.5 text-amber-500" />
      }
    </span>
  </button>
));
ThemeToggle.displayName = 'ThemeToggle';

const Header = ({ isDark, toggleTheme, lastUpdated, countdown, onRefresh, loading, isRefreshing, portfolioCount, onPortfolioOpen }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                CryptoTrack
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                Live Market Data
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Last updated badge */}
            {lastUpdated && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>
                  Updated {formatLastUpdated(lastUpdated)}
                  {isRefreshing && (
                    <span className="ml-1 text-violet-500 font-semibold animate-pulse"> · Refreshing…</span>
                  )}
                </span>
              </div>
            )}

            {/* Circular countdown ring */}
            {lastUpdated && !loading && (
              <CountdownRing countdown={countdown} isRefreshing={isRefreshing} />
            )}

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading || isRefreshing}
              aria-label="Refresh data"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Portfolio Button */}
            <button
              onClick={onPortfolioOpen}
              aria-label="Open portfolio tracker"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Briefcase className="w-4 h-4" />
              {portfolioCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 flex items-center justify-center bg-violet-600 text-white rounded-full text-[9px] font-black px-0.5">
                  {portfolioCount}
                </span>
              )}
            </button>

            {/* Pill Theme Toggle */}
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
