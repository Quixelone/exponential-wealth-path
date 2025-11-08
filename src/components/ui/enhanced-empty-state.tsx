import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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
 * Enhanced empty state with smooth animations and better visual hierarchy
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
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = prefersReducedMotion ? {} : staggerContainer;
  const itemVariants = prefersReducedMotion ? {} : staggerItem;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn(
        'flex flex-col items-center justify-center gap-6 py-12 px-4 text-center',
        className
      )}
    >
      {/* Icon or Illustration */}
      {illustration ? (
        <motion.div variants={itemVariants}>
          {illustration}
        </motion.div>
      ) : Icon ? (
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
          <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full">
            <Icon className="h-12 w-12 text-primary" />
          </div>
        </motion.div>
      ) : null}

      {/* Text Content */}
      <motion.div variants={itemVariants} className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </motion.div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-3 mt-2"
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
        </motion.div>
      )}
    </motion.div>
  );
}
