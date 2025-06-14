
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'success' | 'warning' | 'info' | 'danger';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  color = 'success',
  className = ''
}) => {
  const gradientClasses = {
    success: 'success-gradient',
    warning: 'warning-gradient',
    info: 'info-gradient',
    danger: 'danger-gradient'
  };

  // Use CSS variables for text colors to align with the theme
  const textColors = {
    success: 'text-[hsl(var(--success-base))]',
    warning: 'text-[hsl(var(--warning-base))]',
    info: 'text-[hsl(var(--info-base))]',
    danger: 'text-[hsl(var(--danger-base))]' // Corresponds to --destructive
  };

  return (
    <div className={`stat-card group ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label mb-2">{title}</p>
          <p className={`stat-number ${textColors[color]} mb-1`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradientClasses[color]} shadow-lg group-hover:shadow-xl transition-shadow`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      
      {trend !== 'neutral' && (
        <div className="mt-4 flex items-center">
          <div className={`text-xs px-2 py-1 rounded-full ${
            trend === 'up' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {trend === 'up' ? '↗' : '↘'} Trend
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
