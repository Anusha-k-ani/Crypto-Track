import React, { memo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { CoinRow } from './CoinItem';
import { SORT_FIELDS } from '../hooks/useSort';

const SortIcon = memo(({ field, sortField, sortDir }) => {
  if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-violet-500 ml-1 inline" />
    : <ChevronDown className="w-3 h-3 text-violet-500 ml-1 inline" />;
});
SortIcon.displayName = 'SortIcon';

const Th = memo(({ children, field, sortField, sortDir, onSort, className = '' }) => {
  const active = sortField === field;
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none
        transition-colors hover:text-violet-600 dark:hover:text-violet-400
        ${active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}
        ${className}`}
      onClick={() => onSort(field)}
      aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {children}
      <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
    </th>
  );
});
Th.displayName = 'Th';

const CoinTable = memo(({ coins, onCoinClick, flashIds, watchlist, onWatchlistToggle, sortField, sortDir, onSort }) => {
  return (
    <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-10">
              ★
            </th>
            <Th field={SORT_FIELDS.RANK} sortField={sortField} sortDir={sortDir} onSort={onSort} className="text-left">
              #
            </Th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Asset
            </th>
            <Th field={SORT_FIELDS.PRICE} sortField={sortField} sortDir={sortDir} onSort={onSort} className="text-right">
              Price
            </Th>
            <Th field={SORT_FIELDS.CHANGE_24H} sortField={sortField} sortDir={sortDir} onSort={onSort} className="text-right">
              24h %
            </Th>
            <Th field={SORT_FIELDS.MARKET_CAP} sortField={sortField} sortDir={sortDir} onSort={onSort} className="text-right hidden md:table-cell">
              Market Cap
            </Th>
            <Th field={SORT_FIELDS.VOLUME} sortField={sortField} sortDir={sortDir} onSort={onSort} className="text-right hidden lg:table-cell">
              Volume
            </Th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin, i) => (
            <CoinRow
              key={coin.id}
              coin={coin}
              rank={coin.market_cap_rank ?? i + 1}
              onClick={onCoinClick}
              isFlashing={flashIds?.has(coin.id) ?? false}
              isWatched={watchlist?.has(coin.id) ?? false}
              onWatchlistToggle={onWatchlistToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

CoinTable.displayName = 'CoinTable';
export default CoinTable;
