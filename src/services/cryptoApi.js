import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

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
      price_change_percentage: '24h,7d',            // also fetch 7d change
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
