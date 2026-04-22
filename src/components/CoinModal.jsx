import React, { useEffect, useCallback, useMemo, memo } from 'react';
import {
  X, TrendingUp, TrendingDown, BarChart2, Activity, Coins,
  ArrowUpCircle, ArrowDownCircle, ExternalLink, Award, Zap, Star, Plus
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

// Memoized stat block
const StatBlock = memo(({ icon: Icon, label, value, subValue, iconClass = '', accent = false }) => (
  <div className={`flex flex-col gap-1.5 p-4 rounded-xl border transition-all duration-200
    ${accent
      ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/50'
      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/50'
    }
  `}>
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
      {label}
    </div>
    <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums leading-tight">
      {value}
    </p>
    {subValue && (
      <p className="text-xs text-slate-400 dark:text-slate-500">{subValue}</p>
    )}
  </div>
));
StatBlock.displayName = 'StatBlock';

// 24h Price Range Bar
const PriceRangeBar = memo(({ low, high, current }) => {
  const range = high - low;
  const position = range > 0 ? ((current - low) / range) * 100 : 50;
  const clampedPosition = Math.min(100, Math.max(0, position));

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-2">
        <span className="font-semibold text-red-500">{formatCurrency(low)}</span>
        <span className="font-medium uppercase tracking-wider">24h Range</span>
        <span className="font-semibold text-emerald-500">{formatCurrency(high)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400">
        {/* Current price marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-violet-500 shadow-md shadow-violet-500/30 transition-all duration-500"
          style={{ left: `${clampedPosition}%` }}
          title={`Current: ${formatCurrency(current)}`}
        />
      </div>
      <div className="flex justify-center mt-2">
        <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
          Current: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(current)}</strong>
          {' '}· <span className="text-violet-500 font-semibold">{clampedPosition.toFixed(1)}%</span> of range
        </span>
      </div>
    </div>
  );
});
PriceRangeBar.displayName = 'PriceRangeBar';

// Mini sparkline using SVG path
const MiniSparkline = memo(({ data, isPositive }) => {
  if (!data || data.length < 2) return null;

  const width = 240;
  const height = 48;
  const padding = 4;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = padding + ((max - val) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const color = isPositive ? '#10b981' : '#ef4444';
  const gradientId = `sparkline-gradient-${isPositive ? 'up' : 'down'}`;

  // Area fill path
  const areaD = `M ${points[0]} L ${points.join(' L ')} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className="px-5 pb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
        7-Day Trend
      </p>
      <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/40 p-2">
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />
          {/* Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Last point dot */}
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="3"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
});
MiniSparkline.displayName = 'MiniSparkline';

const CoinModal = ({ coin, onClose, isWatched, onWatchlistToggle, onAddToPortfolio }) => {
  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [handleEsc]);

  // Memoize computed values
  const change24h = coin?.price_change_percentage_24h;
  const change7d = coin?.price_change_percentage_7d_in_currency;
  const isPositive = useMemo(() => (change24h ?? 0) >= 0, [change24h]);
  const is7dPositive = useMemo(() => (change7d ?? 0) >= 0, [change7d]);

  // Derive sparkline from ATH/ATL context (synthetic 7-day trend from available data)
  const sparklineData = useMemo(() => {
    if (!coin) return null;
    return coin.sparkline_in_7d?.price ?? null;
  }, [coin]);

  // Price range position
  const hasPriceRange = coin?.high_24h && coin?.low_24h && coin?.current_price;

  if (!coin) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="
        relative w-full sm:max-w-lg
        bg-white dark:bg-slate-900
        sm:rounded-2xl rounded-t-3xl
        shadow-2xl shadow-black/30
        border border-slate-200 dark:border-slate-700
        overflow-hidden
        animate-slideUp sm:animate-fadeScale
        max-h-[92vh] overflow-y-auto
      ">
        {/* Drag Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 px-5 pt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-12 h-12 rounded-full ring-2 ring-violet-200 dark:ring-violet-800"
            />
            {/* Rank badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-600 text-white text-[9px] font-black flex items-center justify-center shadow">
              #{coin.market_cap_rank}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="modal-title"
              className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate"
            >
              {coin.name}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-widest">
              {coin.symbol}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* 24h badge */}
            <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold
              ${isPositive
                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400'
              }`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {formatPercent(change24h)}
            </span>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Price Hero */}
        <div className="px-5 py-5 text-center bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-widest mb-1">Current Price</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums mb-2">
            {formatCurrency(coin.current_price)}
          </p>
          {/* 7d change badge */}
          {change7d != null && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
              ${is7dPositive
                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400'
              }`}
            >
              {is7dPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatPercent(change7d)} 7d
            </span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          {/* Watchlist toggle */}
          <button
            onClick={() => onWatchlistToggle?.(coin.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all duration-200
              ${isWatched
                ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700'
              }`}
          >
            <Star className={`w-4 h-4 ${isWatched ? 'fill-amber-400 text-amber-400' : ''}`} />
            {isWatched ? 'Watchlisted' : 'Watchlist'}
          </button>

          {/* Add to portfolio */}
          {onAddToPortfolio && (
            <button
              onClick={() => onAddToPortfolio(coin)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold
                bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-md shadow-violet-500/20"
            >
              <Plus className="w-4 h-4" />
              Add to Portfolio
            </button>
          )}
        </div>

        {/* 24h Price Range Bar */}
        {hasPriceRange && (
          <PriceRangeBar
            low={coin.low_24h}
            high={coin.high_24h}
            current={coin.current_price}
          />
        )}

        {/* 7-Day Sparkline */}
        {sparklineData && sparklineData.length > 1 && (
          <MiniSparkline data={sparklineData} isPositive={isPositive} />
        )}

        {/* Stats Grid */}
        <div className="px-5 pb-4 grid grid-cols-2 gap-3">
          <StatBlock
            icon={ArrowUpCircle}
            label="24h High"
            value={formatCurrency(coin.high_24h)}
            iconClass="text-emerald-500"
          />
          <StatBlock
            icon={ArrowDownCircle}
            label="24h Low"
            value={formatCurrency(coin.low_24h)}
            iconClass="text-red-500"
          />
          <StatBlock
            icon={BarChart2}
            label="Market Cap"
            value={formatCurrency(coin.market_cap, { compact: true })}
            subValue={`Rank #${coin.market_cap_rank}`}
            iconClass="text-violet-500"
          />
          <StatBlock
            icon={Activity}
            label="24h Volume"
            value={formatCurrency(coin.total_volume, { compact: true })}
            subValue={`${((coin.total_volume / coin.market_cap) * 100).toFixed(1)}% of MCap`}
            iconClass="text-blue-500"
          />
          <StatBlock
            icon={Coins}
            label="Circulating Supply"
            value={`${formatNumber(coin.circulating_supply, { compact: true })} ${coin.symbol.toUpperCase()}`}
            subValue={coin.max_supply
              ? `${((coin.circulating_supply / coin.max_supply) * 100).toFixed(1)}% of max`
              : 'No max supply'
            }
            iconClass="text-amber-500"
          />
          {coin.ath && (
            <StatBlock
              icon={Award}
              label="All-Time High"
              value={formatCurrency(coin.ath)}
              subValue={coin.ath_change_percentage != null
                ? `${formatPercent(coin.ath_change_percentage)} from ATH`
                : undefined
              }
              iconClass="text-yellow-500"
            />
          )}
        </div>

        {/* ATL Row */}
        {coin.atl && (
          <div className="px-5 pb-5">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
              <Zap className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">All-Time Low</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(coin.atl)}
                </p>
              </div>
              {coin.atl_change_percentage != null && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                  +{Math.abs(coin.atl_change_percentage).toLocaleString(undefined, { maximumFractionDigits: 0 })}% from ATL
                </span>
              )}
            </div>
          </div>
        )}

        {/* CoinGecko link */}
        <div className="px-5 pb-5">
          <a
            href={`https://www.coingecko.com/en/coins/${coin.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold
              text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60
              hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            View on CoinGecko
          </a>
        </div>
      </div>
    </div>
  );
};

export default memo(CoinModal);
