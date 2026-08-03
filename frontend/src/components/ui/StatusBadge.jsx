import React from 'react';
import { cn } from '../../utils/cn';

/**
 * StatusBadge - A pill-shaped status indicator
 */
const StatusBadge = ({ status, variant = 'default', className }) => {
  const variants = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const dotColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    default: 'bg-gray-400',
  };

  let activeVariant = variant;
  if (activeVariant === 'default' && status) {
    const s = status.toLowerCase();
    if (s === 'ongoing' || s === 'live' || s === 'approved' || s === 'active') activeVariant = 'success';
    else if (s === 'upcoming' || s === 'pending') activeVariant = 'warning';
    else if (s === 'paused' || s === 'rejected') activeVariant = 'error';
    else if (s === 'completed' || s === 'inactive') activeVariant = 'default';
  }

  const selectedVariant = variants[activeVariant] || variants.default;
  const selectedDotColor = dotColors[activeVariant] || dotColors.default;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        selectedVariant,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', selectedDotColor)}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
// Vite HMR Refresh
