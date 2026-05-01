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

export const fetchTopCoins = async (page = 1, perPage = 50) => {
  const response = await api.get('/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: perPage,
      page,
      sparkline: true,                              // 7-day sparkline data
      price_change_percentage: '24h,7d',            // also fetches 7d change
    },
  });
  return response.data;
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
  }).finally(() => {
    inflightChartRequests.delete(cacheKey);
  });

  inflightChartRequests.set(cacheKey, requestPromise);
  return requestPromise;
};
