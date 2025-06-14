
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
    <p className={`text-muted-foreground ${sizeClasses[size]} ${className}`}>
      {claims[variant]}
    </p>
  );
};

export default Claim;
