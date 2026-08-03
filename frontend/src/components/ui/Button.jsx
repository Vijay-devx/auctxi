import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ className, variant = "primary", size = "default", children, ...props }, ref) => {
  const variants = {
    primary: "bg-[#f59e0b] text-white hover:bg-[#d97706] shadow-sm",
    black: "bg-[#111111] text-white hover:bg-[#222222] shadow-sm",
    outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-8 text-base",
    icon: "h-10 w-10 justify-center",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { Button };
export default Button;
// Triggers Vite HMR
// Vite HMR Refresh
