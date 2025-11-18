import React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className }) => {
  return (
    <div 
      className={cn(
        "grid gap-4 md:gap-6",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        "auto-rows-[minmax(200px,auto)]",
        "perspective-container",
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'wide' | 'tall' | 'xl';
  variant?: 'glass' | 'solid' | 'gradient';
  interactive?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({ 
  children, 
  className,
  size = 'md',
  variant = 'glass',
  interactive = true
}) => {
  const sizeClasses = {
    sm: 'md:col-span-1 md:row-span-1',
    md: 'md:col-span-1 md:row-span-1',
    lg: 'md:col-span-2 md:row-span-1',
    wide: 'md:col-span-2 lg:col-span-3 md:row-span-1',
    tall: 'md:col-span-1 md:row-span-2',
    xl: 'md:col-span-2 md:row-span-2',
  };

  const variantClasses = {
    glass: 'glass-card',
    solid: 'bg-card',
    gradient: 'bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5',
  };

  return (
    <div
      className={cn(
        "relative rounded-xl p-6 overflow-hidden",
        "border border-border/50",
        "transition-all duration-300 ease-out",
        interactive && "tilt-card hover:border-primary/30 glow-hover cursor-pointer",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
};
