import React from 'react';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import { cn } from '../../utils/cn';

/**
 * COMPONENT EXECUTION FLOW: SearchFilterBar
 * ---------------------------------------------------------
 * This is a highly reusable "dumb" component. It doesn't actually filter data itself.
 * It just renders the UI and triggers the `onSearchChange` or `filter.onChange` functions
 * passed down by the parent page (e.g., PlayersList.jsx). The parent page holds the 
 * actual state and performs the array filtering.
 */
const SearchFilterBar = ({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filters = [],
  onClearFilters,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-end">
      
      {/* 
        COMPONENT 1: Search Input 
        As the user types, onChange triggers onSearchChange instantly, updating the parent's state.
      */}
      <div className="flex-1">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <IconSearch size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* 
        COMPONENT 2: Dynamic Dropdown Filters 
        Loops through the `filters` array passed by the parent and generates a <select> for each.
      */}
      <div className="flex flex-1 flex-wrap items-end gap-3 md:flex-nowrap">
        {filters.map((filter, index) => (
          <div key={index} className="flex min-w-[120px] flex-1 flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {filter.label}
            </label>
            <div className="relative">
              <select
                className="block w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={filter.value}
                onChange={(e) => filter.onChange && filter.onChange(e.target.value)}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        ))}

        {/* Clear Filters Button (Only renders if parent provides onClearFilters function) */}
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <IconRefresh size={16} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;
// Vite HMR Refresh
