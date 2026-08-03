import React from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { cn } from '../../utils/cn';

/**
 * Pagination - Component for paginating data tables
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
}) => {
  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-900">{startItem}</span> to{' '}
        <span className="font-medium text-gray-900">{endItem}</span> of{' '}
        <span className="font-medium text-gray-900">{totalItems}</span> results
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <IconChevronLeft size={16} />
        </button>
        
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="flex h-8 w-8 items-center justify-center text-gray-400">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
                  currentPage === page
                    ? "bg-[#111111] text-white"
                    : "border border-transparent text-gray-600 hover:bg-gray-100"
                )}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
// Vite HMR Refresh
