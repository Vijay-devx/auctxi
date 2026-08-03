import React, { useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { cn } from '../../utils/cn';

/**
 * DetailPanel - A slide-in right panel overlay
 */
const DetailPanel = ({ isOpen, onClose, title, children, width = 'w-full md:w-[450px]' }) => {
  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-in Panel */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 transform",
          isOpen ? "translate-x-0" : "translate-x-full",
          width
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
};

export default DetailPanel;
// Vite HMR Refresh
