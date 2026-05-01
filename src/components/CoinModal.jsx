import React, { useEffect, useCallback, useMemo, useState, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, TrendingUp, TrendingDown, BarChart2, Activity, Coins,
  ArrowUpCircle, ArrowDownCircle, ExternalLink, Award, Zap, Star, Plus, LoaderCircle
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { fetchCoinChartData } from '../services/cryptoApi';

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

const CHART_RANGES = [
  { key: '1', label: '24H' },
  { key: '7', label: '7D' },
  { key: '30', label: '30D' },
  { key: '90', label: '3M' },
];

const InteractivePriceChart = memo(({
  data,
  selectedRange,
  onRangeChange,
  hoverIndex,
  onHoverIndexChange,
}) => {
  if (!data || data.length < 2) return null;

  const width = 420;
  const height = 180;
  const padding = 18;

  const prices = data.map((point) => point[1]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = data.map((point, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = padding + ((max - point[1]) / range) * (height - 2 * padding);
    return { x, y };
  });

  const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  const areaPath = `${linePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const chartIsPositive = endPrice >= startPrice;
  const color = chartIsPositive ? '#10b981' : '#ef4444';
  const gradientId = `chart-gradient-${selectedRange}`;
  const activeIndex = hoverIndex ?? data.length - 1;
  const activePoint = points[activeIndex];
  const activeData = data[activeIndex];

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const normalized = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(normalized * (data.length - 1));
    onHoverIndexChange(index);
  };

  const handleTouchMove = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const normalized = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(normalized * (data.length - 1));
    onHoverIndexChange(index);
  };

  const handleLeave = () => onHoverIndexChange(null);

  const timestamp = activeData?.[0];
  const activePrice = activeData?.[1];

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Live Price Chart
        </p>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg p-1">
          {CHART_RANGES.map((rangeOpt) => (
            <button
              key={rangeOpt.key}
              type="button"
              onClick={() => onRangeChange(rangeOpt.key)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors
                ${selectedRange === rangeOpt.key
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              {rangeOpt.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/40 p-3"
        onMouseMove={handleMove}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchMove}
        onTouchEnd={handleLeave}
        onMouseLeave={handleLeave}
      >
        <AnimatePresence mode="wait">
          <motion.svg
            key={selectedRange}
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.32" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <motion.path
              d={areaPath}
              fill={`url(#${gradientId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.7 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
            {activePoint && (
              <>
                <motion.line
                  x1={activePoint.x}
                  x2={activePoint.x}
                  y1={padding}
                  y2={height - padding}
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  initial={false}
                  animate={{ x1: activePoint.x, x2: activePoint.x, opacity: 0.75 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.45 }}
                />
                <motion.circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="1.5"
                  initial={false}
                  animate={{ cx: activePoint.x, cy: activePoint.y, scale: 1 }}
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.4 }}
                />
              </>
            )}
          </motion.svg>
        </AnimatePresence>

        <motion.div
          key={`${selectedRange}-${activeIndex}`}
          className="mt-2 flex items-center justify-between text-xs"
          initial={{ opacity: 0.4, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <span className={`font-bold ${chartIsPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatPercent(((endPrice - startPrice) / startPrice) * 100)}
          </span>
          <span className="text-slate-500 dark:text-slate-400 tabular-nums">
            {activePrice != null ? formatCurrency(activePrice) : formatCurrency(endPrice)}
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            {timestamp ? new Date(timestamp).toLocaleString() : ''}
          </span>
        </motion.div>
      </div>
    </div>
  );
});
InteractivePriceChart.displayName = 'InteractivePriceChart';

const CoinModal = ({ coin, onClose, isWatched, onWatchlistToggle, onAddToPortfolio }) => {
  const [selectedRange, setSelectedRange] = useState('7');
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [chartError, setChartError] = useState('');

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
  const fallbackSparklineData = useMemo(() => {
    const prices = coin?.sparkline_in_7d?.price;
    if (!prices || prices.length < 2) return [];

    const now = Date.now();
    const windowMs = 7 * 24 * 60 * 60 * 1000;
    const stepMs = windowMs / (prices.length - 1);
    return prices.map((price, index) => [now - windowMs + (index * stepMs), price]);
  }, [coin]);

  // Price range position
  const hasPriceRange = coin?.high_24h && coin?.low_24h && coin?.current_price;
  const displayedChartData = useMemo(() => {
    if (chartData.length > 1) return chartData;
    if (selectedRange === '7' && fallbackSparklineData.length > 1) return fallbackSparklineData;
    return [];
  }, [chartData, selectedRange, fallbackSparklineData]);

  useEffect(() => {
    setSelectedRange('7');
    setHoverIndex(null);
    setChartError('');
  }, [coin?.id]);

  useEffect(() => {
    if (!coin?.id) return undefined;

    let active = true;

    const loadChart = async () => {
      setChartLoading(true);
      setChartError('');
      try {
        const prices = await fetchCoinChartData(coin.id, selectedRange);
        if (active) setChartData(prices);
      } catch (error) {
        if (active) {
          setChartData([]);
          const isRateLimit = error?.response?.status === 429;
          setChartError(isRateLimit
            ? 'Rate limit reached for live chart. Showing cached 7D trend when available.'
            : 'Live chart data is temporarily unavailable.'
          );
        }
      } finally {
        if (active) setChartLoading(false);
      }
    };

    loadChart();

    const interval = setInterval(loadChart, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [coin?.id, selectedRange]);

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

        {/* Interactive Price Chart */}
        {chartLoading && (
          <div className="px-5 pb-4">
            <motion.div
              initial={{ opacity: 0.45, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="h-40 rounded-xl bg-slate-100 dark:bg-slate-800/50 relative overflow-hidden border border-slate-200/70 dark:border-slate-700/50"
            >
              <motion.div
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-white/40 dark:bg-white/10"
                animate={{ x: ['0%', '300%'] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                <LoaderCircle className="w-5 h-5 animate-spin text-violet-500" />
                <p className="text-xs font-medium">Loading chart...</p>
              </div>
            </motion.div>
          </div>
        )}
        {!chartLoading && displayedChartData.length > 1 && (
          <InteractivePriceChart
            data={displayedChartData}
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            hoverIndex={hoverIndex}
            onHoverIndexChange={setHoverIndex}
          />
        )}
        {!chartLoading && displayedChartData.length <= 1 && (
          <div className="px-5 pb-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 p-3 text-xs text-slate-500 dark:text-slate-400">
              {chartError || 'Chart data unavailable right now.'}
            </div>
          </div>
        )}
        {chartError && displayedChartData.length > 1 && (
          <div className="px-5 pb-4 -mt-2">
            <p className="text-[11px] text-amber-600 dark:text-amber-400">{chartError}</p>
          </div>
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
