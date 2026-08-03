import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Loading skeletons for various UI components
 */

export const SkeletonCard = ({ className }) => (
  <div className={cn("rounded-xl border border-gray-100 bg-white p-5 shadow-sm animate-pulse", className)}>
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-xl bg-gray-200"></div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-20 rounded bg-gray-200"></div>
        <div className="h-6 w-16 rounded bg-gray-200"></div>
      </div>
    </div>
    <div className="mt-4 h-4 w-32 rounded bg-gray-100"></div>
  </div>
);

export const SkeletonText = ({ lines = 3, className }) => (
  <div className={cn("flex flex-col gap-2 animate-pulse", className)}>
    {[...Array(lines)].map((_, i) => (
      <div 
        key={i} 
        className={cn(
          "h-4 rounded bg-gray-200", 
          i === lines - 1 ? "w-2/3" : "w-full"
        )}
      ></div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5, className }) => (
  <div className={cn("rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden animate-pulse", className)}>
    <div className="h-12 bg-gray-50 border-b border-gray-100"></div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex h-16 items-center px-6 border-b border-gray-50">
        {[...Array(cols)].map((_, j) => (
          <div 
            key={j} 
            className={cn(
              "h-4 bg-gray-200 rounded", 
              j === 0 ? "w-1/4" : "w-1/6 ml-8"
            )}
          ></div>
        ))}
      </div>
    ))}
  </div>
);
// Vite HMR Refresh
