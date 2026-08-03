import React from 'react';
import { cn } from '../../utils/cn';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

/**
 * KPICard - A stat card displaying a key performance indicator
 */
const KPICard = ({
  title,
  value,
  trend,
  trendLabel = 'vs last month',
  icon: IconOrElement,
  iconBgColor = 'bg-amber-100',
  iconColor = 'text-amber-600',
  onClick
}) => {
  // Parse trend data to handle object, string, and number variations
  let trendValue, isPositive, isNegative, label = trendLabel;
  
  if (typeof trend === 'object' && trend !== null) {
    trendValue = trend.value;
    isPositive = trend.isPositive !== undefined ? trend.isPositive : (String(trendValue).startsWith('+') || parseFloat(trendValue) > 0);
    isNegative = trend.isPositive !== undefined ? !trend.isPositive : (String(trendValue).startsWith('-') || parseFloat(trendValue) < 0);
    if (trend.label) label = trend.label;
  } else if (typeof trend === 'string') {
    trendValue = trend;
    isPositive = trend.startsWith('+');
    isNegative = trend.startsWith('-');
  } else if (typeof trend === 'number') {
    trendValue = `${Math.abs(trend)}%`;
    isPositive = trend > 0;
    isNegative = trend < 0;
  }

  return (
    <div 
      className={cn(
        "flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all",
        "hover:shadow-md",
        onClick ? "cursor-pointer hover:border-amber-300 hover:-translate-y-0.5" : ""
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between w-full min-w-0">
        <div className="flex items-center gap-3 w-full min-w-0">
          {IconOrElement && (
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', iconBgColor)}>
              {React.isValidElement(IconOrElement) ? (
                // If it's a JSX element like <IconTrophy />
                React.cloneElement(IconOrElement, {
                  className: cn(iconColor, IconOrElement.props.className),
                  stroke: 1.5,
                  size: IconOrElement.props.size || 24
                })
              ) : (
                // If it's a component reference like IconTrophy
                <IconOrElement size={24} className={iconColor} stroke={1.5} />
              )}
            </div>
          )}
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="text-sm font-medium text-gray-500 truncate" title={typeof title === 'string' ? title : undefined}>{title}</span>
            <span 
              className="mt-1 text-2xl font-bold tracking-tight text-gray-900 truncate" 
              title={typeof value === 'string' || typeof value === 'number' ? String(value) : undefined}
            >
              {value}
            </span>
          </div>
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'flex items-center font-semibold',
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {isPositive && <IconTrendingUp size={14} className="mr-0.5" />}
            {isNegative && <IconTrendingDown size={14} className="mr-0.5" />}
            {trendValue}
          </span>
          <span className="text-gray-500">{label}</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
// Vite HMR Refresh
