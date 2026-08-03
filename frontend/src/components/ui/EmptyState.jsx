import React from 'react';
import { IconSearch } from '@tabler/icons-react';
import { cn } from '../../utils/cn';

/**
 * EmptyState - Placeholder for empty data views
 */
const EmptyState = ({ 
  icon: Icon = IconSearch, 
  title = 'No results found', 
  description = 'We couldn\'t find any records matching your criteria.',
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
        <Icon size={32} stroke={1.5} />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-[#222222] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
// Vite HMR Refresh
