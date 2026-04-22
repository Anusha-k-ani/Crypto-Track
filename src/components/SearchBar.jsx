import React, { memo } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = memo(({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        id="crypto-search"
        type="text"
        placeholder="Search by name or symbol..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full pl-10 pr-9 py-2.5 text-sm rounded-xl
          bg-slate-100 dark:bg-slate-800/60
          border border-transparent focus:border-violet-500
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400
          outline-none transition-all duration-200
          focus:ring-2 focus:ring-violet-500/20
        "
        aria-label="Search cryptocurrencies"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
export default SearchBar;
