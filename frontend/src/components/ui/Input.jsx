import React from 'react';

export function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        {...props}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
      />
    </div>
  );
}
// Vite HMR Refresh
