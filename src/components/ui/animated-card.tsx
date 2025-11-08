import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { hoverLift, hoverScale } from '@/utils/animations';

interface AnimatedCardProps extends CardProps {
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  clickable?: boolean;
  children?: React.ReactNode;
}

/**
 * Animated card with smooth hover effects
 * Supports lift, scale, and glow animations
 */
export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ hoverEffect = 'lift', clickable = false, className, children, variant, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    // Don't animate if user prefers reduced motion
    if (prefersReducedMotion || hoverEffect === 'none') {
      return (
        <Card ref={ref} variant={variant} className={className} {...props}>
          {children}
        </Card>
      );
    }

    const getHoverAnimation = () => {
      switch (hoverEffect) {
        case 'lift':
          return hoverLift;
        case 'scale':
          return hoverScale;
        case 'glow':
          return {
            whileHover: {
              boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.4)',
              transition: { duration: 0.3 },
            },
          };
        default:
          return {};
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'transition-colors duration-200',
          clickable && 'cursor-pointer'
        )}
        {...getHoverAnimation()}
      >
        <Card variant={variant} className={className} {...props}>
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';
