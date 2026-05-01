import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useCryptoData } from './hooks/useCryptoData';
import { useTheme } from './hooks/useTheme';
import { useWatchlist } from './hooks/useWatchlist';
import { usePortfolio } from './hooks/usePortfolio';
import { useToast } from './hooks/useToast';
import { useSort } from './hooks/useSort';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CoinTable from './components/CoinTable';
import CoinCardGrid from './components/CoinCardGrid';
import CoinModal from './components/CoinModal';
import ErrorMessage from './components/ErrorMessage';
import { SkeletonTable, SkeletonCards } from './components/SkeletonLoader';
import MarketSentiment from './components/MarketSentiment';
import TrendingStrip from './components/TrendingStrip';
import PortfolioDrawer from './components/PortfolioDrawer';
import ToastContainer from './components/Toast';
import { Briefcase, Star, List, RefreshCw } from 'lucide-react';

const VIEW_ALL = 'all';
const VIEW_WATCHLIST = 'watchlist';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const { coins, loading, error, lastUpdated, countdown, refresh, isRefreshing, flashIds } = useCryptoData();
  const { watchlist, toggle: toggleWatchlist, isWatched } = useWatchlist();
  const { holdings, addHolding, removeHolding, portfolioStats } = usePortfolio(coins);
  const { toasts, addToast, dismiss } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [view, setView] = useState(VIEW_ALL); // 'all' | 'watchlist'

  // Keyboard shortcut: Cmd/Ctrl+K → focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('crypto-search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Toast for significant price moves on refresh
  useEffect(() => {
    if (!flashIds || flashIds.size === 0 || !coins.length) return;
    const big = coins
      .filter((c) => flashIds.has(c.id) && Math.abs(c.price_change_percentage_24h ?? 0) > 5)
      .slice(0, 2);
    big.forEach((c) => {
      const pct = c.price_change_percentage_24h;
      addToast({
        type: pct >= 0 ? 'up' : 'down',
        title: `${c.name} moved ${pct >= 0 ? '+' : ''}${pct?.toFixed(2)}%`,
        message: `Now trading at $${c.current_price.toLocaleString()}`,
        duration: 5000,
      });
    });
  }, [flashIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stable callbacks — prevents child re-renders caused by new function references
  const handleSearchChange = useCallback((val) => setSearch(val), []);
  const handleCoinClick = useCallback((coin) => setSelectedCoin(coin), []);
  const handleModalClose = useCallback(() => setSelectedCoin(null), []);

  const handleWatchlistToggle = useCallback((id) => {
    const willWatch = !isWatched(id);
    toggleWatchlist(id);
    const coin = coins.find((c) => c.id === id);
    addToast({
      type: willWatch ? 'success' : 'info',
      title: willWatch ? `Added to Watchlist` : `Removed from Watchlist`,
      message: coin?.name ?? id,
      duration: 2500,
    });
  }, [toggleWatchlist, isWatched, coins, addToast]);

  const handleAddToPortfolio = useCallback((coin) => {
    setSelectedCoin(null);
    setPortfolioOpen(true);
    // Small delay so drawer opens then the form can be activated
  }, []);

  // Client-side filtering with useMemo for performance
  const filteredByView = useMemo(() => {
    if (view === VIEW_WATCHLIST) return coins.filter((c) => watchlist.has(c.id));
    return coins;
  }, [view, coins, watchlist]);

  const filteredCoins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filteredByView;
    return filteredByView.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [search, filteredByView]);

  // Sort hook wraps filteredCoins
  const { sortedCoins, sortField, sortDir, handleSort } = useSort(filteredCoins);

  const watchlistCount = watchlist.size;
  const portfolioCount = portfolioStats.positions.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
        lastUpdated={lastUpdated}
        countdown={countdown}
        onRefresh={refresh}
        loading={loading}
        isRefreshing={isRefreshing}
        portfolioCount={portfolioCount}
        onPortfolioOpen={() => setPortfolioOpen(true)}
      />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
            Crypto Markets
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Top 50 cryptocurrencies by market cap · Live via CoinGecko ·{' '}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400">
              ⌘K
            </kbd>
            {' '}
            <span className="hidden sm:inline">to search</span>
          </p>
        </div>

        {/* Market Sentiment */}
        {!loading && !error && coins.length > 0 && (
          <MarketSentiment coins={coins} />
        )}

        {/* Trending Strip */}
        {!loading && !error && coins.length > 0 && (
          <TrendingStrip coins={coins} />
        )}

        {/* Search + View Tabs + Stats Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchBar value={search} onChange={handleSearchChange} />
            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setView(VIEW_ALL)}
                aria-pressed={view === VIEW_ALL}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${view === VIEW_ALL
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                <List className="w-3 h-3" />
                All
              </button>
              <button
                onClick={() => setView(VIEW_WATCHLIST)}
                aria-pressed={view === VIEW_WATCHLIST}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${view === VIEW_WATCHLIST
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                <Star className={`w-3 h-3 ${view === VIEW_WATCHLIST ? 'fill-amber-400 text-amber-400' : ''}`} />
                Watchlist
                {watchlistCount > 0 && (
                  <span className="ml-1 min-w-[16px] h-4 flex items-center justify-center bg-amber-400 text-white rounded-full text-[9px] font-black px-1">
                    {watchlistCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {!loading && !error && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 shrink-0">
              <span className="font-semibold text-slate-900 dark:text-white">{sortedCoins.length}</span>
              <span>of {coins.length} assets</span>
              {isRefreshing && (
                <span className="flex items-center gap-1 text-violet-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce inline-block" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce inline-block" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce inline-block" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content States */}
        {loading && (
          <>
            <SkeletonTable count={10} />
            <SkeletonCards count={6} />
          </>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-100 dark:border-red-900/40 bg-white dark:bg-slate-900">
            <ErrorMessage message={error} onRetry={refresh} />
          </div>
        )}

        {/* Empty watchlist state */}
        {!loading && !error && view === VIEW_WATCHLIST && watchlistCount === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No watchlist yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Click the <span className="text-amber-400 font-bold">★</span> icon on any coin to add it to your watchlist.
            </p>
            <button
              onClick={() => setView(VIEW_ALL)}
              className="text-sm text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              Browse all assets
            </button>
          </div>
        )}

        {!loading && !error && view !== VIEW_WATCHLIST && sortedCoins.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              No cryptocurrencies match <strong>"{search}"</strong>
            </p>
            <button
              onClick={() => setSearch('')}
              className="text-sm text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {!loading && !error && sortedCoins.length > 0 && (
          <>
            <CoinTable
              coins={sortedCoins}
              onCoinClick={handleCoinClick}
              flashIds={flashIds}
              watchlist={watchlist}
              onWatchlistToggle={handleWatchlistToggle}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
            <CoinCardGrid
              coins={sortedCoins}
              onCoinClick={handleCoinClick}
              flashIds={flashIds}
              watchlist={watchlist}
              onWatchlistToggle={handleWatchlistToggle}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-600">
          Data provided by{' '}
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 font-semibold transition-colors"
          >
            CoinGecko
          </a>{' '}
          · Refreshes every 1 min · Prices in USD
        </p>
      </footer>

      {/* Deep Insights Modal */}
      {selectedCoin && (
        <CoinModal
          coin={selectedCoin}
          onClose={handleModalClose}
          isWatched={isWatched(selectedCoin.id)}
          onWatchlistToggle={handleWatchlistToggle}
          onAddToPortfolio={handleAddToPortfolio}
        />
      )}

      {/* Portfolio Drawer */}
      <PortfolioDrawer
        isOpen={portfolioOpen}
        onClose={() => setPortfolioOpen(false)}
        portfolioStats={portfolioStats}
        coins={coins}
        addHolding={addHolding}
        removeHolding={removeHolding}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

export default App;
