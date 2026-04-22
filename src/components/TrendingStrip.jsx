import React, { useMemo, memo } from 'react';
import { TrendingUp, TrendingDown, Flame, Snowflake } from 'lucide-react';
import { formatPercent } from '../utils/formatters';

const TrendingStrip = memo(({ coins }) => {
  const { gainers, losers } = useMemo(() => {
    if (!coins || coins.length < 4) return { gainers: [], losers: [] };
    const sorted = [...coins].sort(
      (a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
    );
    return {
      gainers: sorted.slice(0, 3),
      losers: sorted.slice(-3).reverse(),
    };
  }, [coins]);

  if (!gainers.length) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Top Gainers */}
      <div className="flex-1 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Top Gainers 24h</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {gainers.map((c) => (
            <div key={c.id} className="flex items-center gap-2 min-w-0">
              <img src={c.image} alt={c.name} className="w-6 h-6 rounded-full shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{c.symbol}</p>
                <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-bold">{formatPercent(c.price_change_percentage_24h)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div className="flex-1 rounded-2xl border border-red-100 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Snowflake className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-red-700 dark:text-red-400">Top Losers 24h</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {losers.map((c) => (
            <div key={c.id} className="flex items-center gap-2 min-w-0">
              <img src={c.image} alt={c.name} className="w-6 h-6 rounded-full shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{c.symbol}</p>
                <div className="flex items-center gap-0.5 text-red-500 dark:text-red-400">
                  <TrendingDown className="w-3 h-3" />
                  <span className="text-xs font-bold">{formatPercent(c.price_change_percentage_24h)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

TrendingStrip.displayName = 'TrendingStrip';
export default TrendingStrip;
