import { useState, useMemo, useCallback } from 'react';

export const SORT_FIELDS = {
  RANK: 'rank',
  PRICE: 'current_price',
  CHANGE_24H: 'price_change_percentage_24h',
  MARKET_CAP: 'market_cap',
  VOLUME: 'total_volume',
};

export const useSort = (coins) => {
  const [sortField, setSortField] = useState(SORT_FIELDS.RANK);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = useCallback((field) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      setSortDir(field === SORT_FIELDS.RANK ? 'asc' : 'desc');
      return field;
    });
  }, []);

  const sortedCoins = useMemo(() => {
    if (!coins.length) return coins;
    return [...coins].sort((a, b) => {
      const av = a[sortField] ?? 0;
      const bv = b[sortField] ?? 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [coins, sortField, sortDir]);

  return { sortedCoins, sortField, sortDir, handleSort };
};
