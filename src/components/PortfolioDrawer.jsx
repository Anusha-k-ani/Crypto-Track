import React, { useState, useCallback, memo } from 'react';
import { X, Briefcase, TrendingUp, TrendingDown, Trash2, Plus, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

const PnlBadge = ({ value }) => {
  const pos = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold
      ${pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
      {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
};

const AddHoldingForm = memo(({ coins, onAdd, onCancel }) => {
  const [coinId, setCoinId] = useState('');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const selectedCoin = coins.find((c) => c.id === coinId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!coinId || !amount || !buyPrice) return;
    onAdd(coinId, amount, buyPrice);
    setCoinId(''); setAmount(''); setBuyPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Add Position</p>

      {/* Coin selector */}
      <select
        value={coinId}
        onChange={(e) => {
          setCoinId(e.target.value);
          const c = coins.find((x) => x.id === e.target.value);
          if (c) setBuyPrice(c.current_price.toString());
        }}
        required
        className="w-full text-sm px-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
          text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
      >
        <option value="">Select coin…</option>
        {coins.map((c) => (
          <option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full text-sm px-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition placeholder:text-slate-400"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Buy price"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            required
            className="w-full text-sm pl-6 pr-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition placeholder:text-slate-400"
          />
        </div>
      </div>

      {selectedCoin && amount && buyPrice && (
        <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700/50">
          Current value: <strong className="text-slate-900 dark:text-white">
            {formatCurrency(selectedCoin.current_price * parseFloat(amount || 0))}
          </strong>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit"
          className="flex-1 py-2 text-sm font-bold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors">
          Add Position
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
});
AddHoldingForm.displayName = 'AddHoldingForm';

const PortfolioDrawer = ({ isOpen, onClose, portfolioStats, coins, addHolding, removeHolding }) => {
  const [showForm, setShowForm] = useState(false);
  const handleAdd = useCallback((id, amount, buyPrice) => {
    addHolding(id, amount, buyPrice);
    setShowForm(false);
  }, [addHolding]);

  if (!isOpen) return null;

  const { totalValue, totalCost, pnl, pnlPct, positions } = portfolioStats;
  const isPnlPos = pnl >= 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white dark:bg-slate-950 shadow-2xl flex flex-col animate-drawerSlide border-l border-slate-200 dark:border-slate-800"
        aria-label="Portfolio tracker"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">My Portfolio</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{positions.length} position{positions.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close portfolio"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        {positions.length > 0 && (
          <div className="px-5 py-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider mb-1">Total Value</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(totalValue)}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <PnlBadge value={pnlPct} />
              <span className={`text-xs font-semibold ${isPnlPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPnlPos ? '+' : ''}{formatCurrency(pnl)} P&L
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Cost Basis</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Positions list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {positions.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-violet-500" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">No positions yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Track your crypto investments and see live P&L</p>
            </div>
          )}

          {positions.map((pos) => (
            <div key={pos.coin.id}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group">
              <img src={pos.coin.image} alt={pos.coin.name} className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{pos.coin.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">{pos.coin.symbol}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pos.amount} · Bought @ {formatCurrency(pos.buyPrice)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{formatCurrency(pos.currentValue)}</p>
                <PnlBadge value={pos.pnlPct} />
              </div>
              <button
                onClick={() => removeHolding(pos.coin.id)}
                aria-label={`Remove ${pos.coin.name}`}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-all ml-1 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {showForm && (
            <AddHoldingForm coins={coins} onAdd={handleAdd} onCancel={() => setShowForm(false)} />
          )}
        </div>

        {/* Footer */}
        {!showForm && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm
                bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-lg shadow-violet-500/25"
            >
              <Plus className="w-4 h-4" />
              Add Position
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default memo(PortfolioDrawer);
