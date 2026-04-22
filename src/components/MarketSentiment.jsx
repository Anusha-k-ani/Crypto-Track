import React, { useMemo, memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Sentiment computed from: % of coins with positive 24h change (weighted by market cap)
 * Returns a score 0-100 and a label.
 */
const computeSentiment = (coins) => {
  if (!coins || !coins.length) return { score: 50, label: 'Neutral', sublabel: '' };
  const total = coins.reduce((s, c) => s + (c.market_cap || 0), 0);
  const bullish = coins
    .filter((c) => (c.price_change_percentage_24h ?? 0) > 0)
    .reduce((s, c) => s + (c.market_cap || 0), 0);
  const score = total > 0 ? Math.round((bullish / total) * 100) : 50;

  let label, sublabel;
  if (score >= 75)      { label = 'Extreme Greed';  sublabel = 'Market running hot' }
  else if (score >= 60) { label = 'Greed';           sublabel = 'Bulls in control' }
  else if (score >= 45) { label = 'Neutral';         sublabel = 'Balanced market' }
  else if (score >= 30) { label = 'Fear';            sublabel = 'Bears in control' }
  else                  { label = 'Extreme Fear';    sublabel = 'Strong sell-off' }

  return { score, label, sublabel };
};

const GAUGE_COLORS = [
  '#ef4444', // 0-20  red
  '#f97316', // 20-40 orange
  '#eab308', // 40-60 yellow
  '#22c55e', // 60-80 green
  '#10b981', // 80-100 emerald
];

const getColor = (score) => {
  const idx = Math.min(4, Math.floor(score / 20));
  return GAUGE_COLORS[idx];
};

// SVG half-donut gauge
const GaugeSVG = memo(({ score }) => {
  const r = 44;
  const cx = 56;
  const cy = 56;
  const circumference = Math.PI * r; // half circle
  const fillLength = (score / 100) * circumference;
  const color = getColor(score);
  // Needle angle: -90deg (left) to +90deg (right)
  const angleDeg = -90 + (score / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const needleLen = 34;
  const nx = cx + needleLen * Math.cos(angleRad);
  const ny = cy + needleLen * Math.sin(angleRad);

  return (
    <svg width="112" height="64" viewBox="0 0 112 64" aria-hidden="true">
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        className="text-slate-200 dark:text-slate-700"
      />
      {/* Fill */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${fillLength} ${circumference}`}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.5s' }}
      />
      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={nx} y2={ny}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transition: 'x2 0.8s cubic-bezier(0.4,0,0.2,1), y2 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.5s' }}
      />
      <circle cx={cx} cy={cy} r="4" fill={color} style={{ transition: 'fill 0.5s' }} />
      {/* Score */}
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={color} style={{ transition: 'fill 0.5s' }}>
        {score}
      </text>
    </svg>
  );
});
GaugeSVG.displayName = 'GaugeSVG';

const gainerIcon = (pct) => {
  if (pct > 0) return <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />;
  if (pct < 0) return <TrendingDown className="w-3 h-3 text-red-500 shrink-0" />;
  return <Minus className="w-3 h-3 text-slate-400 shrink-0" />;
};

const MarketSentiment = memo(({ coins }) => {
  const { score, label, sublabel } = useMemo(() => computeSentiment(coins), [coins]);

  // Top gainer & loser
  const { topGainer, topLoser } = useMemo(() => {
    if (!coins || !coins.length) return {};
    const sorted = [...coins].sort(
      (a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
    );
    return { topGainer: sorted[0], topLoser: sorted[sorted.length - 1] };
  }, [coins]);

  const color = getColor(score);

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-6">
      {/* Gauge */}
      <div className="flex flex-col items-center justify-center gap-1 sm:pr-4 sm:border-r border-slate-100 dark:border-slate-800">
        <GaugeSVG score={score} />
        <p className="text-sm font-black" style={{ color }}>{label}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">{sublabel}</p>
      </div>

      {/* Mini stats */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 items-center sm:pl-4">
        {/* Bullish % */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bullish</span>
          <span className="text-lg font-black text-emerald-500">{score}%</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">of market cap</span>
        </div>
        {/* Top Gainer */}
        {topGainer && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Top Gainer</span>
            <div className="flex items-center gap-1">
              <img src={topGainer.image} alt={topGainer.name} className="w-4 h-4 rounded-full" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">{topGainer.symbol.toUpperCase()}</span>
              {gainerIcon(topGainer.price_change_percentage_24h)}
            </div>
            <span className="text-xs font-semibold text-emerald-500">
              +{topGainer.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </div>
        )}
        {/* Top Loser */}
        {topLoser && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Top Loser</span>
            <div className="flex items-center gap-1">
              <img src={topLoser.image} alt={topLoser.name} className="w-4 h-4 rounded-full" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">{topLoser.symbol.toUpperCase()}</span>
              {gainerIcon(topLoser.price_change_percentage_24h)}
            </div>
            <span className="text-xs font-semibold text-red-500">
              {topLoser.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

MarketSentiment.displayName = 'MarketSentiment';
export default MarketSentiment;
