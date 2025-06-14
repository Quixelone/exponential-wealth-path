
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface LogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'horizontal', 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: {
      icon: 'w-6 h-6',
      text: 'text-lg',
      container: 'gap-2'
    },
    md: {
      icon: 'w-8 h-8',
      text: 'text-xl',
      container: 'gap-3'
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-2xl',
      container: 'gap-4'
    },
    xl: {
      icon: 'w-16 h-16',
      text: 'text-3xl',
      container: 'gap-4'
    }
  };

  const currentSize = sizeClasses[size];

  const iconElement = (
    <div className={`bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center ${currentSize.icon}`}>
      <TrendingUp className={`text-white ${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-8 w-8'}`} />
    </div>
  );

  const textElement = (
    <div className={variant === 'vertical' ? 'text-center' : ''}>
      <span className={`font-bold text-foreground ${currentSize.text}`}>
        Finanza
      </span>
      <span className={`font-light text-primary ml-1 ${currentSize.text}`}>
        Creativa
      </span>
    </div>
  );

  if (variant === 'icon-only') {
    return <div className={className}>{iconElement}</div>;
  }

  return (
    <div className={`flex items-center ${variant === 'vertical' ? 'flex-col' : 'flex-row'} ${currentSize.container} ${className}`}>
      {iconElement}
      {textElement}
    </div>
  );
};

export default Logo;
