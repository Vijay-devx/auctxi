import React, { useState, useRef, useEffect } from 'react';
import { IconDotsVertical } from '@tabler/icons-react';
import { cn } from '../../utils/cn';

/**
 * ActionMenu - A three-dot dropdown menu for table row actions
 */
const ActionMenu = ({ actions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!actions || actions.length === 0) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <IconDotsVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isDanger = action.variant === 'danger';
            
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (action.onClick) action.onClick();
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
                  isDanger 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {Icon && <Icon size={16} />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
// Vite HMR Refresh
