
import React from 'react';

interface ClaimProps {
  variant?: 'main' | 'social' | 'short';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Claim: React.FC<ClaimProps> = ({ 
  variant = 'main', 
  size = 'md',
  className = '' 
}) => {
  const claims = {
    main: "Trasforma i tuoi sogni in investimenti intelligenti",
    social: "Il futuro finanziario che meriti, oggi",
    short: "Investimenti intelligenti"
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`${className}`}>
      <p className={`text-slate-600 font-medium ${sizeClasses[size]} leading-relaxed tracking-wide`}>
        {claims[variant]}
      </p>
      {variant === 'main' && (
        <div className="flex items-center justify-center mt-2 space-x-1">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      )}
    </div>
  );
};

export default Claim;
