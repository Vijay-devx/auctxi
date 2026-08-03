import React from 'react';
import { cn } from '../../utils/cn';
import { IconChevronDown } from '@tabler/icons-react';

/**
 * ChartCard - A wrapper card for Recharts charts
 */
const ChartCard = ({ 
  title, 
  timeRanges = ['This Week', 'This Month', 'This Year', 'All Time'],
  selectedRange,
  onRangeChange,
  children,
  className
}) => {
  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col h-full", className)}>
      <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        
        {timeRanges && timeRanges.length > 0 && onRangeChange && (
          <div className="relative">
            <select
              value={selectedRange}
              onChange={(e) => onRangeChange(e.target.value)}
              className="appearance-none rounded-md border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-gray-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {timeRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <IconChevronDown size={14} />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 p-5">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
// Vite HMR Refresh
