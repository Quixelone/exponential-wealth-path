import React from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends CardProps {
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  clickable?: boolean;
  children?: React.ReactNode;
}

/**
 * Animated card with smooth hover effects using CSS
 * Supports lift, scale, and glow animations
 */
export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ hoverEffect = 'lift', clickable = false, className, children, variant, ...props }, ref) => {
    const getHoverClass = () => {
      switch (hoverEffect) {
        case 'lift':
          return 'hover:-translate-y-0.5 hover:shadow-md';
        case 'scale':
          return 'hover:scale-[1.01]';
        case 'glow':
          return 'hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)_/_0.3)]';
        default:
          return '';
      }
    };

    return (
      <Card 
        ref={ref}
        variant={variant}
        className={cn(
          'transition-all duration-300 ease-out',
          clickable && 'cursor-pointer',
          hoverEffect !== 'none' && getHoverClass(),
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';
