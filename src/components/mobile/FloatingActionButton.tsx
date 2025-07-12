import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Plus, Settings, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  variant?: 'save' | 'add' | 'settings' | 'strategies';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  show?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  variant = 'save',
  onClick,
  disabled = false,
  className,
  show = true
}) => {
  const icons = {
    save: Save,
    add: Plus,
    settings: Settings,
    strategies: TrendingUp
  };

  const Icon = icons[variant];

  const variants = {
    save: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    add: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
    settings: 'bg-muted hover:bg-muted/90 text-muted-foreground',
    strategies: 'bg-success hover:bg-success/90 text-success-foreground'
  };

  if (!show) return null;

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105',
        variants[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      size="icon"
    >
      <Icon className="h-6 w-6" />
    </Button>
  );
};

export default FloatingActionButton;