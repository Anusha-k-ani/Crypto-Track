import axios from 'axios';

const BASE_URL = import.meta.env.DEV
  ? '/api/coingecko'
  : 'https://api.coingecko.com/api/v3';
/** Long TTL reduces repeat market_chart calls (CoinGecko free tier is strict). */
const CHART_CACHE_TTL_MS = 15 * 60 * 1000;
const chartCache = new Map();
const inflightChartRequests = new Map();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

/** At most one real HTTP call to /coins/markets per minute (CoinGecko free tier). */
const MARKETS_THROTTLE_MS = 60 * 1000;
let marketsLastFetchAt = 0;
let marketsCachedData = null;
let marketsInflight = null;

export const fetchTopCoins = async (page = 1, perPage = 50) => {
  const now = Date.now();
  if (
    marketsCachedData != null
    && (now - marketsLastFetchAt) < MARKETS_THROTTLE_MS
  ) {
    return marketsCachedData;
  }

  if (marketsInflight) {
    return marketsInflight;
  }

  marketsInflight = api
    .get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page,
        sparkline: true,
        price_change_percentage: '24h,7d',
      },
    })
    .then((response) => {
      marketsCachedData = response.data;
      marketsLastFetchAt = Date.now();
      return response.data;
    })
    .catch((err) => {
      if (marketsCachedData != null) {
        return marketsCachedData;
      }
      throw err;
    })
    .finally(() => {
      marketsInflight = null;
    });

  return marketsInflight;
};

export const fetchCoinDetails = async (id) => {
  const response = await api.get(`/coins/${id}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
    },
  });
  return response.data;
};

export const fetchCoinChartData = async (id, days = 7) => {
  const cacheKey = `${id}:${days}`;
  const cached = chartCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CHART_CACHE_TTL_MS) {
    return cached.data;
  }

  if (inflightChartRequests.has(cacheKey)) {
    return inflightChartRequests.get(cacheKey);
  }

  const requestPromise = api.get(`/coins/${id}/market_chart`, {
    params: {
      vs_currency: 'usd',
      days,
      interval: days <= 1 ? 'hourly' : 'daily',
    },
  }).then((response) => {
    const prices = response.data?.prices ?? [];
    chartCache.set(cacheKey, { data: prices, timestamp: Date.now() });
    return prices;
  }).catch((err) => {
    const stale = chartCache.get(cacheKey);
    if (stale?.data?.length > 1) {
      return stale.data;
    }
    throw err;
  }).finally(() => {
    inflightChartRequests.delete(cacheKey);
  });

  inflightChartRequests.set(cacheKey, requestPromise);
  return requestPromise;
};
