import React from 'react';

const SkeletonRow = () => (
  <tr className="border-b border-slate-100 dark:border-slate-800/60">
    <td className="px-4 py-3.5">
      <div className="w-6 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </td>
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
        <div className="space-y-1.5">
          <div className="w-24 h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="w-10 h-2.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    </td>
    <td className="px-4 py-3.5">
      <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-auto" />
    </td>
    <td className="px-4 py-3.5">
      <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse ml-auto" />
    </td>
    <td className="px-4 py-3.5 hidden md:table-cell">
      <div className="w-28 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-auto" />
    </td>
  </tr>
);

const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
      <div className="space-y-1.5 flex-1">
        <div className="w-28 h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="w-12 h-2.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
      <div className="w-14 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="w-16 h-2.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="w-20 h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonTable = ({ count = 10 }) => (
  <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 w-12">#</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500">Asset</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 dark:text-slate-500">Price</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 dark:text-slate-500">24h %</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 dark:text-slate-500 hidden md:table-cell">Market Cap</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(count)].map((_, i) => <SkeletonRow key={i} />)}
      </tbody>
    </table>
  </div>
);

export const SkeletonCards = ({ count = 6 }) => (
  <div className="sm:hidden grid grid-cols-1 gap-3">
    {[...Array(count)].map((_, i) => <SkeletonCard key={i} />)}
  </div>
);
