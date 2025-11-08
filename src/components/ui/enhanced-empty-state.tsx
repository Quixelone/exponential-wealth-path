import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  illustration?: React.ReactNode;
}

/**
 * Enhanced empty state with smooth CSS animations and better visual hierarchy
 * Supports primary and secondary actions
 */
export function EnhancedEmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  illustration,
}: EnhancedEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 py-12 px-4 text-center animate-fade-in',
        className
      )}
    >
      {/* Icon or Illustration */}
      {illustration ? (
        <div className="animate-scale-in">
          {illustration}
        </div>
      ) : Icon ? (
        <div className="relative animate-scale-in">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
          <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full">
            <Icon className="h-12 w-12 text-primary" />
          </div>
        </div>
      ) : null}

      {/* Text Content */}
      <div className="space-y-3 max-w-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-xl font-semibold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div
          className="flex flex-col sm:flex-row items-center gap-3 mt-2 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size="lg"
              className="min-w-[160px]"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="lg"
              className="min-w-[160px]"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
