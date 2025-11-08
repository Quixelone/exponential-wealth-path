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
          return 'hover:-translate-y-1';
        case 'scale':
          return 'hover:scale-[1.02]';
        case 'glow':
          return 'hover:shadow-[0_10px_40px_-10px_hsl(var(--primary)_/_0.4)]';
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
