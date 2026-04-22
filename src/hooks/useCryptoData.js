import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTopCoins } from '../services/cryptoApi';

const REFRESH_INTERVAL = 60000; // 60 seconds

export const useCryptoData = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [flashIds, setFlashIds] = useState(new Set()); // IDs of coins whose price changed
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const prevCoinsRef = useRef({});

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const data = await fetchTopCoins(1, 50);

      // Detect which coins changed price for flash animation
      if (!isInitial && Object.keys(prevCoinsRef.current).length > 0) {
        const changed = new Set();
        data.forEach((coin) => {
          const prev = prevCoinsRef.current[coin.id];
          if (prev && prev !== coin.current_price) {
            changed.add(coin.id);
          }
        });
        if (changed.size > 0) {
          setFlashIds(changed);
          setTimeout(() => setFlashIds(new Set()), 1500);
        }
      }

      // Store current prices for next comparison
      const priceMap = {};
      data.forEach((coin) => { priceMap[coin.id] = coin.current_price; });
      prevCoinsRef.current = priceMap;

      setCoins(data);
      setLastUpdated(new Date());
      setCountdown(REFRESH_INTERVAL / 1000);
    } catch (err) {
      const msg =
        err.response?.status === 429
          ? 'Rate limit reached. Please wait a moment.'
          : err.message || 'Failed to fetch data. Please try again.';
      setError(msg);
    } finally {
      if (isInitial) setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    intervalRef.current = setInterval(() => {
      loadData(false);
    }, REFRESH_INTERVAL);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return REFRESH_INTERVAL / 1000;
        return prev - 1;
      });
    }, 1000);
  }, [loadData]);

  const refresh = useCallback(() => {
    // Reset the auto-poll timer
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
    loadData(false);
    startPolling();
  }, [loadData, startPolling]);

  useEffect(() => {
    loadData(true);
    startPolling();

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [loadData, startPolling]);

  return { coins, loading, error, lastUpdated, countdown, refresh, isRefreshing, flashIds };
};
