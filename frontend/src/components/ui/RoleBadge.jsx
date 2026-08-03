import React from 'react';
import { cn } from '../../utils/cn';

/**
 * RoleBadge - A badge specifically for user roles
 */
const RoleBadge = ({ role, className }) => {
  // Normalize role string (handle ROLE_ADMIN or just Admin)
  const normalizedRole = role?.replace('ROLE_', '').toLowerCase() || '';

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = role;

  if (normalizedRole.includes('admin')) {
    styles = 'bg-amber-100 text-amber-700 border-amber-200';
    label = 'Super Admin';
  } else if (normalizedRole.includes('manager')) {
    styles = 'bg-blue-100 text-blue-700 border-blue-200';
    label = 'Manager';
  } else if (normalizedRole.includes('client')) {
    styles = 'bg-green-100 text-green-700 border-green-200';
    label = 'Client';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        styles,
        className
      )}
    >
      {label}
    </span>
  );
};

export default RoleBadge;
// Vite HMR Refresh
