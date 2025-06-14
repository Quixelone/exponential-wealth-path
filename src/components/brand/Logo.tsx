
import React from 'react';

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

  // Modern geometric SVG icon
  const iconElement = (
    <div className={`relative ${currentSize.icon} flex items-center justify-center`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
          </filter>
        </defs>
        
        {/* Background circle with gradient */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="url(#primaryGradient)" 
          filter="url(#shadow)"
          className="animate-pulse-gentle"
        />
        
        {/* Dynamic geometric shapes */}
        <g className="animate-pulse-gentle">
          {/* Rising bars representing growth */}
          <rect x="25" y="65" width="8" height="15" fill="white" opacity="0.9" rx="2" />
          <rect x="35" y="55" width="8" height="25" fill="white" opacity="0.9" rx="2" />
          <rect x="45" y="45" width="8" height="35" fill="white" opacity="0.9" rx="2" />
          <rect x="55" y="35" width="8" height="45" fill="white" opacity="0.9" rx="2" />
          <rect x="65" y="25" width="8" height="55" fill="white" opacity="0.9" rx="2" />
        </g>
        
        {/* Trend line */}
        <path 
          d="M 20 70 Q 35 60 50 50 Q 65 40 80 30" 
          stroke="white" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Arrow head */}
        <polygon 
          points="78,25 85,30 78,35" 
          fill="white" 
          opacity="0.9"
        />
        
        {/* Decorative dots */}
        <circle cx="30" cy="40" r="2" fill="url(#accentGradient)" opacity="0.7" />
        <circle cx="70" cy="60" r="2" fill="url(#accentGradient)" opacity="0.7" />
        <circle cx="60" cy="20" r="1.5" fill="white" opacity="0.6" />
      </svg>
    </div>
  );

  const textElement = (
    <div className={variant === 'vertical' ? 'text-center' : ''}>
      <div className="flex flex-col">
        <span className={`font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent ${currentSize.text} tracking-tight`}>
          Finanza
        </span>
        <span className={`font-light bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${currentSize.text} tracking-wide -mt-1`}>
          Creativa
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
