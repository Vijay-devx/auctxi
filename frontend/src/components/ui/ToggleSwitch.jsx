import React from 'react';
import { cn } from '../../utils/cn';

/**
 * ToggleSwitch - An on/off toggle switch component
 */
const ToggleSwitch = ({ 
  enabled, 
  onChange, 
  label, 
  description,
  disabled = false
}) => {
  return (
    <div className="flex items-start justify-between py-4">
      <div className="flex flex-col pr-8">
        <span className={cn("text-sm font-semibold", disabled ? "text-gray-400" : "text-gray-900")}>
          {label}
        </span>
        {description && (
          <span className="mt-1 text-xs text-gray-500">{description}</span>
        )}
      </div>
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
          enabled ? "bg-amber-500" : "bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        role="switch"
        aria-checked={enabled}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            enabled ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
// Vite HMR Refresh
