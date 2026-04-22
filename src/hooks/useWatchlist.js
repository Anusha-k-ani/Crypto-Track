import { useState, useCallback } from 'react';

const LS_KEY = 'crypto-watchlist';

const readLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeLS = (ids) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch { /* quota */ }
};

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState(() => new Set(readLS()));

  const toggle = useCallback((id) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      writeLS([...next]);
      return next;
    });
  }, []);

  const isWatched = useCallback((id) => watchlist.has(id), [watchlist]);

  return { watchlist, toggle, isWatched };
};
