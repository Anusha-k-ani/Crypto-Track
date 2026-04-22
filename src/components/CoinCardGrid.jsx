import React, { memo } from 'react';
import { CoinCard } from './CoinItem';

const CoinCardGrid = memo(({ coins, onCoinClick, flashIds, watchlist, onWatchlistToggle }) => {
  return (
    <div className="sm:hidden grid grid-cols-1 gap-3">
      {coins.map((coin, i) => (
        <CoinCard
          key={coin.id}
          coin={coin}
          rank={coin.market_cap_rank ?? i + 1}
          onClick={onCoinClick}
          isFlashing={flashIds?.has(coin.id) ?? false}
          isWatched={watchlist?.has(coin.id) ?? false}
          onWatchlistToggle={onWatchlistToggle}
        />
      ))}
    </div>
  );
});

CoinCardGrid.displayName = 'CoinCardGrid';
export default CoinCardGrid;
