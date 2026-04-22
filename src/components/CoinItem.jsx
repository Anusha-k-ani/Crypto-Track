import React, { memo, useCallback } from 'react';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

const PriceBadge = memo(({ value }) => {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
        ${isPositive
          ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
          : 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400'
        }`}
    >
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {formatPercent(value)}
    </span>
  );
});
PriceBadge.displayName = 'PriceBadge';

// Watchlist Star Button
const StarButton = memo(({ isWatched, onToggle, coinId, coinName }) => {
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onToggle(coinId);
  }, [onToggle, coinId]);

  return (
    <button
      onClick={handleClick}
      aria-label={isWatched ? `Remove ${coinName} from watchlist` : `Add ${coinName} to watchlist`}
      aria-pressed={isWatched}
      className={`transition-all duration-200 hover:scale-125 focus:outline-none
        ${isWatched
          ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
          : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
        }`}
    >
      <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-400' : ''}`} />
    </button>
  );
});
StarButton.displayName = 'StarButton';

// Desktop Table Row — memoized so it only re-renders when its own coin prop changes
export const CoinRow = memo(({ coin, rank, onClick, isFlashing, isWatched, onWatchlistToggle }) => {
  const change = coin.price_change_percentage_24h;

  return (
    <tr
      onClick={() => onClick(coin)}
      className={`
        border-b border-slate-100 dark:border-slate-800/60
        hover:bg-violet-50/50 dark:hover:bg-violet-900/10
        cursor-pointer transition-colors group
        ${isFlashing ? 'animate-priceFlash' : ''}
      `}
    >
      {/* Watchlist star */}
      <td className="px-4 py-3.5">
        <StarButton
          isWatched={isWatched}
          onToggle={onWatchlistToggle}
          coinId={coin.id}
          coinName={coin.name}
        />
      </td>

      {/* Rank */}
      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">{rank}</span>
      </td>

      {/* Asset */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <img
            src={coin.image}
            alt={coin.name}
            className="w-9 h-9 rounded-full shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
            loading="lazy"
          />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {coin.name}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-medium tracking-wide">
              {coin.symbol}
            </p>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-4 py-3.5 text-right">
        <span className={`text-sm font-semibold tabular-nums transition-colors
          ${isFlashing ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-white'}
        `}>
          {formatCurrency(coin.current_price)}
        </span>
      </td>

      {/* 24h Change */}
      <td className="px-4 py-3.5 text-right">
        <PriceBadge value={change} />
      </td>

      {/* Market Cap */}
      <td className="px-4 py-3.5 text-right hidden md:table-cell">
        <span className="text-sm text-slate-600 dark:text-slate-300 tabular-nums font-medium">
          {formatCurrency(coin.market_cap, { compact: true })}
        </span>
      </td>

      {/* Volume */}
      <td className="px-4 py-3.5 text-right hidden lg:table-cell">
        <span className="text-sm text-slate-600 dark:text-slate-300 tabular-nums font-medium">
          {formatCurrency(coin.total_volume, { compact: true })}
        </span>
      </td>
    </tr>
  );
});
CoinRow.displayName = 'CoinRow';

// Mobile Card — memoized
export const CoinCard = memo(({ coin, rank, onClick, isFlashing, isWatched, onWatchlistToggle }) => {
  const change = coin.price_change_percentage_24h;

  return (
    <div
      onClick={() => onClick(coin)}
      className={`
        rounded-2xl border border-slate-100 dark:border-slate-800
        bg-white dark:bg-slate-900
        hover:border-violet-300 dark:hover:border-violet-700
        hover:shadow-md hover:shadow-violet-500/10
        cursor-pointer transition-all duration-200 p-4
        group
        ${isFlashing ? 'animate-priceFlash' : ''}
      `}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-4 shrink-0">
          {rank}
        </span>
        <img
          src={coin.image}
          alt={coin.name}
          className="w-10 h-10 rounded-full shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {coin.name}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-medium tracking-wide">
            {coin.symbol}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PriceBadge value={change} />
          <StarButton
            isWatched={isWatched}
            onToggle={onWatchlistToggle}
            coinId={coin.id}
            coinName={coin.name}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-7">
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-0.5">Price</p>
          <p className={`text-sm font-bold tabular-nums transition-colors
            ${isFlashing ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-white'}
          `}>
            {formatCurrency(coin.current_price)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-0.5">Market Cap</p>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
            {formatCurrency(coin.market_cap, { compact: true })}
          </p>
        </div>
      </div>
    </div>
  );
});
CoinCard.displayName = 'CoinCard';
