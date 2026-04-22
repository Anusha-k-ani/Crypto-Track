import { useState, useCallback, useMemo } from 'react';

const LS_KEY = 'crypto-portfolio';

const readLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeLS = (holdings) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(holdings));
  } catch { /* quota */ }
};

// holdings: { [coinId]: { amount: number, buyPrice: number } }
export const usePortfolio = (coins) => {
  const [holdings, setHoldings] = useState(() => readLS());

  const addHolding = useCallback((coinId, amount, buyPrice) => {
    setHoldings((prev) => {
      const next = { ...prev, [coinId]: { amount: parseFloat(amount), buyPrice: parseFloat(buyPrice) } };
      writeLS(next);
      return next;
    });
  }, []);

  const removeHolding = useCallback((coinId) => {
    setHoldings((prev) => {
      const next = { ...prev };
      delete next[coinId];
      writeLS(next);
      return next;
    });
  }, []);

  const portfolioStats = useMemo(() => {
    if (!coins || !coins.length) return { totalValue: 0, totalCost: 0, pnl: 0, pnlPct: 0, positions: [] };

    const positions = Object.entries(holdings).map(([id, { amount, buyPrice }]) => {
      const coin = coins.find((c) => c.id === id);
      if (!coin) return null;
      const currentValue = coin.current_price * amount;
      const cost = buyPrice * amount;
      const pnl = currentValue - cost;
      const pnlPct = cost > 0 ? ((pnl / cost) * 100) : 0;
      return { coin, amount, buyPrice, currentValue, cost, pnl, pnlPct };
    }).filter(Boolean);

    const totalValue = positions.reduce((s, p) => s + p.currentValue, 0);
    const totalCost = positions.reduce((s, p) => s + p.cost, 0);
    const pnl = totalValue - totalCost;
    const pnlPct = totalCost > 0 ? ((pnl / totalCost) * 100) : 0;

    return { totalValue, totalCost, pnl, pnlPct, positions };
  }, [holdings, coins]);

  return { holdings, addHolding, removeHolding, portfolioStats };
};
