import React from 'react';
import { Link } from 'react-router-dom';
import { IconCalendar, IconBell, IconChevronDown } from '@tabler/icons-react';
import { cn } from '../../utils/cn';

/**
 * PageHeader — Reusable page header with title, breadcrumbs, and action buttons
 */
const PageHeader = ({
  title,
  breadcrumbs = [],
  actionLabel,
  actionIcon: ActionIcon,
  actionPath,
  onAction,
  notificationCount = 0,
  showDatePicker = false,
  showNotification = false,
  date,
  onDateChange,
  className = "mb-6",
}) => {
  const defaultDate = new Date().toISOString().split('T')[0];
  const displayDate = date !== undefined ? date : defaultDate;
  return (
    <div className={`flex flex-col gap-4 sm:gap-8 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      {/* Left — Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mt-0.5 text-[13px] text-gray-500">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-400 mx-1">&gt;</span>}
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-gray-700 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-400">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right — Date, Notifications, Action */}
      <div className="flex items-center gap-3 mt-3 sm:mt-0">
        {showDatePicker && (
          <input
            type="date"
            value={displayDate.match(/^\d{4}-\d{2}-\d{2}$/) ? displayDate : ''}
            onChange={(e) => onDateChange && onDateChange(e.target.value)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b] cursor-pointer"
          />
        )}

        {showNotification && (
          <button className="relative rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
            <IconBell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        )}

        {actionLabel && actionPath ? (
          <Link
            to={actionPath}
            className="flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-[#222222] transition-colors shadow-sm"
          >
            {ActionIcon && <ActionIcon size={16} />}
            {actionLabel}
          </Link>
        ) : actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-[#222222] transition-colors shadow-sm"
          >
            {ActionIcon && <ActionIcon size={16} />}
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default PageHeader;
// Vite HMR Refresh
