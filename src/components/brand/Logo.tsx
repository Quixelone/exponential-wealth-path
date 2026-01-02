
import React from 'react';
import btcWheelLogo from '@/assets/btc-wheel-logo.png';

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
      icon: 'w-8 h-8',
      text: 'text-lg',
      container: 'gap-2'
    },
    md: {
      icon: 'w-10 h-10',
      text: 'text-xl',
      container: 'gap-3'
    },
    lg: {
      icon: 'w-16 h-16',
      text: 'text-3xl',
      container: 'gap-4'
    },
    xl: {
      icon: 'w-20 h-20',
      text: 'text-4xl',
      container: 'gap-5'
    }
  };

  const currentSize = sizeClasses[size];

  const iconElement = (
    <div className={`relative ${currentSize.icon} flex items-center justify-center`}>
      <img 
        src={btcWheelLogo} 
        alt="BTCWheel Logo" 
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </div>
  );

  const textElement = (
    <div className={variant === 'vertical' ? 'text-center' : ''}>
      <div className="flex flex-col">
        <span className={`font-bold text-foreground ${currentSize.text} tracking-tight`}>
          BTC
        </span>
        <span className={`font-light bg-gradient-to-r from-dashboard-accent-green to-dashboard-accent-teal bg-clip-text text-transparent ${currentSize.text} tracking-wide -mt-1`}>
          Wheel
        </span>
      </div>
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
