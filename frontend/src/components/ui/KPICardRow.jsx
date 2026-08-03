import React from 'react';
import { cn } from '../../utils/cn';

/**
 * KPICardRow - A responsive grid container for KPICards
 */
const KPICardRow = ({ children, className }) => {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mb-6", className)}>
      {children}
    </div>
  );
};

export default KPICardRow;
// Vite HMR Refresh
